import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
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
import { useUser } from "../../context/UserContext";
import { getLessonById } from "../../data/courseHelpers";
import {
  playCorrectSound,
  playWrongSound
} from "../../utils/soundEffects";
import { normalizeNewWords } from "../../utils/highlightNewWords";

const QUESTION_COMPONENTS = {
  translate: TranslateQuestion,
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

  return question.correct ||
    "Правильный ответ будет показан в повторении";
}

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = getLessonById(lessonId);
  const feedbackTimerRef = useRef(null);

  const [selected, setSelected] = useState(null);
  const [questionQueue, setQuestionQueue] = useState(
    () => lesson?.questions || []
  );
  const [completedCorrect, setCompletedCorrect] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [hint, setHint] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("idle");
  const [isWaitingForContinue, setIsWaitingForContinue] = useState(false);
  const [lastWrongAnswer, setLastWrongAnswer] = useState(null);

  const {
    user,
    handleCorrectAnswer,
    handleWrongAnswer
  } = useUser();

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
      navigate("/hearts-empty");
    }
  }, [navigate, user.hearts]);

  if (!lesson) {
    return (
      <PageContainer
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center"
        }}
      >
        <h1>Урок не найден</h1>

        <p
          style={{
            marginTop: 12,
            color: "#D9D9D9"
          }}
        >
          Такого урока не существует или он ещё недоступен.
        </p>

        <AppButton
          onClick={() => navigate("/home")}
          style={{
            marginTop: 24
          }}
        >
          На главную
        </AppButton>
      </PageContainer>
    );
  }

  const originalQuestionsCount = lesson.questions.length;
  const question = questionQueue[0];
  const QuestionComponent =
    question ? QUESTION_COMPONENTS[question.type] : null;
  const progress =
    originalQuestionsCount > 0
      ? (completedCorrect / originalQuestionsCount) * 100
      : 0;
  const feedbackLocked = feedbackStatus !== "idle";
  const checkDisabled =
    feedbackLocked || isEmptyAnswer(selected);
  const newWords = normalizeNewWords(question);
  const correctAnswerText =
    getCorrectAnswerText(question);

  if (originalQuestionsCount === 0) {
    return (
      <PageContainer
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center"
        }}
      >
        <h1>{lesson.title}</h1>

        <p
          style={{
            marginTop: 12,
            color: "#D9D9D9"
          }}
        >
          В этом уроке пока нет заданий.
        </p>

        <AppButton
          onClick={() => navigate("/home")}
          style={{
            marginTop: 24
          }}
        >
          На главную
        </AppButton>
      </PageContainer>
    );
  }

  if (!question) {
    return (
      <PageContainer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center"
        }}
      >
        <h1>Завершаем урок...</h1>
      </PageContainer>
    );
  }

  const moveToNextQuestion = () => {
    const isLastQuestion = questionQueue.length <= 1;

    setCompletedCorrect(prev =>
      Math.min(prev + 1, originalQuestionsCount)
    );

    if (isLastQuestion) {
      navigate(
        "/lesson-complete",
        {
          state: {
            lessonId: lesson.id,
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
    setHint("Почти! Повторим позже");
    setIsWaitingForContinue(true);
    setLastWrongAnswer(selected);
    playWrongSound(user.soundEnabled);
  };

  return (
    <PageContainer
      style={{
        maxWidth: 480,
        padding: "14px 16px 28px",
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
          background: "#4B4B4B"
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
            border: "2px solid rgba(255,255,255,0.12)",
            background: "#5A5A5A",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 0 rgba(0,0,0,0.18)",
            opacity: feedbackLocked ? 0.65 : 1,
            cursor: feedbackLocked ? "default" : "pointer"
          }}
        >
          <AppIcon icon={ArrowLeft} size={22} />
        </button>

        <div
          style={{
            flex: 1,
            minWidth: 0
          }}
        >
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
            fontWeight: "900",
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
          padding: "22px 18px",
          background: "#F7F7F7",
          border: "2px solid #E6E6E6",
          borderRadius: 24,
          color: "#4B4B4B",
          boxShadow: feedbackStatus === "correct"
            ? "0 7px 0 #46A400"
            : feedbackStatus === "wrong"
              ? "0 7px 0 #C83737"
              : "0 7px 0 #D9D9D9"
        }}
      >
        {newWords.length > 0 && (
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
                fontWeight: "900",
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
                  fontWeight: "900",
                  lineHeight: 1.35
                }}
              >
                <span
                  style={{
                    color: "#8B5CF6"
                  }}
                >
                  {word.text}
                </span>
                {word.translation && (
                  <>
                    {" — "}
                    <span>
                      {word.translation}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

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
              textAlign: "center"
            }}
          >
            Неизвестный тип задания
          </p>
        )}
      </AppCard>

      {hint && (
        <div
          className={`lesson-feedback-message lesson-feedback-message--${feedbackStatus}`}
          style={{
            marginTop: 14,
            minHeight: 54,
            padding: "13px 15px",
            borderRadius: 18,
            background: feedbackStatus === "wrong"
              ? "#FFD6D6"
              : feedbackStatus === "correct"
                ? "#D7FFB8"
                : "#FFD43B",
            color: "#4B4B4B",
            fontWeight: "900",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            textAlign: "center",
            boxShadow: feedbackStatus === "wrong"
              ? "0 4px 0 #C83737"
              : feedbackStatus === "correct"
                ? "0 4px 0 #46A400"
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
            {feedbackStatus === "correct" && (
              <AppIcon icon={CheckCircle2} size={22} color="#46A400" />
            )}

            {feedbackStatus === "wrong" && (
              <AppIcon icon={XCircle} size={22} color="#C83737" />
            )}

            <span>{hint}</span>
          </div>

          {isWaitingForContinue && (
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
              {lastWrongAnswer && question.type !== "match" && (
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.35
                  }}
                >
                  <span
                    style={{
                      color: "#777"
                    }}
                  >
                    Ваш ответ:{" "}
                  </span>
                  <strong>{lastWrongAnswer}</strong>
                </div>
              )}

              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.35
                }}
              >
                <span
                  style={{
                    color: "#777"
                  }}
                >
                  Правильный ответ:{" "}
                </span>
                <strong
                  style={{
                    whiteSpace: "pre-line"
                  }}
                >
                  {correctAnswerText}
                </strong>
              </div>
            </div>
          )}
        </div>
      )}

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
