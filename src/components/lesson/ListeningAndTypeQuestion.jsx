import AudioPlayButton from "../audio/AudioPlayButton";
import { highlightNewWords } from "../../utils/highlightNewWords";

function renderSentence(sentence, question) {
  const text = String(sentence || "");
  const placeholder = text.match(/_{3,}/);

  if (!placeholder || placeholder.index === undefined) {
    return highlightNewWords(text, question);
  }

  const before = text.slice(0, placeholder.index);
  const after = text.slice(placeholder.index + placeholder[0].length);

  return (
    <>
      {highlightNewWords(before, question)}
      <span className="listening-type-blank" aria-hidden="true" />
      {highlightNewWords(after, question)}
    </>
  );
}

export default function ListeningAndTypeQuestion({
  question,
  selected,
  setSelected,
  disabled = false,
  feedbackStatus = "idle"
}) {
  const inputState = feedbackStatus === "correct"
    ? " listening-type-input--correct"
    : feedbackStatus === "wrong"
      ? " listening-type-input--wrong"
      : "";

  return (
    <div className="listening-type-question">
      <h2 className="listening-type-instruction">
        {highlightNewWords(
          question.prompt || "Прослушайте и впишите пропущенное слово",
          question
        )}
      </h2>

      {question.audioUrl ? (
        <div className="listening-type-audio">
          <AudioPlayButton
            src={question.audioUrl}
            size={82}
            label="Прослушать предложение"
            disabled={disabled}
          />
        </div>
      ) : null}

      <div className="listening-type-sentence">
        {renderSentence(question.sentence, question)}
      </div>

      <label className="listening-type-field">
        <span>Пропущенное слово</span>
        <input
          type="text"
          value={typeof selected === "string" ? selected : ""}
          onChange={event => setSelected(event.target.value)}
          disabled={disabled}
          className={`listening-type-input${inputState}`}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Введите слово"
        />
      </label>
    </div>
  );
}
