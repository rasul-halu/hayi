import AnswerButton from "./AnswerButton";

export default function TranslateQuestion({
  question,
  selected,
  setSelected
}) {
  return (
    <>
      <h2>{question.prompt}</h2>

      <h1
        style={{
          textAlign: "center",
          marginTop: 30
        }}
      >
        {question.question}
      </h1>

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