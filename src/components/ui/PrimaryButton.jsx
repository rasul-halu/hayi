export default function PrimaryButton({
  children,
  onClick,
  disabled = false
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",

        padding: "16px",

        border: "none",

        borderRadius: "18px",

        background: disabled
          ? "#888"
          : "#58CC02",

        color: "#fff",

        fontWeight: "bold",

        fontSize: "16px",

        cursor: "pointer",

        boxShadow:
          disabled
            ? "none"
            : "0px 4px 0px #46A400"
      }}
    >
      {children}
    </button>
  );
}