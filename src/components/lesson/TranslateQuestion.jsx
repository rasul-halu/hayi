import AnswerButton, {
  getOptionLabel,
  getOptionValue
} from "./AnswerButton";
import { highlightNewWords } from "../../utils/highlightNewWords";

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
        {highlightNewWords(question.prompt, question)}
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
          {highlightNewWords(question.question, question)}
        </h1>
      </div>

      {question.answers.map(answer => {
        const answerLabel = getOptionLabel(answer);
        const answerValue = getOptionValue(answer);

        return (
        <AnswerButton
          key={answerValue || answerLabel}
          label={answerLabel}
          selected={selected === answerValue}
          disabled={disabled}
          feedbackStatus={feedbackStatus}
          newWords={question}
          onClick={() => setSelected(answerValue)}
        />
        );
      })}

    </>
  );
}
