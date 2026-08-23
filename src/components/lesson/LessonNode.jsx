import {
  Check,
  Lock,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LESSON_STATE } from "../../utils/lessonProgress";
import AppIcon from "../ui/AppIcon";

export default function LessonNode({
  lesson,
  state = LESSON_STATE.LOCKED,
  onLessonAttempt
}) {
  const navigate = useNavigate();
  const completed = state === LESSON_STATE.COMPLETED;
  const available = state === LESSON_STATE.AVAILABLE;
  const canOpen = completed || available;

  const background = completed
    ? "#58CC02"
    : available
      ? "#FFD43B"
      : "#777";

  const shadow = completed
    ? "#46A400"
    : available
      ? "#E0B900"
      : "#555";

  const Icon = completed
    ? Check
    : available
      ? Play
      : Lock;

  return (
    <button
      onClick={() => {
        if (canOpen) {
          if (onLessonAttempt) {
            void onLessonAttempt(lesson.id);
            return;
          }

          navigate(`/lesson/${lesson.id}`);
        }
      }}
      disabled={!canOpen}
      type="button"
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
          canOpen
            ? "pointer"
            : "default",
        color: completed || !available
          ? "#FFFFFF"
          : "#4B4B4B",
        boxShadow: `0 7px 0 ${shadow}`
      }}
      aria-label={lesson?.title || "Урок"}
    >
      <AppIcon
        icon={Icon}
        size={34}
        strokeWidth={3}
      />
    </button>
  );
}
