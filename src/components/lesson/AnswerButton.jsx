export default function AnswerButton({
  text,
  selected,
  onClick
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",

        padding: 18,

        marginTop: 12,

        borderRadius: 18,

        border: selected
          ? "3px solid #58CC02"
          : "2px solid #777",

        background: selected
          ? "#58CC02"
          : "#F5F5F5",

        color: selected
          ? "#fff"
          : "#000",

        fontSize: 18,

        fontWeight: "600",

        cursor: "pointer"
      }}
    >
      {text}
    </button>
  );
}