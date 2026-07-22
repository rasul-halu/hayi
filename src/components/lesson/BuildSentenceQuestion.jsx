import { useEffect, useMemo, useRef, useState } from "react";
import { highlightNewWords } from "../../utils/highlightNewWords";
import AudioPlayButton from "../audio/AudioPlayButton";

function moveItem(items, index) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export default function BuildSentenceQuestion({
  question,
  setSelected,
  disabled = false,
  feedbackStatus = "idle"
}) {
  const setSelectedRef = useRef(setSelected);

  useEffect(() => {
    setSelectedRef.current = setSelected;
  }, [setSelected]);

  const initialWords = useMemo(
    () => Array.isArray(question?.words) ? question.words : [],
    [question?.words]
  );

  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState(initialWords);

  useEffect(() => {
    setSelectedWords([]);
    setAvailableWords(initialWords);
    setSelectedRef.current("");
  }, [initialWords, question?.id]);

  useEffect(() => {
    setSelectedRef.current(selectedWords.join(" "));
  }, [selectedWords]);

  if (!question || initialWords.length === 0) {
    return (
      <p
        style={{
          margin: 0,
          color: "#4B4B4B",
          fontWeight: 800,
          textAlign: "center"
        }}
      >
        Не удалось загрузить слова для задания
      </p>
    );
  }

  const addWord = (word, index) => {
    if (disabled) {
      return;
    }

    setSelectedWords(prev => [...prev, word]);
    setAvailableWords(prev => moveItem(prev, index));
  };

  const removeWord = (word, index) => {
    if (disabled) {
      return;
    }

    setSelectedWords(prev => moveItem(prev, index));
    setAvailableWords(prev => [...prev, word]);
  };

  const buildAreaWrong = feedbackStatus === "wrong";
  const buildAreaCorrect = feedbackStatus === "correct";

  return (
    <>
      <h2
        style={{
          margin: "0 0 14px",
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
          marginBottom: 16,
          padding: "18px 16px",
          borderRadius: 20,
          background: "#F8FAF6",
          border: "2px solid #E6E6E6",
          color: "#4B4B4B",
          boxShadow: "0 5px 0 #D9D9D9"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "#777",
                fontSize: 13,
                fontWeight: 900,
                marginBottom: 6
              }}
            >
              Переведите:
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                lineHeight: 1.25,
                overflowWrap: "anywhere"
              }}
            >
              {highlightNewWords(question.question, question)}
            </div>
          </div>

          {question.audioUrl ? (
            <AudioPlayButton
              src={question.audioUrl}
              size={58}
              label="Прослушать правильное предложение"
              disabled={disabled}
              variant="soft"
            />
          ) : null}
        </div>
      </div>

      <div
        style={{
          minHeight: 74,
          padding: 12,
          borderRadius: 18,
          border: buildAreaWrong
            ? "2px solid #F06A6A"
            : buildAreaCorrect
              ? "2px solid #58CC02"
              : "2px dashed #BDBDBD",
          background: buildAreaWrong
            ? "#FFF0F0"
            : buildAreaCorrect
              ? "#E9F8DD"
              : "#FFFFFF",
          boxShadow: buildAreaWrong
            ? "0 5px 0 #E6A0A0"
            : buildAreaCorrect
              ? "0 5px 0 #BFE8A7"
              : "0 5px 0 #D9D9D9",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center"
        }}
      >
        {selectedWords.length === 0 ? (
          <span
            style={{
              color: "#8A8A8A",
              fontWeight: 800
            }}
          >
            Собери предложение
          </span>
        ) : (
          selectedWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              type="button"
              disabled={disabled}
              onClick={() => removeWord(word, index)}
              style={{
                padding: "10px 13px",
                borderRadius: 14,
                border: "2px solid #58CC02",
                background: "#E9F8DD",
                color: "#4B4B4B",
                boxShadow: "0 3px 0 #46A400",
                fontWeight: 900,
                cursor: disabled ? "default" : "pointer"
              }}
            >
              {highlightNewWords(word, question)}
            </button>
          ))
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 18
        }}
      >
        {availableWords.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            disabled={disabled}
            onClick={() => addWord(word, index)}
            style={{
              minHeight: 48,
              padding: "12px 15px",
              borderRadius: 16,
              border: "2px solid #E6E6E6",
              background: "#FFFFFF",
              color: "#4B4B4B",
              boxShadow: "0 4px 0 #D9D9D9",
              fontSize: 16,
              fontWeight: 900,
              cursor: disabled ? "default" : "pointer",
              opacity: disabled ? 0.72 : 1
            }}
          >
            {highlightNewWords(word, question)}
          </button>
        ))}
      </div>
    </>
  );
}
