export default function PracticeCard({
  icon,
  title,
  description,
  badge,
  disabled = false,
  onClick
}) {
  const interactive = Boolean(onClick) && !disabled;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      onClick={interactive ? onClick : undefined}
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
        cursor: interactive ? "pointer" : "default",
        opacity: disabled ? 0.64 : 1
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          margin: "0 auto",
          borderRadius: 14,
          background: disabled ? "#F0F0F0" : "#E9F8DD",
          color: disabled ? "#8A8A8A" : "#58CC02",
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
          fontWeight: 900
        }}
      >
        {title}
      </div>

      {badge ? (
        <div
          style={{
            display: "inline-flex",
            marginTop: 6,
            padding: "4px 8px",
            borderRadius: 999,
            background: "#FFF1D6",
            color: "#9A5600",
            fontSize: 11,
            fontWeight: 900
          }}
        >
          {badge}
        </div>
      ) : description ? (
        <div
          style={{
            marginTop: 3,
            color: "#777",
            fontSize: 11,
            fontWeight: 800
          }}
        >
          {description}
        </div>
      ) : null}
    </button>
  );
}
