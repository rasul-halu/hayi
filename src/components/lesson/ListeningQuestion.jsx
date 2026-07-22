import AnswerButton, {
  getOptionLabel,
  getOptionValue
} from "./AnswerButton";
import { highlightNewWords } from "../../utils/highlightNewWords";
import AudioPlayButton from "../audio/AudioPlayButton";

export default function ListeningQuestion({
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
          fontWeight: 900,
          textTransform: "uppercase"
        }}
      >
        {highlightNewWords(question.prompt, question)}
      </h2>

      <div
        style={{
          background: "#F8FAF6",
          border: "2px solid #E6E6E6",
          borderRadius: 22,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 5px 0 #D9D9D9",
          marginBottom: 24
        }}
      >
        {question.audioUrl ? (
          <AudioPlayButton
            src={question.audioUrl}
            size={88}
            label="Прослушать задание"
            disabled={disabled}
          />
        ) : null}

        <p
          style={{
            margin: "18px 0 0",
            color: "#4B4B4B",
            fontWeight: 900
          }}
        >
          Прослушай и выбери ответ
        </p>

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
