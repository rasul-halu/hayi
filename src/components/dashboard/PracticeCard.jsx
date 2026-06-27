export default function PracticeCard({
  emoji,
  title
}) {
  return (
    <div
      style={{
        background: "#fff",

        color: "#4B4B4B",

        borderRadius: 20,

        padding: 20,

        width: 110,

        textAlign: "center"
      }}
    >
      <div
        style={{
          fontSize: 32
        }}
      >
        {emoji}
      </div>

      <div>
        {title}
      </div>
    </div>
  );
}