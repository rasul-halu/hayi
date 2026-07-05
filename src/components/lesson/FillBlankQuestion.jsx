import AnswerButton from "./AnswerButton";
import { highlightNewWords } from "../../utils/highlightNewWords";

function renderSentence(sentence, question) {
  const parts = sentence.split("____");

  if (parts.length === 1) {
    return highlightNewWords(sentence, question);
  }

  return parts.map((part, index) => (
    <span key={`${part}-${index}`}>
      {highlightNewWords(part, question)}
      {index < parts.length - 1 && (
        <span
          style={{
            display: "inline-block",
            minWidth: 92,
            margin: "0 6px",
            padding: "4px 12px",
            borderRadius: 12,
            background: "#D7FFB8",
            border: "2px solid #58CC02",
            color: "#46A400",
            fontWeight: "900",
            textAlign: "center"
          }}
        >
          ____
        </span>
      )}
    </span>
  ));
}

export default function FillBlankQuestion({
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
        {highlightNewWords(question.prompt, question)}
      </h2>

      <div
        style={{
          background: "#FFFFFF",
          border: "2px solid #E6E6E6",
          borderRadius: 22,
          padding: "26px 18px",
          color: "#4B4B4B",
          fontSize: 26,
          fontWeight: "900",
          lineHeight: 1.35,
          textAlign: "center",
          boxShadow: "0 5px 0 #D9D9D9",
          marginBottom: 24
        }}
      >
        {renderSentence(question.sentence, question)}
      </div>

      {question.answers.map(answer => (
        <AnswerButton
          key={answer}
          text={answer}
          selected={selected === answer}
          disabled={disabled}
          feedbackStatus={feedbackStatus}
          newWords={question}
          onClick={() =>
            setSelected(answer)
          }
        />
      ))}
    </>
  );
}
