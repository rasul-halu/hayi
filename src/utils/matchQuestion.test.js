import {
  createMatchLayout,
  getMatchCompletionValue,
  isMatchAnswerCorrect,
  normalizeMatchPairs,
  shuffleMatchItems
} from "./matchQuestion";

const question = {
  id: "matching-test",
  type: "match",
  correct: "старое ручное значение",
  pairs: [
    { word: "гьикI ава", translation: "как дела" },
    { word: "сагърай", translation: "спасибо" },
    { word: "салам", translation: "привет" },
    { word: "хъсан югъ", translation: "добрый день" }
  ]
};

test("normalizes all matching pairs without using correctAnswer", () => {
  const pairs = normalizeMatchPairs(question);

  expect(pairs).toHaveLength(4);
  expect(pairs[0]).toMatchObject({
    left: "гьикI ава",
    right: "как дела"
  });
});

test("shuffles copies and keeps both columns independently associated by pairId", () => {
  const source = ["one", "two", "three", "four"];
  const shuffled = shuffleMatchItems(source, () => 0);
  const layout = createMatchLayout(question, () => 0.5);

  expect(source).toEqual(["one", "two", "three", "four"]);
  expect(shuffled).not.toBe(source);
  expect(layout.leftItems).toHaveLength(4);
  expect(layout.rightItems).toHaveLength(4);
  expect(layout.leftItems.every((left, index) => (
    left.pairId !== layout.rightItems[index].pairId
  ))).toBe(true);
});

test("can produce a new order for a new matching attempt", () => {
  const firstAttempt = createMatchLayout(question, () => 0);
  const secondAttempt = createMatchLayout(question, () => 0.999);

  expect(firstAttempt.leftItems.map(item => item.pairId))
    .not.toEqual(secondAttempt.leftItems.map(item => item.pairId));
});

test("uses unique pair ids even when visible text is duplicated", () => {
  const pairs = normalizeMatchPairs({
    id: "duplicates",
    pairs: [
      { word: "салам", translation: "привет" },
      { word: "салам", translation: "здравствуй" },
      { word: "сагърай", translation: "привет" }
    ]
  });

  expect(new Set(pairs.map(pair => pair.id)).size).toBe(3);
});

test("matching completion ignores legacy correctAnswer", () => {
  const completionValue = getMatchCompletionValue(question);

  expect(isMatchAnswerCorrect(question, completionValue)).toBe(true);
  expect(isMatchAnswerCorrect(question, question.correct)).toBe(false);
  expect(isMatchAnswerCorrect(question, "anything else")).toBe(false);
});
