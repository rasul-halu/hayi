export default function ProgressBar({
  progress
}) {
  return (
    <div
      style={{
        width: "100%",
        height: 14,
        background: "#E6E6E6",
        borderRadius: 999,
        overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.28)",
        boxShadow: "inset 0 2px 0 rgba(0,0,0,0.05)"
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: "#58CC02",
          borderRadius: 999,
          boxShadow: "inset 0 -3px 0 #46A400",
          transition: "width 180ms ease"
        }}
      />
    </div>
  );
}
