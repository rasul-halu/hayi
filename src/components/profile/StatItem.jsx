export default function StatItem({
  icon,
  value,
  label
}) {
  return (
    <div
      style={{
        background: "#5A5A5A",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12
      }}
    >
      <h3
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: 0
        }}
      >
        {icon}
        <span>{value}</span>
      </h3>

      <p
        style={{
          color: "#D9D9D9",
          marginTop: 4
        }}
      >
        {label}
      </p>
    </div>
  );
}
