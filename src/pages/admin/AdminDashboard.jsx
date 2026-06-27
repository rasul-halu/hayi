import { course } from "../../data/courseData";
import {
  getAllLessons,
  getVocabulary
} from "../../data/courseHelpers";

export default function AdminDashboard() {
  const lessons = getAllLessons();
  const vocabulary = getVocabulary();

  const questionCount = lessons.reduce(
    (total, lesson) =>
      total + lesson.questions.length,
    0
  );

  const stats = [
    {
      label: "Глав",
      value: course.chapters.length
    },
    {
      label: "Уроков",
      value: lessons.length
    },
    {
      label: "Слов",
      value: vocabulary.length
    },
    {
      label: "Вопросов",
      value: questionCount
    }
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24
      }}
    >
      <h1>Админ-панель</h1>

      <p
        style={{
          color: "#D9D9D9",
          marginTop: 8
        }}
      >
        Локальная заготовка управления курсом
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginTop: 24
        }}
      >
        {stats.map(stat => (
          <div
            key={stat.label}
            style={{
              background: "#5A5A5A",
              borderRadius: 18,
              padding: 18
            }}
          >
            <div
              style={{
                color: "#D9D9D9",
                fontSize: 14
              }}
            >
              {stat.label}
            </div>

            <div
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: "bold",
                marginTop: 8
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {}}
        style={{
          marginTop: 24,
          width: "100%",
          padding: 18,
          background: "#58CC02",
          border: "none",
          borderRadius: 18,
          color: "#fff",
          fontWeight: "bold"
        }}
      >
        Добавить урок
      </button>
    </div>
  );
}
