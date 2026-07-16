import prisma from "../lib/prisma.js";

function serializeQuestion(question) {
  return {
    id: question.id,
    lessonId: question.lessonId,
    type: question.type,
    order: question.order,
    prompt: question.prompt,
    translation: question.translation,
    correctAnswer: question.correctAnswer,
    audioUrl: question.audioUrl,
    characterImage: question.characterImage,
    explanation: question.explanation,
    options: question.options,
    pairs: question.pairs,
    words: question.words,
    newWords: question.newWords,
    metadata: question.metadata,
  };
}

function serializeLessonSummary(lesson) {
  return {
    id: lesson.id,
    legacyId: lesson.legacyId,
    chapterId: lesson.chapterId,
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    xpReward: lesson.xpReward,
    isPublished: lesson.isPublished,
    imageUrl: lesson.imageUrl,
  };
}

function serializeLessonDetail(lesson) {
  return {
    ...serializeLessonSummary(lesson),
    questions: (lesson.questions || [])
      .sort((left, right) => left.order - right.order)
      .map(serializeQuestion),
  };
}

function serializeChapter(chapter) {
  return {
    id: chapter.id,
    courseId: chapter.courseId,
    title: chapter.title,
    description: chapter.description,
    order: chapter.order,
    lessons: (chapter.lessons || [])
      .sort((left, right) => left.order - right.order)
      .map(serializeLessonSummary),
  };
}

function serializeCourse(course) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    language: course.language,
    isPublished: course.isPublished,
    order: course.order,
    chapters: (course.chapters || [])
      .sort((left, right) => left.order - right.order)
      .map(serializeChapter),
  };
}

export async function getAdminCourses() {
  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return courses.map(serializeCourse);
}

export async function getAdminCourseById(courseId) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
    },
  });

  return course ? serializeCourse(course) : null;
}

export async function getAdminChapterById(chapterId) {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
    include: {
      lessons: true,
    },
  });

  return chapter ? serializeChapter(chapter) : null;
}

export async function updateAdminChapter(chapterId, data) {
  const chapter = await prisma.chapter.update({
    where: {
      id: chapterId,
    },
    data,
    include: {
      lessons: true,
    },
  });

  return serializeChapter(chapter);
}

export async function createAdminChapter(courseId, data) {
  const order = data.order ?? await getNextChapterOrder(courseId);

  const chapter = await prisma.chapter.create({
    data: {
      courseId,
      title: data.title,
      description: data.description,
      order,
    },
    include: {
      lessons: true,
    },
  });

  return serializeChapter(chapter);
}

export async function getAdminLessons() {
  const lessons = await prisma.lesson.findMany({
    orderBy: [
      {
        chapter: {
          order: "asc",
        },
      },
      {
        order: "asc",
      },
    ],
  });

  return lessons.map(serializeLessonSummary);
}

export async function getAdminLessonById(lessonId) {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      questions: true,
    },
  });

  return lesson ? serializeLessonDetail(lesson) : null;
}

export async function updateAdminLesson(lessonId, data) {
  const lesson = await prisma.lesson.update({
    where: {
      id: lessonId,
    },
    data,
    include: {
      questions: true,
    },
  });

  return serializeLessonDetail(lesson);
}

export async function createAdminLesson(chapterId, data) {
  const order = data.order ?? await getNextLessonOrder(chapterId);

  const lesson = await prisma.lesson.create({
    data: {
      chapterId,
      legacyId: null,
      title: data.title,
      description: data.description,
      order,
      xpReward: data.xpReward,
      isPublished: data.isPublished,
      imageUrl: data.imageUrl,
    },
    include: {
      questions: true,
    },
  });

  return serializeLessonDetail(lesson);
}

export async function duplicateAdminLesson(lessonId) {
  return prisma.$transaction(async tx => {
    const sourceLesson = await tx.lesson.findUniqueOrThrow({
      where: {
        id: lessonId,
      },
      include: {
        questions: true,
      },
    });

    const order = await getNextLessonOrder(sourceLesson.chapterId, tx);
    const lesson = await tx.lesson.create({
      data: {
        chapterId: sourceLesson.chapterId,
        legacyId: null,
        title: `Копия: ${sourceLesson.title}`,
        description: sourceLesson.description,
        order,
        xpReward: sourceLesson.xpReward,
        isPublished: false,
        imageUrl: sourceLesson.imageUrl,
      },
    });

    if (sourceLesson.questions.length > 0) {
      await tx.question.createMany({
        data: sourceLesson.questions.map(question => ({
          lessonId: lesson.id,
          type: question.type,
          order: question.order,
          prompt: question.prompt,
          translation: question.translation,
          correctAnswer: question.correctAnswer,
          audioUrl: question.audioUrl,
          characterImage: question.characterImage,
          explanation: question.explanation,
          options: question.options,
          pairs: question.pairs,
          words: question.words,
          newWords: question.newWords,
          metadata: question.metadata,
        })),
      });
    }

    const duplicatedLesson = await tx.lesson.findUniqueOrThrow({
      where: {
        id: lesson.id,
      },
      include: {
        questions: true,
      },
    });

    return serializeLessonDetail(duplicatedLesson);
  });
}

export async function getAdminQuestionById(questionId) {
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  return question ? serializeQuestion(question) : null;
}

export async function updateAdminQuestion(questionId, data) {
  const question = await prisma.question.update({
    where: {
      id: questionId,
    },
    data,
  });

  return serializeQuestion(question);
}

export async function createAdminQuestion(lessonId, data) {
  const order = data.order ?? await getNextQuestionOrder(lessonId);

  const question = await prisma.question.create({
    data: {
      lessonId,
      type: data.type,
      order,
      prompt: data.prompt,
      translation: data.translation,
      correctAnswer: data.correctAnswer,
      audioUrl: data.audioUrl,
      characterImage: data.characterImage,
      explanation: data.explanation,
      options: data.options,
      pairs: data.pairs,
      words: data.words,
      newWords: data.newWords,
      metadata: data.metadata,
    },
  });

  return serializeQuestion(question);
}

export async function duplicateAdminQuestion(questionId) {
  const sourceQuestion = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId,
    },
  });
  const order = await getNextQuestionOrder(sourceQuestion.lessonId);

  const question = await prisma.question.create({
    data: {
      lessonId: sourceQuestion.lessonId,
      type: sourceQuestion.type,
      order,
      prompt: sourceQuestion.prompt,
      translation: sourceQuestion.translation,
      correctAnswer: sourceQuestion.correctAnswer,
      audioUrl: sourceQuestion.audioUrl,
      characterImage: sourceQuestion.characterImage,
      explanation: sourceQuestion.explanation,
      options: sourceQuestion.options,
      pairs: sourceQuestion.pairs,
      words: sourceQuestion.words,
      newWords: sourceQuestion.newWords,
      metadata: sourceQuestion.metadata,
    },
  });

  return serializeQuestion(question);
}

async function getNextChapterOrder(courseId, tx = prisma) {
  const result = await tx.chapter.aggregate({
    where: {
      courseId,
    },
    _max: {
      order: true,
    },
  });

  return (result._max.order || 0) + 1;
}

async function getNextLessonOrder(chapterId, tx = prisma) {
  const result = await tx.lesson.aggregate({
    where: {
      chapterId,
    },
    _max: {
      order: true,
    },
  });

  return (result._max.order || 0) + 1;
}

async function getNextQuestionOrder(lessonId, tx = prisma) {
  const result = await tx.question.aggregate({
    where: {
      lessonId,
    },
    _max: {
      order: true,
    },
  });

  return (result._max.order || 0) + 1;
}
