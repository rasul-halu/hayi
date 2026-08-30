import {
  ADMIN_QUESTION_TYPES,
  isListeningAndTypeAnswerCorrect,
  normalizeQuestionType,
  QUESTION_TYPES
} from "./questionTypes";

test("normalizes legacy choice question types", () => {
  expect(normalizeQuestionType("translate")).toBe(QUESTION_TYPES.MULTIPLE_CHOICE);
  expect(normalizeQuestionType("multiple-choice")).toBe(QUESTION_TYPES.MULTIPLE_CHOICE);
  expect(normalizeQuestionType("multipleChoice")).toBe(QUESTION_TYPES.MULTIPLE_CHOICE);
  expect(ADMIN_QUESTION_TYPES.filter(type =>
    type.value === QUESTION_TYPES.MULTIPLE_CHOICE
  )).toHaveLength(1);
  expect(ADMIN_QUESTION_TYPES.some(type => type.value === "translate")).toBe(false);
});

test("checks listening input without changing meaningful Lezgian symbols", () => {
  const question = {
    correct: "Къене",
    metadata: {
      acceptedAnswers: ["къене I"]
    }
  };

  expect(isListeningAndTypeAnswerCorrect(question, "  кЪЕНЕ  ")).toBe(true);
  expect(isListeningAndTypeAnswerCorrect(question, "къене I")).toBe(true);
  expect(isListeningAndTypeAnswerCorrect(question, "кене")).toBe(false);
});
