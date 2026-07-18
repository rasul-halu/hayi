export default function PageDots({
  activeIndex,
  count = 3
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8
      }}
      aria-label={`Экран ${activeIndex + 1} из ${count}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          style={{
            width: index === activeIndex ? 26 : 9,
            height: 9,
            borderRadius: 999,
            background: index === activeIndex
              ? "#58CC02"
              : "#D9D9D9",
            transition: "width 180ms ease, background 180ms ease"
          }}
        />
      ))}
    </div>
  );
}
