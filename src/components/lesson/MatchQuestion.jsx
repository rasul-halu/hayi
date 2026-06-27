import { useEffect, useMemo, useState } from "react";

export default function MatchQuestion({
  question,
  setSelected
}) {
  const [activeWord, setActiveWord] = useState(null);
  const [matches, setMatches] = useState({});

  const pairs = useMemo(
    () => question.pairs || [],
    [question.pairs]
  );

  const translations = useMemo(
    () =>
      question.translations ||
      pairs.map(pair => pair.translation),
    [pairs, question.translations]
  );

  useEffect(() => {
    setActiveWord(null);
    setMatches({});
    setSelected(null);
  }, [question.id, setSelected]);

  useEffect(() => {
    const isComplete =
      pairs.length > 0 &&
      pairs.every(pair => matches[pair.word]);

    if (!isComplete) {
      setSelected(null);
      return;
    }

    setSelected(
      pairs
        .map(pair =>
          `${pair.word}:${matches[pair.word]}`
        )
        .join("|")
    );
  }, [matches, pairs, setSelected]);

  const chooseTranslation = (translation) => {
    if (!activeWord) {
      return;
    }

    setMatches(prev => {
      const nextMatches = {};

      Object.entries(prev).forEach(([word, value]) => {
        if (value !== translation) {
          nextMatches[word] = value;
        }
      });

      return {
        ...nextMatches,
        [activeWord]: translation
      };
    });

    setActiveWord(null);
  };

  return (
    <>
      <h2>{question.prompt}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 30
        }}
      >
        <div>
          {pairs.map(pair => (
            <button
              key={pair.word}
              onClick={() =>
                setActiveWord(pair.word)
              }
              style={{
                width: "100%",
                minHeight: 56,
                padding: 12,
                marginBottom: 12,
                borderRadius: 18,
                border:
                  activeWord === pair.word
                    ? "3px solid #58CC02"
                    : "2px solid #777",
                background: matches[pair.word]
                  ? "#E9F8DD"
                  : "#F5F5F5",
                color: "#000",
                fontSize: 16,
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {pair.word}
            </button>
          ))}
        </div>

        <div>
          {translations.map(translation => (
            <button
              key={translation}
              onClick={() =>
                chooseTranslation(translation)
              }
              style={{
                width: "100%",
                minHeight: 56,
                padding: 12,
                marginBottom: 12,
                borderRadius: 18,
                border: Object.values(matches)
                  .includes(translation)
                    ? "3px solid #58CC02"
                    : "2px solid #777",
                background: Object.values(matches)
                  .includes(translation)
                    ? "#58CC02"
                    : "#F5F5F5",
                color: Object.values(matches)
                  .includes(translation)
                    ? "#fff"
                    : "#000",
                fontSize: 16,
                fontWeight: "600",
                cursor: activeWord
                  ? "pointer"
                  : "default"
              }}
            >
              {translation}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
