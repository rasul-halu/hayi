export default function PracticeCard({
  icon,
  title,
  onClick
}) {
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "#FFFFFF",
        color: "#4B4B4B",
        borderRadius: 18,
        border: "2px solid #E6E6E6",
        padding: "16px 10px",
        flex: 1,
        minWidth: 0,
        textAlign: "center",
        boxShadow: "0 5px 0 #D9D9D9",
        cursor: interactive
          ? "pointer"
          : "default"
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          margin: "0 auto",
          borderRadius: 14,
          background: "#E9F8DD",
          color: "#58CC02",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {icon}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: "900"
        }}
      >
        {title}
      </div>
    </button>
  );
}
