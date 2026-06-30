export default function AnswerButton({
  text,
  selected,
  onClick,
  disabled = false,
  feedbackStatus = "idle"
}) {
  const isWrong =
    selected && feedbackStatus === "wrong";

  const isCorrect =
    selected && feedbackStatus === "correct";

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
          ? "3px solid #FF4D4D"
          : selected
          ? "3px solid #46A400"
          : "2px solid #E6E6E6",
        background: isWrong
          ? "#FFD6D6"
          : selected
          ? "#D7FFB8"
          : "#FFFFFF",
        color: "#4B4B4B",
        fontSize: 17,
        fontWeight: "900",
        cursor: disabled
          ? "default"
          : "pointer",
        textAlign: "left",
        boxShadow: isWrong
          ? "0 5px 0 #C83737"
          : isCorrect || selected
          ? "0 5px 0 #46A400"
          : "0 5px 0 #D9D9D9",
        transition:
          "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease",
        opacity: disabled && !selected
          ? 0.72
          : 1
      }}
    >
      {text}
    </button>
  );
}
