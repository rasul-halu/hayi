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
        background: "#5A5A5A",
        padding: 18,
        borderRadius: 18,
        marginBottom: 12
      }}
    >
      <h3
        style={{
          margin: 0
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#D9D9D9",
          marginTop: 5
        }}
      >
        {meaning}
      </p>

      {extraNotes && (
        <p
          style={{
            color: "#BDBDBD",
            marginTop: 8,
            fontSize: 14
          }}
        >
          {extraNotes}
        </p>
      )}
    </div>
  );
}
