import { useEffect, useMemo, useRef, useState } from "react";

const WRONG_PAIR_TIMEOUT = 650;

export default function MatchQuestion({
  question,
  setSelected,
  disabled = false
}) {
  const setSelectedRef = useRef(setSelected);
  const [activeWord, setActiveWord] = useState(null);
  const [matches, setMatches] = useState({});
  const [wrongPair, setWrongPair] = useState(null);

  useEffect(() => {
    setSelectedRef.current = setSelected;
  }, [setSelected]);

  const pairs = useMemo(
    () => question?.pairs || [],
    [question?.pairs]
  );

  const translations = useMemo(
    () =>
      question?.translations ||
      pairs.map(pair => pair.translation),
    [question?.translations, pairs]
  );

  const correctByWord = useMemo(
    () =>
      pairs.reduce((result, pair) => ({
        ...result,
        [pair.word]: pair.translation
      }), {}),
    [pairs]
  );

  const matchedTranslations = useMemo(
    () => Object.values(matches),
    [matches]
  );

  useEffect(() => {
    setActiveWord(null);
    setMatches({});
    setWrongPair(null);
    setSelectedRef.current(null);
  }, [question?.id]);

  useEffect(() => {
    const isComplete =
      pairs.length > 0 &&
      pairs.every(pair =>
        matches[pair.word] === pair.translation
      );

    if (!isComplete) {
      setSelectedRef.current(null);
      return;
    }

    setSelectedRef.current(
      question?.correct ||
        pairs
          .map(pair => `${pair.word}:${matches[pair.word]}`)
          .join("|")
    );
  }, [matches, pairs, question?.correct]);

  useEffect(() => {
    if (!wrongPair) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setWrongPair(null);
    }, WRONG_PAIR_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [wrongPair]);

  if (!question || pairs.length === 0) {
    return (
      <p
        style={{
          margin: 0,
          color: "#4B4B4B",
          fontWeight: "800",
          textAlign: "center"
        }}
      >
        Для этого задания пока нет пар для сопоставления.
      </p>
    );
  }

  const chooseWord = (word) => {
    if (disabled) {
      return;
    }

    if (matches[word]) {
      return;
    }

    setActiveWord(word);
  };

  const chooseTranslation = (translation) => {
    if (disabled) {
      return;
    }

    if (!activeWord) {
      return;
    }

    if (matchedTranslations.includes(translation)) {
      return;
    }

    if (correctByWord[activeWord] === translation) {
      setMatches(prev => ({
        ...prev,
        [activeWord]: translation
      }));
      setActiveWord(null);
      setWrongPair(null);
      return;
    }

    setWrongPair({
      word: activeWord,
      translation
    });
    setActiveWord(null);
  };

  const isWrongWord = (word) =>
    wrongPair?.word === word;

  const isWrongTranslation = (translation) =>
    wrongPair?.translation === translation;

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
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginTop: 20
        }}
      >
        <div>
          {pairs.map(pair => {
            const matched = Boolean(matches[pair.word]);
            const active = activeWord === pair.word;
            const wrong = isWrongWord(pair.word);

            return (
              <button
                key={pair.word}
                disabled={matched || disabled}
                onClick={() => chooseWord(pair.word)}
                style={{
                  width: "100%",
                  minHeight: 58,
                  padding: "12px 10px",
                  marginBottom: 10,
                  borderRadius: 16,
                  border: wrong
                    ? "3px solid #FF4D4D"
                    : active || matched
                      ? "3px solid #46A400"
                      : "2px solid #E6E6E6",
                  background: wrong
                    ? "#FFD6D6"
                    : matched
                      ? "#D7FFB8"
                      : "#FFFFFF",
                  color: "#4B4B4B",
                  fontSize: 15,
                  fontWeight: "900",
                  cursor: matched
                    ? "default"
                    : disabled
                      ? "default"
                    : "pointer",
                  boxShadow: wrong
                    ? "0 5px 0 #C83737"
                    : active || matched
                      ? "0 5px 0 #46A400"
                      : "0 5px 0 #D9D9D9",
                  transition:
                    "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease"
                }}
              >
                {pair.word}
              </button>
            );
          })}
        </div>

        <div>
          {translations.map(translation => {
            const matched =
              matchedTranslations.includes(translation);
            const wrong =
              isWrongTranslation(translation);

            return (
              <button
                key={translation}
                disabled={matched || disabled}
                onClick={() => chooseTranslation(translation)}
                style={{
                  width: "100%",
                  minHeight: 58,
                  padding: "12px 10px",
                  marginBottom: 10,
                  borderRadius: 16,
                  border: wrong
                    ? "3px solid #FF4D4D"
                    : matched
                      ? "3px solid #46A400"
                      : "2px solid #E6E6E6",
                  background: wrong
                    ? "#FFD6D6"
                    : matched
                      ? "#D7FFB8"
                      : "#FFFFFF",
                  color: "#4B4B4B",
                  fontSize: 15,
                  fontWeight: "900",
                  cursor: activeWord && !matched
                    && !disabled
                    ? "pointer"
                    : "default",
                  boxShadow: wrong
                    ? "0 5px 0 #C83737"
                    : matched
                      ? "0 5px 0 #46A400"
                      : "0 5px 0 #D9D9D9",
                  transition:
                    "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease"
                }}
              >
                {translation}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
