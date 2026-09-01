import {
  ADMIN_QUESTION_TYPES,
  formatChoiceOptionLabel,
  isBuildSentenceAnswerCorrect,
  isListeningAndTypeAnswerCorrect,
  normalizeBuildSentenceAnswer,
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

test("normalizes build sentence spacing and trailing punctuation only", () => {
  expect(normalizeBuildSentenceAnswer("Им зи вах я")).toBe("Им зи вах я");
  expect(normalizeBuildSentenceAnswer("Им зи вах я.")).toBe("Им зи вах я");
  expect(normalizeBuildSentenceAnswer("  Им зи вах я  ")).toBe("Им зи вах я");
  expect(normalizeBuildSentenceAnswer("Им   зи  вах   я!"))
    .toBe("Им зи вах я");
});

test("checks build sentence without accepting wrong words or word order", () => {
  const question = {
    targetSentence: "Им зи вах я."
  };

  expect(isBuildSentenceAnswerCorrect(question, "Им зи вах я")).toBe(true);
  expect(isBuildSentenceAnswerCorrect(question, "  Им зи вах я  ")).toBe(true);
  expect(isBuildSentenceAnswerCorrect(question, "Им   зи  вах   я")).toBe(true);
  expect(isBuildSentenceAnswerCorrect(question, "Им вах зи я")).toBe(false);
  expect(isBuildSentenceAnswerCorrect(question, "Им зи стха я")).toBe(false);
});

test("formats only trailing punctuation in choice option labels", () => {
  expect(formatChoiceOptionLabel("Это мой брат.")).toBe("Это мой брат");
  expect(formatChoiceOptionLabel("Как твои дела, брат?")).toBe("Как твои дела, брат");
  expect(formatChoiceOptionLabel("Фраза!?!")).toBe("Фраза");
  expect(formatChoiceOptionLabel("г-н. Али")).toBe("г-н. Али");
});
