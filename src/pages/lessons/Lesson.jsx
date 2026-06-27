import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLessonById } from "../../data/courseHelpers";
import ProgressBar from "../../components/ui/ProgressBar";
import TranslateQuestion
from "../../components/lesson/TranslateQuestion";

import MatchQuestion
from "../../components/lesson/MatchQuestion";

import ListeningQuestion
from "../../components/lesson/ListeningQuestion";

import { useUser }
from "../../context/UserContext";

const QUESTION_COMPONENTS = {
  translate: TranslateQuestion,
  match: MatchQuestion,
  listening: ListeningQuestion
};

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const lesson = getLessonById(lessonId);

  const [selected, setSelected] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  const { user, loseHeart } = useUser();

  if (user.hearts === 0) {
    navigate("/hearts-empty");
  }

  if (!lesson) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
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
          Такого урока не существует
          или он ещё недоступен.
        </p>

        <button
          onClick={() => navigate("/home")}
          style={{
            marginTop: 24,
            padding: 18,
            width: 250,
            background: "#58CC02",
            border: "none",
            borderRadius: 18,
            color: "#fff",
            fontWeight: "bold"
          }}
        >
          На главную
        </button>
      </div>
    );
  }

  if (lesson.questions.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
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

        <button
          onClick={() => navigate("/home")}
          style={{
            marginTop: 24,
            padding: 18,
            width: 250,
            background: "#58CC02",
            border: "none",
            borderRadius: 18,
            color: "#fff",
            fontWeight: "bold"
          }}
        >
          На главную
        </button>
      </div>
    );
  }

  const question =
    lesson.questions[questionIndex];

  const QuestionComponent =
    QUESTION_COMPONENTS[question.type];

  const progress =
    lesson.questions.length > 0
      ? ((questionIndex + 1) /
          lesson.questions.length) * 100
      : 0;

  const checkAnswer = () => {

    if (selected === question.correct) {

      if (
            questionIndex <
            lesson.questions.length - 1
          ) {

            setQuestionIndex(
              prev => prev + 1
            );

        setSelected(null);

      } else {

        navigate(
          "/lesson-complete",
          {
            state: {
              lessonId: lesson.id
            }
          }
        );
      }

    } else {

      loseHeart();

      alert(
        "Неверный ответ"
      );

    }
  };

  return (
    <div
      style={{
        padding: 24
      }}
    >
      <div
        style={{
          fontSize: 28,
          marginBottom: 15
        }}
      >
        {"❤️".repeat(user.hearts)}
      </div>

      <ProgressBar progress={progress} />

      {QuestionComponent ? (
        <QuestionComponent
        question={question}
        selected={selected}
        setSelected={setSelected}
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

      <button
        onClick={checkAnswer}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 18,

          background: "#58CC02",

          border: "none",

          borderRadius: 18
        }}
      >
        Проверить
      </button>

    </div>
  );
}
