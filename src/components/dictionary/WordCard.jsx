export default function WordCard({
  word,
  lezgi,
  russian,
  translation,
  notes
}) {
  const title = word?.russian || word?.word || russian || "";
  const meaning =
    word?.lezgian ||
    word?.lezgi ||
    word?.translation ||
    lezgi ||
    translation ||
    "";
  const extraNotes = word?.notes || notes;
  const transcription = word?.transcription;
  const exampleLezgian = word?.exampleLezgian;
  const exampleRussian = word?.exampleRussian;

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

      {transcription ? (
        <p
          style={{
            color: "#777",
            marginTop: 6,
            fontSize: 14,
            fontWeight: 800,
            lineHeight: 1.35
          }}
        >
          {transcription}
        </p>
      ) : null}

      {exampleLezgian || exampleRussian ? (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 14,
            background: "#F8FAF6",
            border: "2px solid #E6E6E6",
            color: "#4B4B4B",
            fontSize: 14,
            fontWeight: 800,
            lineHeight: 1.4
          }}
        >
          {exampleLezgian ? <div>{exampleLezgian}</div> : null}
          {exampleRussian ? (
            <div style={{ color: "#777", marginTop: 4 }}>
              {exampleRussian}
            </div>
          ) : null}
        </div>
      ) : null}

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
