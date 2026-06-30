export default function AppCard({
  children,
  className,
  style = {}
}) {
  return (
    <div
      className={className}
      style={{
        background: "#5A5A5A",
        border: "2px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 6px 0 rgba(0,0,0,0.18)",
        ...style
      }}
    >
      {children}
    </div>
  );
}
