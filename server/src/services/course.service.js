import prisma from "../lib/prisma.js";

function getPublicLessonId(lesson) {
  return lesson.legacyId || lesson.id;
}

function serializeLessonSummary(lesson) {
  return {
    id: getPublicLessonId(lesson),
    databaseId: lesson.id,
    legacyId: lesson.legacyId,
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    xpReward: lesson.xpReward,
    imageUrl: lesson.imageUrl,
  };
}

function serializeQuestion(question) {
  const metadata = question.metadata || {};

  return {
    id: question.id,
    type: question.type,
    order: question.order,
    prompt: question.prompt,
    question: metadata.question || question.translation || "",
    translation: question.translation,
    sentence: metadata.sentence,
    answers: question.options || [],
    options: question.options || [],
    correct: question.correctAnswer,
    correctAnswer: question.correctAnswer,
    pairs: question.pairs || [],
    translations: metadata.translations,
    words: question.words || [],
    targetSentence: metadata.targetSentence,
    newWord: metadata.newWord,
    newWords: question.newWords || [],
    image: metadata.image,
    audioUrl: question.audioUrl,
    characterImage: question.characterImage
      ? {
          src: question.characterImage,
          alt: metadata.characterImageAlt || "",
        }
      : null,
    explanation: question.explanation,
    metadata,
  };
}

function serializeLessonDetail(lesson) {
  return {
    ...serializeLessonSummary(lesson),
    questions: lesson.questions
      .sort((left, right) => left.order - right.order)
      .map(serializeQuestion),
  };
}

function serializeCourse(course) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    language: course.language,
    chapters: course.chapters
      .sort((left, right) => left.order - right.order)
      .map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        order: chapter.order,
        lessons: chapter.lessons
          .sort((left, right) => left.order - right.order)
          .map(serializeLessonSummary),
      })),
  };
}

export async function getPublishedCourses() {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      language: true,
      order: true,
    },
  });

  return courses;
}

export async function getPublishedCourseBySlug(slug) {
  const course = await prisma.course.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      chapters: {
        include: {
          lessons: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
  });

  return course ? serializeCourse(course) : null;
}

export async function getPublishedLessonById(lessonId) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      isPublished: true,
      OR: [
        {
          legacyId: lessonId,
        },
        {
          id: lessonId,
        },
      ],
      chapter: {
        course: {
          isPublished: true,
        },
      },
    },
    include: {
      questions: true,
    },
  });

  return lesson ? serializeLessonDetail(lesson) : null;
}

export async function getPublishedLessonXpReward(lessonId, tx = prisma) {
  // LessonProgress still stores legacy lesson ids. Keep lookup by legacyId first
  // until a safe LessonProgress -> Lesson relation migration is planned.
  const lesson = await tx.lesson.findFirst({
    where: {
      isPublished: true,
      OR: [
        {
          legacyId: lessonId,
        },
        {
          id: lessonId,
        },
      ],
      chapter: {
        course: {
          isPublished: true,
        },
      },
    },
    select: {
      id: true,
      legacyId: true,
      xpReward: true,
    },
  });

  return lesson;
}
