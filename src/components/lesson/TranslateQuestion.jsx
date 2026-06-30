import AnswerButton from "./AnswerButton";

export default function TranslateQuestion({
  question,
  selected,
  setSelected,
  disabled = false,
  feedbackStatus = "idle"
}) {
  return (
    <>
      <h2
        style={{
          margin: "0 0 18px",
          color: "#777",
          fontSize: 15,
          lineHeight: 1.35,
          fontWeight: "900",
          textTransform: "uppercase"
        }}
      >
        {question.prompt}
      </h2>

      <div
        style={{
          background: "#FFFFFF",
          border: "2px solid #E6E6E6",
          borderRadius: 22,
          padding: "30px 18px",
          textAlign: "center",
          boxShadow: "0 5px 0 #D9D9D9",
          marginBottom: 24
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#4B4B4B",
            fontSize: 32,
            fontWeight: "900"
          }}
        >
          {question.question}
        </h1>
      </div>

      {question.answers.map(answer => (

        <AnswerButton
        key={answer}
        text={answer}
        selected={selected === answer}
        disabled={disabled}
        feedbackStatus={feedbackStatus}
        onClick={() =>
            setSelected(answer)
        }
        />

      ))}
    </>
  );
}
