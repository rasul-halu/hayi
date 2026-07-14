export default function WordCard({
  word,
  lezgi,
  russian,
  translation,
  notes
}) {
  const title = word?.russian || word?.word || russian || "";
  const meaning = word?.lezgi || word?.translation || lezgi || translation || "";
  const extraNotes = word?.notes || notes;

  return (
    <div
      style={{
        background: "#FFFFFF",
        color: "#2D2D2D",
        padding: 18,
        borderRadius: 18,
        border: "2px solid #E6E6E6",
        marginBottom: 12,
        boxShadow: "0 5px 0 #D9D9D9"
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 900
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#46A400",
          marginTop: 6,
          fontWeight: 900,
          lineHeight: 1.35
        }}
      >
        {meaning}
      </p>

      {extraNotes ? (
        <p
          style={{
            color: "#777",
            marginTop: 8,
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.35
          }}
        >
          {extraNotes}
        </p>
      ) : null}
    </div>
  );
}
