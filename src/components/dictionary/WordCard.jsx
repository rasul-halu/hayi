export default function WordCard({
  lezgi,
  russian
}) {
  return (
    <div
      style={{
        background: "#5A5A5A",
        padding: 18,
        borderRadius: 18,
        marginBottom: 12
      }}
    >
      <h3>{lezgi}</h3>

      <p
        style={{
          color: "#D9D9D9",
          marginTop: 5
        }}
      >
        {russian}
      </p>
    </div>
  );
}