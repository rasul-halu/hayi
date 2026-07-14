import { useEffect, useMemo, useRef, useState } from "react";
import { highlightNewWords } from "../../utils/highlightNewWords";

const WRONG_PAIR_TIMEOUT = 650;
const CORRECT_PAIR_TIMEOUT = 650;

export default function MatchQuestion({
  question,
  setSelected,
  disabled = false
}) {
  const setSelectedRef = useRef(setSelected);
  const correctPairTimeoutRef = useRef(null);
  const [activeWord, setActiveWord] = useState(null);
  const [matches, setMatches] = useState({});
  const [wrongPair, setWrongPair] = useState(null);
  const [recentlyMatchedPair, setRecentlyMatchedPair] = useState(null);

  useEffect(() => {
    setSelectedRef.current = setSelected;
  }, [setSelected]);

  const pairs = useMemo(
    () => question?.pairs || [],
    [question?.pairs]
  );

  const translations = useMemo(
    () => question?.translations || pairs.map(pair => pair.translation),
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
    if (correctPairTimeoutRef.current) {
      clearTimeout(correctPairTimeoutRef.current);
      correctPairTimeoutRef.current = null;
    }

    setActiveWord(null);
    setMatches({});
    setWrongPair(null);
    setRecentlyMatchedPair(null);
    setSelectedRef.current(null);
  }, [question?.id]);

  useEffect(() => {
    return () => {
      if (correctPairTimeoutRef.current) {
        clearTimeout(correctPairTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const isComplete =
      pairs.length > 0 &&
      pairs.every(pair => matches[pair.word] === pair.translation);

    if (!isComplete || recentlyMatchedPair) {
      setSelectedRef.current(null);
      return;
    }

    setSelectedRef.current(
      question?.correct ||
        pairs
          .map(pair => `${pair.word}:${matches[pair.word]}`)
          .join("|")
    );
  }, [matches, pairs, question?.correct, recentlyMatchedPair]);

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
          fontWeight: 800,
          textAlign: "center"
        }}
      >
        Для этого задания пока нет пар для сопоставления.
      </p>
    );
  }

  const chooseWord = (word) => {
    if (disabled || matches[word]) {
      return;
    }

    setActiveWord(word);
  };

  const chooseTranslation = (translation) => {
    if (disabled || !activeWord || matchedTranslations.includes(translation)) {
      return;
    }

    if (correctByWord[activeWord] === translation) {
      setMatches(prev => ({
        ...prev,
        [activeWord]: translation
      }));
      setRecentlyMatchedPair({
        word: activeWord,
        translation
      });
      setActiveWord(null);
      setWrongPair(null);

      if (correctPairTimeoutRef.current) {
        clearTimeout(correctPairTimeoutRef.current);
      }

      correctPairTimeoutRef.current = setTimeout(() => {
        setRecentlyMatchedPair(null);
        correctPairTimeoutRef.current = null;
      }, CORRECT_PAIR_TIMEOUT);

      return;
    }

    setWrongPair({
      word: activeWord,
      translation
    });
    setActiveWord(null);
  };

  const isWrongWord = (word) => wrongPair?.word === word;
  const isWrongTranslation = (translation) => wrongPair?.translation === translation;
  const isRecentlyMatchedWord = (word) => recentlyMatchedPair?.word === word;
  const isRecentlyMatchedTranslation = (translation) =>
    recentlyMatchedPair?.translation === translation;

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
            const correctFlash = isRecentlyMatchedWord(pair.word);
            const matchedDisabled = matched && !correctFlash;

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
                    ? "3px solid #F06A6A"
                    : correctFlash
                      ? "3px solid #46A400"
                      : active
                        ? "3px solid #58CC02"
                        : matchedDisabled
                          ? "2px solid #D9D9D9"
                          : "2px solid #E6E6E6",
                  background: wrong
                    ? "#FFF0F0"
                    : correctFlash
                      ? "#E9F8DD"
                      : matchedDisabled
                        ? "#EFEFEF"
                        : "#FFFFFF",
                  color: matchedDisabled ? "#8A8A8A" : "#4B4B4B",
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: matched || disabled ? "default" : "pointer",
                  boxShadow: wrong
                    ? "0 5px 0 #E6A0A0"
                    : correctFlash
                      ? "0 5px 0 #46A400"
                      : active
                        ? "0 5px 0 #58CC02"
                        : matchedDisabled
                          ? "0 5px 0 #CFCFCF"
                          : "0 5px 0 #D9D9D9",
                  opacity: matchedDisabled ? 0.72 : 1,
                  transition:
                    "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease"
                }}
              >
                {highlightNewWords(pair.word, question)}
              </button>
            );
          })}
        </div>

        <div>
          {translations.map(translation => {
            const matched = matchedTranslations.includes(translation);
            const wrong = isWrongTranslation(translation);
            const correctFlash = isRecentlyMatchedTranslation(translation);
            const matchedDisabled = matched && !correctFlash;

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
                    ? "3px solid #F06A6A"
                    : correctFlash
                      ? "3px solid #46A400"
                      : matchedDisabled
                        ? "2px solid #D9D9D9"
                        : "2px solid #E6E6E6",
                  background: wrong
                    ? "#FFF0F0"
                    : correctFlash
                      ? "#E9F8DD"
                      : matchedDisabled
                        ? "#EFEFEF"
                        : "#FFFFFF",
                  color: matchedDisabled ? "#8A8A8A" : "#4B4B4B",
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: activeWord && !matched && !disabled ? "pointer" : "default",
                  boxShadow: wrong
                    ? "0 5px 0 #E6A0A0"
                    : correctFlash
                      ? "0 5px 0 #46A400"
                      : matchedDisabled
                        ? "0 5px 0 #CFCFCF"
                        : "0 5px 0 #D9D9D9",
                  opacity: matchedDisabled ? 0.72 : 1,
                  transition:
                    "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease"
                }}
              >
                {highlightNewWords(translation, question)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
