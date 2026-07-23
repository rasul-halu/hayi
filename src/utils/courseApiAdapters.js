import {
  resolveMediaImage,
  resolveMediaUrl,
} from "./mediaUrl";

export function mapApiQuestionToFrontendQuestion(question = {}) {
  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    question: question.question,
    sentence: question.sentence,
    answers: question.answers || question.options || [],
    correct: question.correct || question.correctAnswer,
    pairs: question.pairs || [],
    translations: question.translations,
    words: question.words || [],
    targetSentence: question.targetSentence,
    newWord: question.newWord,
    newWords: question.newWords || [],
    image: resolveMediaImage(question.image),
    audioUrl: resolveMediaUrl(question.audioUrl),
    characterImage: resolveMediaImage(question.characterImage),
    explanation: question.explanation,
    metadata: question.metadata || {},
  };
}

export function mapApiLessonToFrontendLesson(lesson = {}) {
  return {
    id: Number.isNaN(Number(lesson.id))
      ? lesson.id
      : Number(lesson.id),
    databaseId: lesson.databaseId,
    legacyId: lesson.legacyId,
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    xpReward: lesson.xpReward,
    imageUrl: resolveMediaUrl(lesson.imageUrl),
    questions: (lesson.questions || []).map(mapApiQuestionToFrontendQuestion),
  };
}

export function mapApiCourseToFrontendCourse(course = {}) {
  return {
    ...course,
    chapters: (course.chapters || []).map(chapter => ({
      ...chapter,
      lessons: (chapter.lessons || []).map(lesson => ({
        ...lesson,
        imageUrl: resolveMediaUrl(lesson.imageUrl),
        id: Number.isNaN(Number(lesson.id))
          ? lesson.id
          : Number(lesson.id),
      })),
    })),
  };
}
