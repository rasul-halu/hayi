import { CheckCircle2, XCircle } from "lucide-react";
import AppIcon from "../ui/AppIcon";
import { highlightNewWords } from "../../utils/highlightNewWords";

export function getOptionLabel(option) {
  if (typeof option === "string" || typeof option === "number") {
    return String(option);
  }

  if (!option) {
    return "";
  }

  if (typeof option.label === "string" || typeof option.label === "number") {
    return String(option.label);
  }

  if (typeof option.text === "string" || typeof option.text === "number") {
    return String(option.text);
  }

  if (typeof option.value === "string" || typeof option.value === "number") {
    return String(option.value);
  }

  return "";
}

export function getOptionValue(option) {
  if (typeof option === "string" || typeof option === "number") {
    return String(option);
  }

  if (!option) {
    return "";
  }

  if (typeof option.value === "string" || typeof option.value === "number") {
    return String(option.value);
  }

  if (typeof option.text === "string" || typeof option.text === "number") {
    return String(option.text);
  }

  if (typeof option.label === "string" || typeof option.label === "number") {
    return String(option.label);
  }

  return "";
}

export default function AnswerButton({
  children,
  text,
  label,
  option,
  selected,
  onClick,
  disabled = false,
  feedbackStatus = "idle",
  newWords
}) {
  const buttonLabel =
    children ||
    label ||
    text ||
    getOptionLabel(option);
  const isWrong = selected && feedbackStatus === "wrong";
  const isCorrect = selected && feedbackStatus === "correct";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: 58,
        padding: "16px 18px",
        marginTop: 12,
        borderRadius: 18,
        border: isWrong
          ? "3px solid #F06A6A"
          : isCorrect
            ? "3px solid #46A400"
            : selected
              ? "3px solid #58CC02"
              : "2px solid #E6E6E6",
        background: isWrong
          ? "#FFF0F0"
          : isCorrect
            ? "#E9F8DD"
            : selected
              ? "#F0FFE8"
              : "#FFFFFF",
        color: "#4B4B4B",
        fontSize: 17,
        fontWeight: 900,
        cursor: disabled ? "default" : "pointer",
        textAlign: "left",
        boxShadow: isWrong
          ? "0 5px 0 #E6A0A0"
          : isCorrect || selected
            ? "0 5px 0 #46A400"
            : "0 5px 0 #D9D9D9",
        transition:
          "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease",
        opacity: disabled && !selected ? 0.72 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12
      }}
    >
      <span
        style={{
          minWidth: 0,
          overflowWrap: "anywhere"
        }}
      >
        {typeof buttonLabel === "string"
          ? highlightNewWords(buttonLabel, newWords)
          : buttonLabel}
      </span>

      {isCorrect ? (
        <AppIcon icon={CheckCircle2} size={22} color="#46A400" />
      ) : null}

      {isWrong ? (
        <AppIcon icon={XCircle} size={22} color="#D93B3B" />
      ) : null}
    </button>
  );
}
