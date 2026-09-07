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
  theme,
  onLessonAttempt
}) {
  const navigate = useNavigate();
  const completed = state === LESSON_STATE.COMPLETED;
  const available = state === LESSON_STATE.AVAILABLE;
  const canOpen = completed || available;
  const availableMain = theme?.main || "#3D8614";
  const availableDepth = theme?.depth || "#2F6810";
  const availableSoft = theme?.soft || "#EAF7DF";

  const background = completed
    ? "#46A400"
    : available
      ? availableMain
      : "#777A76";

  const shadow = completed
    ? "#347A00"
    : available
      ? availableDepth
      : "#565956";

  const ring = completed
    ? "#DDF2CE"
    : available
      ? availableSoft
      : "#E1E4DF";

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
        border: `4px solid ${ring}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor:
          canOpen
            ? "pointer"
            : "default",
        color: "#FFFFFF",
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
