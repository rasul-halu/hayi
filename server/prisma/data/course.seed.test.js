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
