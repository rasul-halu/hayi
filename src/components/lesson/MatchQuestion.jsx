import { useEffect, useRef, useState } from "react";
import { highlightNewWords } from "../../utils/highlightNewWords";
import {
  createMatchLayout,
  getMatchCompletionValue
} from "../../utils/matchQuestion";

const WRONG_PAIR_TIMEOUT = 650;
const CORRECT_PAIR_TIMEOUT = 650;

export default function MatchQuestion({
  question,
  setSelected,
  disabled = false
}) {
  const setSelectedRef = useRef(setSelected);
  const correctPairTimeoutRef = useRef(null);
  const layoutRef = useRef(null);
  const [activeLeftId, setActiveLeftId] = useState(null);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const [recentlyMatchedPairId, setRecentlyMatchedPairId] = useState(null);

  useEffect(() => {
    setSelectedRef.current = setSelected;
  }, [setSelected]);

  const layoutKey = question?.id ?? question;

  if (!layoutRef.current || layoutRef.current.key !== layoutKey) {
    layoutRef.current = {
      key: layoutKey,
      value: createMatchLayout(question)
    };
  }

  const layout = layoutRef.current.value;
  const { pairs, leftItems, rightItems } = layout;
  const completionValue = getMatchCompletionValue(question);

  useEffect(() => {
    if (correctPairTimeoutRef.current) {
      clearTimeout(correctPairTimeoutRef.current);
      correctPairTimeoutRef.current = null;
    }

    setActiveLeftId(null);
    setMatchedPairIds([]);
    setWrongPair(null);
    setRecentlyMatchedPairId(null);
    setSelectedRef.current(null);
  }, [layoutKey]);

  useEffect(() => () => {
    if (correctPairTimeoutRef.current) {
      clearTimeout(correctPairTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const isComplete =
      pairs.length > 0 &&
      pairs.every(pair => matchedPairIds.includes(pair.id));

    if (!isComplete || recentlyMatchedPairId) {
      setSelectedRef.current(null);
      return;
    }

    setSelectedRef.current(completionValue);
  }, [completionValue, matchedPairIds, pairs, recentlyMatchedPairId]);

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

  const chooseLeft = (item) => {
    if (disabled || matchedPairIds.includes(item.pairId)) {
      return;
    }

    setActiveLeftId(item.id);
  };

  const chooseRight = (item) => {
    const activeLeft = leftItems.find(leftItem => leftItem.id === activeLeftId);

    if (
      disabled ||
      !activeLeft ||
      matchedPairIds.includes(item.pairId)
    ) {
      return;
    }

    if (activeLeft.pairId === item.pairId) {
      setMatchedPairIds(current => (
        current.includes(item.pairId)
          ? current
          : [...current, item.pairId]
      ));
      setRecentlyMatchedPairId(item.pairId);
      setActiveLeftId(null);
      setWrongPair(null);

      if (correctPairTimeoutRef.current) {
        clearTimeout(correctPairTimeoutRef.current);
      }

      correctPairTimeoutRef.current = setTimeout(() => {
        setRecentlyMatchedPairId(null);
        correctPairTimeoutRef.current = null;
      }, CORRECT_PAIR_TIMEOUT);

      return;
    }

    setWrongPair({
      leftId: activeLeft.id,
      rightId: item.id
    });
    setActiveLeftId(null);
  };

  function getItemStyle({ active, wrong, correctFlash, matched }) {
    const matchedDisabled = matched && !correctFlash;

    return {
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
    };
  }

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
          {leftItems.map(item => {
            const matched = matchedPairIds.includes(item.pairId);

            return (
              <button
                key={item.id}
                type="button"
                disabled={matched || disabled}
                onClick={() => chooseLeft(item)}
                style={getItemStyle({
                  active: activeLeftId === item.id,
                  wrong: wrongPair?.leftId === item.id,
                  correctFlash: recentlyMatchedPairId === item.pairId,
                  matched
                })}
              >
                {highlightNewWords(item.text, question)}
              </button>
            );
          })}
        </div>

        <div>
          {rightItems.map(item => {
            const matched = matchedPairIds.includes(item.pairId);

            return (
              <button
                key={item.id}
                type="button"
                disabled={matched || disabled}
                onClick={() => chooseRight(item)}
                style={getItemStyle({
                  active: false,
                  wrong: wrongPair?.rightId === item.id,
                  correctFlash: recentlyMatchedPairId === item.pairId,
                  matched
                })}
              >
                {highlightNewWords(item.text, question)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
