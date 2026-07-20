import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  RefreshCw,
  XCircle
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BuildSentenceQuestion from "../../components/lesson/BuildSentenceQuestion";
import CharacterImage from "../../components/lesson/CharacterImage";
import MatchQuestion from "../../components/lesson/MatchQuestion";
import FillBlankQuestion from "../../components/lesson/FillBlankQuestion";
import ListeningQuestion from "../../components/lesson/ListeningQuestion";
import QuestionImage from "../../components/lesson/QuestionImage";
import TranslateQuestion from "../../components/lesson/TranslateQuestion";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import ProgressBar from "../../components/ui/ProgressBar";
import { getLesson as getApiLesson } from "../../api/apiClient";
import { useUser } from "../../context/UserContext";
import { getLessonById } from "../../data/courseHelpers";
import { mapApiLessonToFrontendLesson } from "../../utils/courseApiAdapters";
import {
  playCorrectSound,
  playWrongSound
} from "../../utils/soundEffects";
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

const CORRECT_FEEDBACK_DELAY = 520;

function isEmptyAnswer(value) {
  return value === null ||
    value === undefined ||
    value === "";
}

function getCorrectAnswerText(question) {
  if (!question) {
    return "Правильный ответ будет показан в повторении";
  }

  if (question.type === "match" && Array.isArray(question.pairs)) {
    return question.pairs
      .map(pair => `${pair.word || pair.left} — ${pair.translation || pair.right}`)
      .join("\n");
  }

  if (question.type === "buildSentence") {
    return question.targetSentence || question.correct;
  }

  return question.correct || "Правильный ответ будет показан в повторении";
}

function LessonStateCard({
  title,
  text,
  children
}) {
  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}
    >
      <AppCard
        style={{
          width: "100%",
          background: "#FFFFFF",
          color: "#2D2D2D",
          border: "2px solid #E6E6E6",
          boxShadow: "0 7px 0 #D9D9D9",
          padding: 22
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 900
          }}
        >
          {title}
        </h1>

        {text ? (
          <p
            style={{
              margin: "10px 0 0",
              color: "#6F746B",
              fontWeight: 800,
              lineHeight: 1.4
            }}
          >
            {text}
          </p>
        ) : null}

        {children}
      </AppCard>
    </PageContainer>
  );
}

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const feedbackTimerRef = useRef(null);

  const [lesson, setLesson] = useState(null);
  const [isLessonLoading, setIsLessonLoading] = useState(true);
  const [lessonError, setLessonError] = useState("");
  const [lessonNotFound, setLessonNotFound] = useState(false);
  const [selected, setSelected] = useState(null);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [completedCorrect, setCompletedCorrect] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [hint, setHint] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("idle");
  const [isWaitingForContinue, setIsWaitingForContinue] = useState(false);
  const [lastWrongAnswer, setLastWrongAnswer] = useState(null);

  const {
    user,
    handleCorrectAnswer,
    handleWrongAnswer,
    refreshHearts
  } = useUser();

  const loadLesson = useCallback(async () => {
    setIsLessonLoading(true);
    setLessonError("");
    setLessonNotFound(false);

    try {
      const data = await getApiLesson(lessonId);
      const apiLesson = mapApiLessonToFrontendLesson(data.lesson);

      if (process.env.NODE_ENV === "development") {
        console.log("Lesson API loaded", {
          id: apiLesson.id,
          title: apiLesson.title,
          description: apiLesson.description,
          questionCount: apiLesson.questions?.length || 0,
        });
      }

      setLesson(apiLesson);
    } catch (error) {
      const fallbackLesson = getLessonById(lessonId);

      if (process.env.NODE_ENV === "development" && fallbackLesson) {
        console.warn(
          "Lesson API loading failed, using local fallback:",
          error.message
        );
        setLesson(fallbackLesson);
      } else {
        setLesson(null);
        setLessonNotFound(error.status === 404);
        setLessonError(
          error.status === 404
            ? "Урок не найден"
            : "Не удалось загрузить урок"
        );
      }
    } finally {
      setIsLessonLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void loadLesson();
  }, [loadLesson]);

  useEffect(() => {
    setQuestionQueue(lesson?.questions || []);
    setCompletedCorrect(0);
    setWrongAnswers(0);
    setSelected(null);
    setHint("");
    setFeedbackStatus("idle");
    setIsWaitingForContinue(false);
    setLastWrongAnswer(null);

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, [lesson?.id, lesson?.questions]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user.hearts === 0) {
      void refreshHearts().then(heartState => {
        const currentHearts = Number(
          heartState?.hearts ?? user.hearts
        );

        if (currentHearts <= 0) {
          navigate("/hearts-empty");
        }
      });
    }
  }, [navigate, refreshHearts, user.hearts]);

  if (isLessonLoading) {
    return (
      <LessonStateCard
        title="Загружаем урок..."
        text="Подготавливаем задания и прогресс."
      />
    );
  }

  if (lessonError && !lesson) {
    return (
      <LessonStateCard
        title={lessonError}
        text={
          lessonNotFound
            ? "Такого урока не существует или он ещё не опубликован."
            : "Проверьте подключение и попробуйте снова."
        }
      >
        {!lessonNotFound ? (
          <AppButton
            onClick={loadLesson}
            style={{ marginTop: 22 }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              <AppIcon icon={RefreshCw} size={18} />
              Повторить
            </span>
          </AppButton>
        ) : null}

        <AppButton
          onClick={() => navigate("/home")}
          variant="secondary"
          style={{ marginTop: 12 }}
        >
          На главную
        </AppButton>
      </LessonStateCard>
    );
  }

  if (!lesson) {
    return (
      <LessonStateCard
        title="Урок не найден"
        text="Такого урока не существует или он ещё недоступен."
      >
        <AppButton
          onClick={() => navigate("/home")}
          style={{ marginTop: 22 }}
        >
          На главную
        </AppButton>
      </LessonStateCard>
    );
  }

  const originalQuestionsCount = lesson.questions.length;
  const question = questionQueue[0];
  const QuestionComponent = question ? QUESTION_COMPONENTS[question.type] : null;
  const progress =
    originalQuestionsCount > 0
      ? (completedCorrect / originalQuestionsCount) * 100
      : 0;
  const feedbackLocked = feedbackStatus !== "idle";
  const checkDisabled = feedbackLocked || isEmptyAnswer(selected);
  const newWords = normalizeNewWords(question);
  const correctAnswerText = getCorrectAnswerText(question);

  if (originalQuestionsCount === 0) {
    return (
      <LessonStateCard
        title={lesson.title}
        text="В этом уроке пока нет заданий."
      >
        <AppButton
          onClick={() => navigate("/home")}
          style={{ marginTop: 22 }}
        >
          На главную
        </AppButton>
      </LessonStateCard>
    );
  }

  if (!question) {
    return (
      <LessonStateCard
        title="Завершаем урок..."
        text="Сохраняем прогресс."
      />
    );
  }

  const moveToNextQuestion = () => {
    const isLastQuestion = questionQueue.length <= 1;
    feedbackTimerRef.current = null;

    setCompletedCorrect(prev =>
      Math.min(prev + 1, originalQuestionsCount)
    );

    if (isLastQuestion) {
      navigate(
        "/lesson-complete",
        {
          state: {
            lessonId: lesson.id,
            xpReward: lesson.xpReward,
            correctAnswers: originalQuestionsCount,
            wrongAnswers
          }
        }
      );
      return;
    }

    setQuestionQueue(prev => prev.slice(1));
    setSelected(null);
    setHint("");
    setFeedbackStatus("idle");
  };

  const repeatQuestionLater = () => {
    setQuestionQueue(prev => {
      if (prev.length <= 1) {
        return prev;
      }

      const [currentQuestion, ...rest] = prev;
      return [...rest, currentQuestion];
    });
    setSelected(null);
    setHint("");
    setFeedbackStatus("idle");
    setIsWaitingForContinue(false);
    setLastWrongAnswer(null);
  };

  const handleContinueAfterWrong = () => {
    repeatQuestionLater();
  };

  const checkAnswer = () => {
    if (feedbackLocked) {
      return;
    }

    if (isEmptyAnswer(selected)) {
      setHint(
        question.type === "match"
          ? "Завершите сопоставление"
          : "Выберите ответ"
      );
      return;
    }

    if (selected === question.correct) {
      void handleCorrectAnswer();
      setFeedbackStatus("correct");
      setHint("Верно!");
      playCorrectSound(user.soundEnabled);

      feedbackTimerRef.current = setTimeout(
        moveToNextQuestion,
        CORRECT_FEEDBACK_DELAY
      );
      return;
    }

    void handleWrongAnswer();
    setWrongAnswers(prev => prev + 1);
    setFeedbackStatus("wrong");
    setHint("Почти!");
    setIsWaitingForContinue(true);
    setLastWrongAnswer(selected);
    playWrongSound(user.soundEnabled);
  };

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "8px 0 12px",
          background: "#F4F7F2"
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={feedbackLocked}
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
            boxShadow: "0 4px 0 #D9D9D9",
            opacity: feedbackLocked ? 0.65 : 1,
            cursor: feedbackLocked ? "default" : "pointer"
          }}
        >
          <AppIcon icon={ArrowLeft} size={22} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <ProgressBar progress={progress} />
        </div>

        <div
          style={{
            minWidth: 62,
            minHeight: 42,
            padding: "8px 12px",
            borderRadius: 999,
            background: "#FFFFFF",
            color: "#4B4B4B",
            fontWeight: 900,
            textAlign: "center",
            boxShadow: "0 4px 0 #D9D9D9"
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6
            }}
          >
            <AppIcon icon={Heart} size={18} color="#FF4D4D" />
            {user.hearts}
          </span>
        </div>
      </div>

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
            <div
              style={{
                color: "#7C3AED",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                marginBottom: 6
              }}
            >
              Новое слово
            </div>

            {newWords.map(word => (
              <div
                key={`${word.text}-${word.translation}`}
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  lineHeight: 1.35
                }}
              >
                <span style={{ color: "#8B5CF6" }}>{word.text}</span>
                {word.translation ? (
                  <>
                    {" — "}
                    <span>{word.translation}</span>
                  </>
                ) : null}
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
            setSelected={(value) => {
              if (feedbackLocked) {
                return;
              }

              setSelected(value);
              setHint("");
            }}
          />
        ) : (
          <p
            style={{
              marginTop: 30,
              textAlign: "center",
              fontWeight: 900
            }}
          >
            Неизвестный тип задания
          </p>
        )}
      </AppCard>

      {hint ? (
        <div
          className={`lesson-feedback-message lesson-feedback-message--${feedbackStatus}`}
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            textAlign: "center",
            boxShadow:
              feedbackStatus === "wrong"
                ? "0 4px 0 #E6A0A0"
                : feedbackStatus === "correct"
                  ? "0 4px 0 #BFE8A7"
                  : "0 4px 0 #E0B900"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            {feedbackStatus === "correct" ? (
              <AppIcon icon={CheckCircle2} size={22} color="#46A400" />
            ) : null}

            {feedbackStatus === "wrong" ? (
              <AppIcon icon={XCircle} size={22} color="#D93B3B" />
            ) : null}

            <span>{hint}</span>
          </div>

          {isWaitingForContinue ? (
            <div
              style={{
                width: "100%",
                marginTop: 4,
                paddingTop: 10,
                borderTop: "1px solid rgba(75,75,75,0.14)",
                display: "grid",
                gap: 8,
                textAlign: "left"
              }}
            >
              {lastWrongAnswer && question.type !== "match" ? (
                <div style={{ fontSize: 14, lineHeight: 1.35 }}>
                  <span style={{ color: "#777" }}>Ваш ответ: </span>
                  <strong>{lastWrongAnswer}</strong>
                </div>
              ) : null}

              <div style={{ fontSize: 14, lineHeight: 1.35 }}>
                <span style={{ color: "#777" }}>Правильный ответ: </span>
                <strong style={{ whiteSpace: "pre-line" }}>
                  {correctAnswerText}
                </strong>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {isWaitingForContinue ? (
        <AppButton
          onClick={handleContinueAfterWrong}
          style={{
            marginTop: 22,
            minHeight: 60,
            borderRadius: 18,
            fontSize: 18
          }}
        >
          Продолжить
        </AppButton>
      ) : (
        <AppButton
          onClick={checkAnswer}
          disabled={checkDisabled}
          style={{
            marginTop: 22,
            minHeight: 60,
            borderRadius: 18,
            fontSize: 18
          }}
        >
          Проверить
        </AppButton>
      )}
    </PageContainer>
  );
}
