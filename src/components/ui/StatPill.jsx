export default function StatPill({
  icon,
  value,
  label,
  style = {}
}) {
  return (
    <div
      style={{
        minWidth: 0,
        flex: 1,
        background: "#FFFFFF",
        borderRadius: 16,
        border: "2px solid #E6E6E6",
        padding: "10px 12px",
        color: "#4B4B4B",
        fontWeight: "900",
        textAlign: "center",
        boxShadow: "0 4px 0 #D9D9D9",
        ...style
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 15,
          whiteSpace: "nowrap"
        }}
      >
        {icon && (
          <span>
            {icon}
          </span>
        )}
        <span>{value}</span>
      </div>

      {label && (
        <div
          style={{
            marginTop: 3,
            color: "#777",
            fontSize: 11,
            fontWeight: "800"
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
