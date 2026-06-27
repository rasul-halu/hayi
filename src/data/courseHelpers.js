import { course } from "./courseData";

function normalizeId(id) {
  const numericId = Number(id);

  return Number.isInteger(numericId) && numericId > 0
    ? numericId
    : undefined;
}

export function getCourseChapters() {
  return course.chapters;
}

export function getAllLessons() {
  return course.chapters.flatMap(
    chapter => chapter.lessons
  );
}

export function getLessonById(lessonId) {
  const numericId = normalizeId(lessonId);

  if (!numericId) {
    return undefined;
  }

  return getAllLessons().find(
    lesson => lesson.id === numericId
  );
}

export function getVocabulary() {
  return course.vocabulary;
}

export function getNextLessonId(lessonId) {
  const numericId = normalizeId(lessonId);

  if (!numericId) {
    return undefined;
  }

  const lessons = getAllLessons();
  const lessonIndex = lessons.findIndex(
    lesson => lesson.id === numericId
  );

  return lessons[lessonIndex + 1]?.id;
}

export function getChapterByLessonId(lessonId) {
  const numericId = normalizeId(lessonId);

  if (!numericId) {
    return undefined;
  }

  return course.chapters.find(
    chapter =>
      chapter.lessons.some(
        lesson => lesson.id === numericId
      )
  );
}
