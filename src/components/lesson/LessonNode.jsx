import { useNavigate } from "react-router-dom";

export default function LessonNode({
  lesson,
  unlocked,
  completed
}) {

  const navigate = useNavigate();

  return (
    <div
      onClick={() => {

        if (unlocked) {
          navigate(`/lesson/${lesson.id}`);
        }

      }}
      style={{
        width: 80,
        height: 80,

        borderRadius: "50%",

        background:
          unlocked
            ? "#58CC02"
            : "#666",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        cursor:
          unlocked
            ? "pointer"
            : "default",

        margin: "20px auto",

        fontSize: 24,

        color: "#fff"
      }}
    >
      {
        completed
          ? "✓"
          : unlocked
            ? "▶"
            : "🔒"
      }
    </div>
  );
}
