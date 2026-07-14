export default function SectionTitle({
  title,
  subtitle,
  style = {}
}) {
  return (
    <div
      style={{
        marginBottom: 14,
        ...style
      }}
    >
      <h2
        style={{
          margin: 0,
          color: "inherit",
          fontSize: 22,
          fontWeight: "900",
          letterSpacing: 0
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          style={{
            margin: "6px 0 0",
            color: "inherit",
            opacity: 0.72,
            fontSize: 15,
            lineHeight: 1.35
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
