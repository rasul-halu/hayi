export default function StatCard({
  icon,
  value
}) {
  return (
    <div
      style={{
        background: "#5A5A5A",
        padding: "12px 20px",
        borderRadius: 20,
        color: "#fff",
        fontWeight: "bold",
        display: "inline-flex",
        alignItems: "center",
        gap: 8
      }}
    >
      {icon}
      <span>{value}</span>
    </div>
  );
}
