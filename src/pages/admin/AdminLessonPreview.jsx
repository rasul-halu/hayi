import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  RefreshCw,
  XCircle
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BuildSentenceQuestion from "../../components/lesson/BuildSentenceQuestion";
import CharacterImage from "../../components/lesson/CharacterImage";
import FillBlankQuestion from "../../components/lesson/FillBlankQuestion";
import MatchQuestion from "../../components/lesson/MatchQuestion";
import ListeningQuestion from "../../components/lesson/ListeningQuestion";
import QuestionImage from "../../components/lesson/QuestionImage";
import TranslateQuestion from "../../components/lesson/TranslateQuestion";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import ProgressBar from "../../components/ui/ProgressBar";
import {
  getAdminLessonPreview,
  hasTelegramAuthData
} from "../../api/apiClient";
import { normalizeNewWords } from "../../utils/highlightNewWords";

const QUESTION_COMPONENTS = {
  translate: TranslateQuestion,
  "multiple-choice": TranslateQuestion,
  multipleChoice: TranslateQuestion,
  match: MatchQuestion,
  listening: ListeningQuestion,
  fillBlank: FillBlankQuestion,
  buildSentence: BuildSentenceQuestion
};

function normalizePreviewQuestion(question) {
  return {
    ...question,
    question: question.question || question.translation || "",
    sentence: question.sentence || question.metadata?.sentence || "",
    answers: question.answers || question.options || [],
    correct: question.correct || question.correctAnswer || "",
    pairs: question.pairs || [],
    words: question.words || [],
    newWords: question.newWords || [],
    targetSentence: question.targetSentence || question.metadata?.targetSentence,
    characterImage: question.characterImage,
  };
}

function normalizePreviewLesson(lesson) {
  return {
    ...lesson,
    questions: (lesson.questions || []).map(normalizePreviewQuestion),
  };
}

function isEmptyAnswer(value) {
  return value === null ||
    value === undefined ||
    value === "";
}

function getCorrectAnswerText(question) {
  if (!question) {
    return "";
  }

  if (question.type === "match" && Array.isArray(question.pairs)) {
    return question.pairs
      .map(pair => `${pair.word || pair.left} - ${pair.translation || pair.right}`)
      .join("\n");
  }

  return question.targetSentence || question.correct || "";
}

function StateCard({
  title,
  text,
  children
}) {
  return (
    <PageContainer style={{ background: "#F4F7F2", color: "#2D2D2D" }}>
      <AppCard
        style={{
          background: "#FFFFFF",
          color: "#2D2D2D",
          border: "2px solid #E6E6E6",
          boxShadow: "0 7px 0 #D9D9D9",
          textAlign: "center",
          marginTop: 24
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
          {title}
        </h1>
        {text ? (
          <p style={{ color: "#6F746B", fontWeight: 800, lineHeight: 1.4 }}>
            {text}
          </p>
        ) : null}
        {children}
      </AppCard>
    </PageContainer>
  );
}

export default function AdminLessonPreview() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const isTelegramMode = hasTelegramAuthData();
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(isTelegramMode);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedbackStatus, setFeedbackStatus] = useState("idle");
  const [hint, setHint] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const correctTimerRef = useRef(null);

  const loadPreview = useCallback(async () => {
    if (!isTelegramMode) {
      setIsLoading(false);
      setError("Админский предпросмотр доступен только внутри Telegram.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminLessonPreview(lessonId);
      setLesson(normalizePreviewLesson(data.lesson));
      setQuestionIndex(0);
      setSelected(null);
      setFeedbackStatus("idle");
      setHint("");
      setIsComplete(false);
    } catch (previewError) {
      setLesson(null);
      setError(
        previewError.status === 403
          ? "У вас нет доступа к предпросмотру."
          : previewError.status === 401
            ? "Войдите через Telegram, чтобы открыть предпросмотр."
            : previewError.status === 404
              ? "Урок не найден."
              : "Не удалось загрузить предпросмотр."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isTelegramMode, lessonId]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  useEffect(() => () => {
    if (correctTimerRef.current) {
      clearTimeout(correctTimerRef.current);
    }
  }, []);

  const questions = lesson?.questions || [];
  const question = questions[questionIndex];
  const QuestionComponent = question ? QUESTION_COMPONENTS[question.type] : null;
  const progress = questions.length > 0
    ? (questionIndex / questions.length) * 100
    : 0;
  const feedbackLocked = feedbackStatus !== "idle";
  const checkDisabled = feedbackLocked || isEmptyAnswer(selected);
  const correctAnswerText = getCorrectAnswerText(question);
  const newWords = useMemo(
    () => normalizeNewWords(question),
    [question]
  );

  function goNext() {
    const isLastQuestion = questionIndex >= questions.length - 1;

    if (isLastQuestion) {
      setIsComplete(true);
      return;
    }

    setQuestionIndex(current => current + 1);
    setSelected(null);
    setHint("");
    setFeedbackStatus("idle");
  }

  function checkAnswer() {
    if (feedbackLocked) {
      return;
    }

    if (isEmptyAnswer(selected)) {
      setHint("Выберите ответ");
      return;
    }

    if (selected === question.correct) {
      setFeedbackStatus("correct");
      setHint("Верно. В preview прогресс не сохраняется.");
      correctTimerRef.current = setTimeout(goNext, 520);
      return;
    }

    setFeedbackStatus("wrong");
    setHint("Почти. В preview сердца не тратятся.");
  }

  if (isLoading) {
    return (
      <StateCard
        title="Загружаем предпросмотр..."
        text="Открываем урок в безопасном admin-режиме."
      />
    );
  }

  if (error) {
    return (
      <StateCard title={error}>
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          <AppButton onClick={loadPreview}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <AppIcon icon={RefreshCw} size={18} />
              Повторить
            </span>
          </AppButton>
          <AppButton
            onClick={() => navigate("/admin/courses")}
            variant="secondary"
          >
            Назад к курсам
          </AppButton>
        </div>
      </StateCard>
    );
  }

  if (!lesson || questions.length === 0) {
    return (
      <StateCard
        title={lesson?.title || "Урок пуст"}
        text="В этом уроке пока нет вопросов для предпросмотра."
      >
        <AppButton
          onClick={() => navigate(`/admin/lessons/${lessonId}`)}
          style={{ marginTop: 18 }}
        >
          Назад в редактор
        </AppButton>
      </StateCard>
    );
  }

  if (isComplete) {
    return (
      <StateCard
        title="Предпросмотр завершён"
        text="XP, сердца, серия и прогресс не изменились."
      >
        <AppButton
          onClick={() => navigate(`/admin/lessons/${lessonId}`)}
          style={{ marginTop: 18 }}
        >
          Вернуться в редактор
        </AppButton>
      </StateCard>
    );
  }

  return (
    <PageContainer
      style={{
        maxWidth: 480,
        padding: "14px 16px 28px",
        background: "#F4F7F2",
        color: "#2D2D2D",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => navigate(`/admin/lessons/${lessonId}`)}
          aria-label="Назад"
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            border: "2px solid #E3E6DF",
            background: "#FFFFFF",
            color: "#4B4B4B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 0 #D9D9D9"
          }}
        >
          <AppIcon icon={ArrowLeft} size={22} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <ProgressBar progress={progress} />
        </div>
      </div>

      <AppCard
        style={{
          background: "#FFF7D6",
          border: "2px solid #FFE59A",
          boxShadow: "0 5px 0 #E0B900",
          color: "#4B4B4B",
          marginBottom: 14
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
          <AppIcon icon={Eye} size={18} color="#9A5600" />
          Режим предпросмотра
        </div>
        <div style={{ marginTop: 4, color: "#6F746B", fontWeight: 800 }}>
          Прогресс и награды не сохраняются
        </div>
      </AppCard>

      <AppCard
        className={`lesson-feedback-card lesson-feedback-card--${feedbackStatus}`}
        style={{
          padding: "20px 18px",
          background: "#FFFFFF",
          border: "2px solid #E6E6E6",
          borderRadius: 24,
          color: "#4B4B4B",
          boxShadow:
            feedbackStatus === "correct"
              ? "0 7px 0 #46A400"
              : feedbackStatus === "wrong"
                ? "0 7px 0 #E6A0A0"
                : "0 7px 0 #D9D9D9"
        }}
      >
        {newWords.length > 0 ? (
          <div
            style={{
              marginBottom: 18,
              padding: "12px 14px",
              borderRadius: 18,
              background: "#F3E8FF",
              border: "2px solid #DDD6FE",
              color: "#4B4B4B",
              boxShadow: "0 4px 0 #C4B5FD"
            }}
          >
            <div style={{ color: "#7C3AED", fontSize: 12, fontWeight: 900 }}>
              Новое слово
            </div>
            {newWords.map(word => (
              <div key={`${word.text}-${word.translation}`} style={{ fontWeight: 900 }}>
                <span style={{ color: "#8B5CF6" }}>{word.text}</span>
                {word.translation ? ` - ${word.translation}` : ""}
              </div>
            ))}
          </div>
        ) : null}

        <QuestionImage image={question.image} />
        <CharacterImage image={question.characterImage} />

        {QuestionComponent ? (
          <QuestionComponent
            question={question}
            selected={selected}
            disabled={feedbackLocked}
            feedbackStatus={feedbackStatus}
            setSelected={value => {
              if (feedbackLocked) {
                return;
              }

              setSelected(value);
              setHint("");
            }}
          />
        ) : (
          <p style={{ marginTop: 30, textAlign: "center", fontWeight: 900 }}>
            Неизвестный тип задания
          </p>
        )}
      </AppCard>

      {hint ? (
        <div
          style={{
            marginTop: 14,
            minHeight: 54,
            padding: "14px 15px",
            borderRadius: 20,
            background:
              feedbackStatus === "wrong"
                ? "#FFF0F0"
                : feedbackStatus === "correct"
                  ? "#E9F8DD"
                  : "#FFF7D6",
            border: `2px solid ${
              feedbackStatus === "wrong"
                ? "#FFD0D0"
                : feedbackStatus === "correct"
                  ? "#BFE8A7"
                  : "#FFE59A"
            }`,
            color: "#4B4B4B",
            fontWeight: 900,
            textAlign: "center",
            boxShadow:
              feedbackStatus === "wrong"
                ? "0 4px 0 #E6A0A0"
                : feedbackStatus === "correct"
                  ? "0 4px 0 #BFE8A7"
                  : "0 4px 0 #E0B900"
          }}
        >
          {feedbackStatus === "correct" ? (
            <AppIcon icon={CheckCircle2} size={22} color="#46A400" />
          ) : null}
          {feedbackStatus === "wrong" ? (
            <AppIcon icon={XCircle} size={22} color="#D93B3B" />
          ) : null}
          <div>{hint}</div>
          {feedbackStatus === "wrong" && correctAnswerText ? (
            <div style={{ whiteSpace: "pre-line", marginTop: 8 }}>
              Правильный ответ: {correctAnswerText}
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 10, marginTop: "auto", paddingTop: 18 }}>
        {feedbackStatus === "wrong" ? (
          <AppButton onClick={goNext}>
            Продолжить preview
          </AppButton>
        ) : (
          <AppButton
            onClick={checkAnswer}
            disabled={checkDisabled}
          >
            Проверить
          </AppButton>
        )}
      </div>
    </PageContainer>
  );
}
