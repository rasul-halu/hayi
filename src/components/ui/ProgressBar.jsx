export default function ProgressBar({
  progress
}) {
  return (
    <div
      style={{
        width: "100%",
        height: 12,

        background: "#666",

        borderRadius: 20
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",

          background: "#58CC02",

          borderRadius: 20
        }}
      />
    </div>
  );
}