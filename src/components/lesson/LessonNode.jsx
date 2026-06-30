import {
  Check,
  Lock,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppIcon from "../ui/AppIcon";

export default function LessonNode({
  lesson,
  unlocked,
  completed
}) {
  const navigate = useNavigate();

  const background = completed
    ? "#58CC02"
    : unlocked
      ? "#FFD43B"
      : "#777";

  const shadow = completed
    ? "#46A400"
    : unlocked
      ? "#E0B900"
      : "#555";

  const Icon = completed
    ? Check
    : unlocked
      ? Play
      : Lock;

  return (
    <button
      onClick={() => {
        if (unlocked) {
          navigate(`/lesson/${lesson.id}`);
        }
      }}
      style={{
        width: 82,
        height: 82,
        borderRadius: "50%",
        background,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor:
          unlocked
            ? "pointer"
            : "default",
        color: completed || !unlocked
          ? "#FFFFFF"
          : "#4B4B4B",
        boxShadow: `0 7px 0 ${shadow}`
      }}
      aria-label={lesson.title}
    >
      <AppIcon
        icon={Icon}
        size={34}
        strokeWidth={3}
      />
    </button>
  );
}
