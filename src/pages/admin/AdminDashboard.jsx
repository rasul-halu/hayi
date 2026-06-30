import {
  BookOpen,
  HelpCircle,
  Layers,
  Plus,
  Shield,
  WholeWord
} from "lucide-react";
import { course } from "../../data/courseData";
import {
  getAllLessons,
  getVocabulary
} from "../../data/courseHelpers";
import AppIcon from "../../components/ui/AppIcon";

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
      value: course.chapters.length,
      icon: Layers
    },
    {
      label: "Уроков",
      value: lessons.length,
      icon: BookOpen
    },
    {
      label: "Слов",
      value: vocabulary.length,
      icon: WholeWord
    },
    {
      label: "Вопросов",
      value: questionCount,
      icon: HelpCircle
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
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <AppIcon icon={Shield} size={18} color="#58CC02" />
          Локальная заготовка управления курсом
        </span>
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
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <AppIcon icon={stat.icon} size={18} color="#BDBDBD" />
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
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <AppIcon icon={Plus} size={20} />
          Добавить урок
        </span>
      </button>
    </div>
  );
}
