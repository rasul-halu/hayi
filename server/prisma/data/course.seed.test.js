import assert from "node:assert/strict";
import test from "node:test";

import { courseSeed } from "./course.seed.js";

function getFamilyLesson() {
  const chapter = courseSeed.chapters.find(item => item.order === 2);
  const lesson = chapter?.lessons.find(item => item.legacyId === "3");

  assert.ok(chapter, "Chapter 2 must exist");
  assert.ok(lesson, "Family lesson must exist");

  return { chapter, lesson };
}

function getSecondFamilyLesson() {
  const chapter = courseSeed.chapters.find(item => item.order === 2);
  const lesson = chapter?.lessons.find(item => item.order === 2);

  assert.ok(lesson, "Second family lesson must exist");
  return lesson;
}

function getThirdFamilyLesson() {
  const chapter = courseSeed.chapters.find(item => item.order === 2);
  const lesson = chapter?.lessons.find(item => item.order === 3);

  assert.ok(lesson, "Third family lesson must exist");
  return lesson;
}

function getFourthFamilyLesson() {
  const chapter = courseSeed.chapters.find(item => item.order === 2);
  const lesson = chapter?.lessons.find(item => item.order === 4);

  assert.ok(lesson, "Fourth family lesson must exist");
  return lesson;
}

function getFifthFamilyLesson() {
  const chapter = courseSeed.chapters.find(item => item.order === 2);
  const lesson = chapter?.lessons.find(item => item.order === 5);

  assert.ok(lesson, "Fifth family lesson must exist");
  return lesson;
}

test("chapter 2 contains the complete family lesson in the required order", () => {
  const { chapter, lesson } = getFamilyLesson();

  assert.equal(chapter.description, "Рассказывайте о семье");
  assert.equal(lesson.title, "Это мой брат");
  assert.equal(lesson.questions.length, 11);
  assert.deepEqual(
    lesson.questions.map(question => question.order),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  );
  assert.deepEqual(
    lesson.questions.map(question => question.type),
    [
      "multipleChoice",
      "multipleChoice",
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
      "fillBlank",
      "multipleChoice",
      "buildSentence",
      "listening",
      "listeningAndType",
      "multipleChoice",
    ]
  );
});

test("family lesson answers match the existing question mechanics", () => {
  const { lesson } = getFamilyLesson();
  const choiceQuestions = lesson.questions.filter(question =>
    ["multipleChoice", "listening"].includes(question.type)
  );

  for (const question of choiceQuestions) {
    assert.ok(
      question.answers.includes(question.correct),
      `Question ${question.order} must include its correct option`
    );
  }

  const firstBuild = lesson.questions[3];
  const secondBuild = lesson.questions[7];
  assert.equal(firstBuild.correct, "зи стха");
  assert.equal(firstBuild.targetSentence, "зи стха");
  assert.equal(secondBuild.correct, "Им зи вах я.");
  assert.equal(secondBuild.targetSentence, "Им зи вах я.");

  const fillBlank = lesson.questions[5];
  assert.equal(fillBlank.sentence, "Им зи ____ я.");
  assert.equal(fillBlank.correct, "вах");
  assert.deepEqual(fillBlank.answers, ["вах", "вун", "им", "я"]);

  const listeningAndType = lesson.questions[9];
  assert.equal(listeningAndType.sentence, "Им зи ___ я.");
  assert.equal(listeningAndType.correct, "вах");
  assert.equal(listeningAndType.answers, undefined);
});

test("new word markers and audio placeholders do not add extra content", () => {
  const { lesson } = getFamilyLesson();
  const markedWords = lesson.questions
    .filter(question => question.newWord)
    .map(question => [question.order, question.newWord]);

  assert.deepEqual(markedWords, [
    [1, { text: "стха", translation: "брат" }],
    [3, { text: "зи", translation: "мой / моя / моё" }],
    [5, { text: "вах", translation: "сестра" }],
    [7, { text: "им", translation: "это" }],
  ]);

  assert.equal(lesson.questions[8].audioUrl, undefined);
  assert.equal(lesson.questions[9].audioUrl, undefined);
});

test("family lesson 2 keeps its ordered question contract", () => {
  const lesson = getSecondFamilyLesson();

  assert.equal(lesson?.title, "Моя семья");
  assert.equal(lesson.questions.length, 13);
  assert.deepEqual(
    lesson.questions.map(question => question.order),
    Array.from({ length: 13 }, (_, index) => index + 1)
  );
  assert.deepEqual(
    lesson.questions.map(question => question.type),
    [
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
      "match",
      "listening",
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
      "fillBlank",
      "listeningAndType",
      "multipleChoice",
      "multipleChoice",
      "buildSentence",
    ]
  );
});

test("family lesson choice options omit trailing punctuation", () => {
  const lesson = getSecondFamilyLesson();
  const choiceQuestions = lesson.questions.filter(question =>
    ["multipleChoice", "listening"].includes(question.type)
  );

  for (const question of choiceQuestions) {
    assert.ok(question.answers.includes(question.correct));
    assert.equal(
      question.answers.some(option => /[.!?]\s*$/u.test(option)),
      false
    );
  }
});

test("family lesson stores blanks and build sentences in renderer-compatible form", () => {
  const lesson = getSecondFamilyLesson();
  const fillBlank = lesson.questions.find(question => question.order === 9);
  const listeningAndType = lesson.questions.find(question => question.order === 10);
  const finalBuildSentence = lesson.questions.find(question => question.order === 13);

  assert.equal(fillBlank.sentence, "Им зи хзан ____.");
  assert.equal(fillBlank.correct, "я");
  assert.equal(listeningAndType.sentence, "Им зи ___ я.");
  assert.equal(listeningAndType.correct, "диде");
  assert.equal(listeningAndType.answers, undefined);
  assert.equal(finalBuildSentence.targetSentence, "Вун гьикI ава стха");
  assert.deepEqual(finalBuildSentence.words, ["гьикI", "стха", "Вун", "ава", "зи"]);
});

test("family lesson 3 keeps its ordered question contract", () => {
  const lesson = getThirdFamilyLesson();

  assert.equal(lesson.title, "Кто это?");
  assert.equal(lesson.questions.length, 14);
  assert.deepEqual(
    lesson.questions.map(question => question.order),
    Array.from({ length: 14 }, (_, index) => index + 1)
  );
  assert.deepEqual(
    lesson.questions.map(question => question.type),
    [
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
      "listening",
      "multipleChoice",
      "fillBlank",
      "match",
      "listeningAndType",
      "buildSentence",
      "multipleChoice",
      "buildSentence",
    ]
  );
});

test("family lesson 3 keeps choice, blank, matching, and new-word contracts", () => {
  const lesson = getThirdFamilyLesson();
  const choiceQuestions = lesson.questions.filter(question =>
    ["multipleChoice", "listening"].includes(question.type)
  );

  for (const question of choiceQuestions) {
    assert.ok(question.answers.includes(question.correct));
    assert.equal(
      question.answers.some(option => /[.!?]\s*$/u.test(option)),
      false
    );
  }

  const fillBlank = lesson.questions.find(question => question.order === 9);
  const matching = lesson.questions.find(question => question.order === 10);
  const markedWords = lesson.questions
    .filter(question => question.newWord)
    .map(question => [question.order, question.newWord]);

  assert.equal(fillBlank.sentence, "Им ____ стха я.");
  assert.deepEqual(fillBlank.answers, ["ви", "вуж", "я", "им"]);
  assert.equal(fillBlank.correct, "ви");
  assert.equal(matching.pairs.length, 4);
  assert.deepEqual(markedWords, [
    [1, { text: "ви", translation: "твой / твоя / твоё" }],
    [4, { text: "вуж", translation: "кто" }],
  ]);
});

test("family lesson 3 stores audio blanks and bidirectional builds safely", () => {
  const lesson = getThirdFamilyLesson();
  const listening = lesson.questions.find(question => question.order === 7);
  const listeningAndType = lesson.questions.find(question => question.order === 11);
  const russianBuild = lesson.questions.find(question => question.order === 12);
  const greetingBuild = lesson.questions.find(question => question.order === 14);

  assert.equal(listening.audioUrl, undefined);
  assert.equal(listeningAndType.audioUrl, undefined);
  assert.equal(listeningAndType.sentence, "Им ___ буба я.");
  assert.equal(listeningAndType.correct, "ви");
  assert.equal(listeningAndType.answers, undefined);
  assert.equal(russianBuild.targetSentence, "Это твоя сестра");
  assert.deepEqual(russianBuild.words, ["Это", "твоя", "сестра", "моя"]);
  assert.equal(greetingBuild.targetSentence, "Салам алейкум Вун гьикI ава");
  assert.deepEqual(greetingBuild.words, ["Салам алейкум", "Вун", "гьикI", "ава"]);
});

test("family lesson 4 keeps its ordered question contract", () => {
  const lesson = getFourthFamilyLesson();

  assert.equal(lesson.title, "У меня есть брат");
  assert.equal(lesson.questions.length, 15);
  assert.deepEqual(
    lesson.questions.map(question => question.order),
    Array.from({ length: 15 }, (_, index) => index + 1)
  );
  assert.deepEqual(
    lesson.questions.map(question => question.type),
    [
      "multipleChoice",
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
      "listening",
      "multipleChoice",
      "multipleChoice",
      "match",
      "multipleChoice",
      "fillBlank",
      "multipleChoice",
      "listeningAndType",
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
    ]
  );
});

test("family lesson 4 keeps choice, blank, matching, and new-word contracts", () => {
  const lesson = getFourthFamilyLesson();
  const choiceQuestions = lesson.questions.filter(question =>
    ["multipleChoice", "listening"].includes(question.type)
  );

  for (const question of choiceQuestions) {
    assert.ok(question.answers.includes(question.correct));
    assert.equal(
      question.answers.some(option => /[.!?]\s*$/u.test(option)),
      false
    );
  }

  const fillBlank = lesson.questions.find(question => question.order === 10);
  const matching = lesson.questions.find(question => question.order === 8);
  const markedWords = lesson.questions.flatMap(question => {
    const words = question.newWords || (question.newWord ? [question.newWord] : []);
    return words.map(word => [question.order, word]);
  });
  const questionsContainingFriend = lesson.questions
    .filter(question => JSON.stringify(question).includes("дуст"))
    .map(question => question.order);

  assert.equal(fillBlank.sentence, "Ваз ____ авани?");
  assert.deepEqual(fillBlank.answers, ["стха", "вуж", "зи", "я"]);
  assert.equal(fillBlank.correct, "стха");
  assert.equal(matching.pairs.length, 4);
  assert.deepEqual(markedWords, [
    [1, { text: "заз", translation: "у меня / мне" }],
    [1, { text: "ава", translation: "есть, имеется" }],
    [4, { text: "ваз", translation: "у тебя / тебе" }],
    [6, { text: "авани?", translation: "есть ли?" }],
    [13, { text: "дуст", translation: "друг" }],
  ]);
  assert.deepEqual(questionsContainingFriend, [13]);
});

test("family lesson 4 stores audio blanks and Russian build safely", () => {
  const lesson = getFourthFamilyLesson();
  const listening = lesson.questions.find(question => question.order === 5);
  const listeningAndType = lesson.questions.find(question => question.order === 12);
  const russianBuild = lesson.questions.find(question => question.order === 14);

  assert.equal(listening.audioUrl, undefined);
  assert.equal(listeningAndType.audioUrl, undefined);
  assert.equal(listeningAndType.sentence, "Зи ___ тIвар Аслан я.");
  assert.equal(listeningAndType.correct, "стхадин");
  assert.equal(listeningAndType.answers, undefined);
  assert.equal(russianBuild.targetSentence, "Как зовут твою маму");
  assert.deepEqual(russianBuild.words, ["Как", "зовут", "твою", "маму", "сестру"]);
});

test("family lesson 5 keeps its ordered question contract", () => {
  const lesson = getFifthFamilyLesson();

  assert.equal(lesson.title, "Сколько у тебя братьев?");
  assert.equal(lesson.order, 5);
  assert.equal(lesson.questions.length, 15);
  assert.deepEqual(
    lesson.questions.map(question => question.order),
    Array.from({ length: 15 }, (_, index) => index + 1)
  );
  assert.deepEqual(
    lesson.questions.map(question => question.type),
    [
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
      "multipleChoice",
      "match",
      "listening",
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
      "fillBlank",
      "listeningAndType",
      "multipleChoice",
      "buildSentence",
      "multipleChoice",
      "multipleChoice",
    ]
  );
});

test("family lesson 5 keeps choice, blank, matching, and vocabulary contracts", () => {
  const lesson = getFifthFamilyLesson();
  const choiceQuestions = lesson.questions.filter(question =>
    ["multipleChoice", "listening"].includes(question.type)
  );

  for (const question of choiceQuestions) {
    assert.ok(question.answers.includes(question.correct));
    assert.equal(
      question.answers.some(option => /[.!?]\s*$/u.test(option)),
      false
    );
  }

  const matching = lesson.questions.find(question => question.order === 5);
  const fillBlank = lesson.questions.find(question => question.order === 10);
  const markedWords = lesson.questions.flatMap(question => {
    const words = question.newWords || (question.newWord ? [question.newWord] : []);
    return words.map(word => [question.order, word]);
  });
  const questionsContainingYear = lesson.questions
    .filter(question => {
      const values = [
        question.question,
        question.sentence,
        ...(question.answers || []),
        ...(question.words || []),
        question.newWord?.text,
        ...(question.newWords || []).map(word => word.text),
      ].filter(Boolean);
      return values.some(value => String(value).split(/\s+/u).includes("йис"));
    })
    .map(question => question.order);

  assert.deepEqual(matching.pairs, [
    { word: "стха", translation: "брат" },
    { word: "стхаяр", translation: "братья" },
    { word: "вах", translation: "сестра" },
    { word: "вахар", translation: "сёстры" },
  ]);
  assert.equal(fillBlank.sentence, "Ваз шумуд ____ ава?");
  assert.deepEqual(fillBlank.answers, ["стха", "вуж", "зи", "я"]);
  assert.equal(fillBlank.correct, "стха");
  assert.deepEqual(markedWords, [
    [1, { text: "шумуд", translation: "сколько" }],
    [2, { text: "са", translation: "один / одна" }],
    [3, { text: "йис", translation: "год / лет" }],
    [4, { text: "кьве", translation: "два / две" }],
    [5, { text: "стхаяр", translation: "братья" }],
    [5, { text: "вахар", translation: "сёстры" }],
    [7, { text: "пуд", translation: "три" }],
    [14, { text: "ва", translation: "и" }],
  ]);
  assert.deepEqual(questionsContainingYear, [3]);
});

test("family lesson 5 stores audio blanks and bidirectional builds safely", () => {
  const lesson = getFifthFamilyLesson();
  const listening = lesson.questions.find(question => question.order === 6);
  const listeningAndType = lesson.questions.find(question => question.order === 11);
  const russianBuild = lesson.questions.find(question => question.order === 8);
  const lezgianBuild = lesson.questions.find(question => question.order === 13);

  assert.equal(listening.audioUrl, undefined);
  assert.equal(listeningAndType.audioUrl, undefined);
  assert.equal(listeningAndType.sentence, "Заз ___ вах ава.");
  assert.equal(listeningAndType.correct, "кьве");
  assert.equal(listeningAndType.answers, undefined);
  assert.equal(russianBuild.targetSentence, "У меня одна сестра");
  assert.deepEqual(russianBuild.words, ["У", "меня", "одна", "сестра", "брат"]);
  assert.equal(lezgianBuild.targetSentence, "Заз пуд стха ава");
  assert.deepEqual(lezgianBuild.words, ["Заз", "пуд", "стха", "ава", "кьве"]);
});
