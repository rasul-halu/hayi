import AnswerButton from "./AnswerButton";

export default function ListeningQuestion({
  question,
  selected,
  setSelected
}) {
  return (
    <>
      <h2>{question.prompt}</h2>

      <div
        style={{
          marginTop: 30,

          textAlign: "center"
        }}
      >
        🔊
      </div>

      <p
        style={{
          textAlign: "center"
        }}
      >
        Здесь будет аудио
      </p>

      {question.answers.map(answer => (

        <AnswerButton
        key={answer}
        text={answer}
        selected={selected === answer}
        onClick={() =>
            setSelected(answer)
        }
        />
      ))}
    </>
  );
}