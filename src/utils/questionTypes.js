export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multipleChoice",
  LISTENING: "listening",
  LISTENING_AND_TYPE: "listeningAndType",
  FILL_BLANK: "fillBlank",
  MATCH: "match",
  BUILD_SENTENCE: "buildSentence"
};

const TYPE_ALIASES = {
  translate: QUESTION_TYPES.MULTIPLE_CHOICE,
  "multiple-choice": QUESTION_TYPES.MULTIPLE_CHOICE,
  multipleChoice: QUESTION_TYPES.MULTIPLE_CHOICE
};

export const ADMIN_QUESTION_TYPES = [
  { value: QUESTION_TYPES.MULTIPLE_CHOICE, label: "Выбор ответа" },
  { value: QUESTION_TYPES.LISTENING, label: "Аудирование" },
  { value: QUESTION_TYPES.LISTENING_AND_TYPE, label: "Прослушивание + ввод" },
  { value: QUESTION_TYPES.FILL_BLANK, label: "Пропуск" },
  { value: QUESTION_TYPES.MATCH, label: "Сопоставление" },
  { value: QUESTION_TYPES.BUILD_SENTENCE, label: "Собрать предложение" }
];

export const QUESTION_TYPE_LABELS = Object.fromEntries(
  ADMIN_QUESTION_TYPES.map(type => [type.value, type.label])
);

export function normalizeQuestionType(type) {
  return TYPE_ALIASES[type] || type;
}

export function isChoiceQuestionType(type) {
  return normalizeQuestionType(type) === QUESTION_TYPES.MULTIPLE_CHOICE;
}

export function normalizeTextAnswer(value) {
  return typeof value === "string"
    ? value.trim().toLocaleLowerCase()
    : "";
}

export function normalizeBuildSentenceAnswer(value) {
  return typeof value === "string"
    ? value
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[.!?]+$/u, "")
        .trimEnd()
    : "";
}

export function isBuildSentenceAnswerCorrect(question, answer) {
  const correctAnswer =
    question?.targetSentence ||
    question?.correct ||
    question?.correctAnswer ||
    "";
  const normalizedAnswer = normalizeBuildSentenceAnswer(answer);

  return normalizedAnswer.length > 0 &&
    normalizedAnswer === normalizeBuildSentenceAnswer(correctAnswer);
}

export function formatChoiceOptionLabel(value) {
  return typeof value === "string"
    ? value.trimEnd().replace(/[.!?]+$/u, "").trimEnd()
    : value;
}

export function isListeningAndTypeAnswerCorrect(question, answer) {
  const acceptedAnswers = Array.isArray(question?.acceptedAnswers)
    ? question.acceptedAnswers
    : Array.isArray(question?.metadata?.acceptedAnswers)
      ? question.metadata.acceptedAnswers
      : [];
  const candidates = [question?.correct, question?.correctAnswer, ...acceptedAnswers]
    .map(normalizeTextAnswer)
    .filter(Boolean);
  const normalizedAnswer = normalizeTextAnswer(answer);

  return normalizedAnswer.length > 0 && candidates.includes(normalizedAnswer);
}
