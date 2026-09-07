import "dotenv/config";

import crypto from "node:crypto";
import prisma from "../src/lib/prisma.js";
import { courseSeed } from "../prisma/data/course.seed.js";

const COURSE_SLUG = "lezgian";
const CHAPTER_ORDER = 2;
const CHAPTER_TITLE = "Рассказывайте о семье";
const importLesson3 = process.argv.includes("--lesson3");
const importLesson4 = process.argv.includes("--lesson4");
const importLesson5 = process.argv.includes("--lesson5");
const lessonConfig = importLesson5
  ? { order: 5, title: "Сколько у тебя братьев?", questionCount: 15 }
  : importLesson4
    ? { order: 4, title: "У меня есть брат", questionCount: 15 }
    : importLesson3
      ? { order: 3, title: "Кто это?", questionCount: 14 }
      : { order: 2, title: "Моя семья", questionCount: 13 };
const LESSON_ORDER = lessonConfig.order;
const LESSON_TITLE = lessonConfig.title;
const EXPECTED_QUESTION_COUNT = lessonConfig.questionCount;
const applyChanges = process.argv.includes("--apply");

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  );
}

function getImportSource() {
  const chapter = courseSeed.chapters.find(item =>
    item.order === CHAPTER_ORDER && item.title === "Глава 2"
  );
  const lesson = chapter?.lessons.find(item =>
    item.order === LESSON_ORDER && item.title === LESSON_TITLE
  );

  if (!chapter || !lesson) {
    throw new Error(
      `Chapter 2 lesson ${LESSON_ORDER} source was not found in course.seed.js`
    );
  }

  const orders = lesson.questions.map(question => question.order);
  const expectedOrders = Array.from(
    { length: EXPECTED_QUESTION_COUNT },
    (_, index) => index + 1
  );

  if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
    throw new Error(
      `Lesson source must contain question orders 1 through ${EXPECTED_QUESTION_COUNT}`
    );
  }

  return { chapter, lesson };
}

function getSafeDatabaseTarget() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const url = new URL(process.env.DATABASE_URL);

  return {
    protocol: url.protocol.replace(":", ""),
    host: url.hostname,
    port: url.port || "5432",
    database: url.pathname.replace(/^\//, ""),
    sslmode: url.searchParams.get("sslmode"),
  };
}

function toQuestionData(question, lessonId) {
  const metadata = compactObject({
    question: question.question,
    image: question.image,
    sentence: question.sentence,
    translations: question.translations,
    targetSentence: question.targetSentence,
    newWord: question.newWord,
    characterImageAlt: question.characterImage?.alt,
  });

  return {
    lessonId,
    type: question.type,
    order: question.order,
    prompt: question.prompt || null,
    translation: question.translation || null,
    correctAnswer: question.correct || null,
    audioUrl: question.audioUrl || null,
    characterImage: question.characterImage?.src || null,
    explanation: question.explanation || null,
    options: question.answers || null,
    pairs: question.pairs || null,
    words: question.words || null,
    newWords: question.newWords || (question.newWord ? [question.newWord] : null),
    metadata,
  };
}

function normalizeComparableValue(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, normalizeComparableValue(value[key])])
    );
  }

  return value ?? null;
}

function valuesEqual(left, right) {
  return JSON.stringify(normalizeComparableValue(left)) ===
    JSON.stringify(normalizeComparableValue(right));
}

function questionNeedsUpdate(current, target) {
  const fields = [
    "type",
    "order",
    "prompt",
    "translation",
    "correctAnswer",
    "audioUrl",
    "characterImage",
    "explanation",
    "options",
    "pairs",
    "words",
    "newWords",
    "metadata",
  ];

  return fields.some(field => !valuesEqual(current[field], target[field]));
}

function hashSnapshot(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

const protectedChapterSelect = {
  id: true,
  courseId: true,
  title: true,
  description: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  lessons: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      legacyId: true,
      chapterId: true,
      title: true,
      description: true,
      order: true,
      xpReward: true,
      isPublished: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          lessonId: true,
          type: true,
          order: true,
          prompt: true,
          translation: true,
          correctAnswer: true,
          audioUrl: true,
          characterImage: true,
          explanation: true,
          options: true,
          pairs: true,
          words: true,
          newWords: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
};

async function getProtectedSnapshots(client, courseId, chapterId) {
  const firstChapter = await client.chapter.findUnique({
    where: {
      courseId_order: { courseId, order: 1 },
    },
    select: protectedChapterSelect,
  });
  const firstFamilyLesson = await client.lesson.findUnique({
    where: {
      chapterId_order: { chapterId, order: 1 },
    },
    select: protectedChapterSelect.lessons.select,
  });
  const secondFamilyLesson = LESSON_ORDER > 2
    ? await client.lesson.findUnique({
        where: {
          chapterId_order: { chapterId, order: 2 },
        },
        select: protectedChapterSelect.lessons.select,
      })
    : null;
  const thirdFamilyLesson = LESSON_ORDER > 3
    ? await client.lesson.findUnique({
        where: {
          chapterId_order: { chapterId, order: 3 },
        },
        select: protectedChapterSelect.lessons.select,
      })
    : null;
  const fourthFamilyLesson = LESSON_ORDER > 4
    ? await client.lesson.findUnique({
        where: {
          chapterId_order: { chapterId, order: 4 },
        },
        select: protectedChapterSelect.lessons.select,
      })
    : null;

  return {
    firstChapter: {
      id: firstChapter?.id || null,
      fingerprint: hashSnapshot(firstChapter),
      lessonCount: firstChapter?.lessons.length || 0,
      questionCount: firstChapter?.lessons.reduce(
        (total, lesson) => total + lesson.questions.length,
        0
      ) || 0,
    },
    firstFamilyLesson: {
      id: firstFamilyLesson?.id || null,
      title: firstFamilyLesson?.title || null,
      fingerprint: hashSnapshot(firstFamilyLesson),
      questionCount: firstFamilyLesson?.questions.length || 0,
    },
    secondFamilyLesson: secondFamilyLesson
      ? {
          id: secondFamilyLesson.id,
          title: secondFamilyLesson.title,
          fingerprint: hashSnapshot(secondFamilyLesson),
          questionCount: secondFamilyLesson.questions.length,
        }
      : null,
    thirdFamilyLesson: thirdFamilyLesson
      ? {
          id: thirdFamilyLesson.id,
          title: thirdFamilyLesson.title,
          fingerprint: hashSnapshot(thirdFamilyLesson),
          questionCount: thirdFamilyLesson.questions.length,
        }
      : null,
    fourthFamilyLesson: fourthFamilyLesson
      ? {
          id: fourthFamilyLesson.id,
          title: fourthFamilyLesson.title,
          fingerprint: hashSnapshot(fourthFamilyLesson),
          questionCount: fourthFamilyLesson.questions.length,
        }
      : null,
  };
}

function validateSource(source) {
  const conflicts = [];
  const warnings = [];
  const choiceTypes = new Set(["multipleChoice", "listening"]);

  for (const question of source.lesson.questions) {
    if (choiceTypes.has(question.type)) {
      const invalidOption = (question.answers || []).find(option =>
        /[.!?]\s*$/u.test(option)
      );

      if (invalidOption) {
        conflicts.push(
          `Question ${question.order} has trailing option punctuation: ${invalidOption}`
        );
      }
      if (!(question.answers || []).includes(question.correct)) {
        conflicts.push(
          `Question ${question.order} correct answer is absent from options`
        );
      }
    }

    if (question.type === "listeningAndType") {
      if (!/^.*_{3,}.*$/u.test(question.sentence || "")) {
        conflicts.push(
          `Question ${question.order} must contain one listeningAndType placeholder`
        );
      }
      if (Array.isArray(question.answers) && question.answers.length > 0) {
        conflicts.push(`Question ${question.order} must not contain answer options`);
      }
    }

    if (["listening", "listeningAndType"].includes(question.type) && !question.audioUrl) {
      warnings.push(`Question ${question.order} still needs an audio file`);
    }
  }

  return { conflicts, warnings };
}

async function inspectImport(client) {
  const source = getImportSource();
  const sourceValidation = validateSource(source);
  const conflicts = [...sourceValidation.conflicts];
  const course = await client.course.findUnique({
    where: { slug: COURSE_SLUG },
    select: { id: true, slug: true, title: true, isPublished: true },
  });

  if (!course) {
    throw new Error(`Course with slug ${COURSE_SLUG} was not found`);
  }

  const chapters = await client.chapter.findMany({
    where: {
      courseId: course.id,
      OR: [{ order: CHAPTER_ORDER }, { title: CHAPTER_TITLE }],
    },
    orderBy: { order: "asc" },
  });
  const chapterByOrder = chapters.find(chapter => chapter.order === CHAPTER_ORDER);
  const chapterByTitle = chapters.find(chapter => chapter.title === CHAPTER_TITLE);

  if (chapterByOrder && chapterByTitle && chapterByOrder.id !== chapterByTitle.id) {
    conflicts.push("Chapter order 2 and family chapter title refer to different records");
  }
  if (chapterByOrder && chapterByOrder.title !== CHAPTER_TITLE) {
    conflicts.push(`Chapter order 2 is occupied by ${chapterByOrder.title}`);
  }
  if (chapterByTitle && chapterByTitle.order !== CHAPTER_ORDER) {
    conflicts.push(`Family chapter exists at unexpected order ${chapterByTitle.order}`);
  }

  const chapter = chapterByOrder || chapterByTitle || null;

  if (!chapter) {
    conflicts.push("Existing chapter 2 was not found; this importer will not create it");
  }

  const chapterLessons = chapter
    ? await client.lesson.findMany({
        where: { chapterId: chapter.id },
        orderBy: { order: "asc" },
        include: { _count: { select: { questions: true } } },
      })
    : [];
  const lessonByOrder = chapterLessons.find(lesson => lesson.order === LESSON_ORDER);
  const lessonByTitle = chapterLessons.find(lesson => lesson.title === LESSON_TITLE);
  const lessonByLegacyId = source.lesson.legacyId
    ? await client.lesson.findUnique({ where: { legacyId: source.lesson.legacyId } })
    : null;

  if (lessonByOrder && lessonByOrder.title !== LESSON_TITLE) {
    conflicts.push(
      `Lesson order ${LESSON_ORDER} is occupied by ${lessonByOrder.title} (${lessonByOrder.id})`
    );
  }
  if (lessonByTitle && lessonByTitle.order !== LESSON_ORDER) {
    conflicts.push(`Lesson ${LESSON_TITLE} exists at unexpected order ${lessonByTitle.order}`);
  }
  if (lessonByOrder && lessonByTitle && lessonByOrder.id !== lessonByTitle.id) {
    conflicts.push(
      `Lesson order ${LESSON_ORDER} and lesson title refer to different records`
    );
  }

  const lesson = lessonByTitle || (
    lessonByOrder?.title === LESSON_TITLE ? lessonByOrder : null
  ) || (
    chapter &&
    lessonByLegacyId?.chapterId === chapter.id &&
    lessonByLegacyId.title === LESSON_TITLE
      ? lessonByLegacyId
      : null
  );

  if (lessonByLegacyId && (!lesson || lessonByLegacyId.id !== lesson.id)) {
    conflicts.push(
      `legacyId ${source.lesson.legacyId} belongs to ${lessonByLegacyId.title} (${lessonByLegacyId.id})`
    );
  }

  const existingQuestions = lesson
    ? await client.question.findMany({
        where: { lessonId: lesson.id },
        orderBy: { order: "asc" },
      })
    : [];
  const sourceOrders = new Set(
    source.lesson.questions.map(question => question.order)
  );
  const extraQuestions = existingQuestions.filter(
    question => !sourceOrders.has(question.order)
  );

  if (extraQuestions.length > 0) {
    conflicts.push(
      `Target lesson has questions outside source orders: ${extraQuestions
        .map(question => question.order)
        .join(", ")}`
    );
  }

  const questionsToCreate = [];
  const questionsToUpdate = [];
  const questionsToReuse = [];

  for (const sourceQuestion of source.lesson.questions) {
    const existing = existingQuestions.find(
      question => question.order === sourceQuestion.order
    );

    if (!existing) {
      questionsToCreate.push(sourceQuestion.order);
    } else if (questionNeedsUpdate(
      existing,
      toQuestionData(sourceQuestion, lesson.id)
    )) {
      questionsToUpdate.push(sourceQuestion.order);
    } else {
      questionsToReuse.push(sourceQuestion.order);
    }
  }

  const lessonData = chapter
    ? {
        legacyId: source.lesson.legacyId || null,
        chapterId: chapter.id,
        title: source.lesson.title,
        description: source.lesson.description,
        order: source.lesson.order,
        xpReward: source.lesson.xpReward,
        isPublished: source.lesson.isPublished,
        imageUrl: source.lesson.imageUrl || null,
      }
    : null;
  const lessonNeedsUpdate = Boolean(
    lesson && Object.entries(lessonData).some(
      ([field, value]) => !valuesEqual(lesson[field], value)
    )
  );
  const protectedSnapshots = chapter
    ? await getProtectedSnapshots(client, course.id, chapter.id)
    : null;

  if (
    protectedSnapshots &&
    protectedSnapshots.firstFamilyLesson.title !== "Это мой брат"
  ) {
    conflicts.push("Chapter 2 lesson order 1 is not the protected first lesson");
  }
  if (
    LESSON_ORDER > 2 &&
    protectedSnapshots?.secondFamilyLesson?.title !== "Моя семья"
  ) {
    conflicts.push("Chapter 2 lesson order 2 is not the protected second lesson");
  }
  if (
    LESSON_ORDER > 3 &&
    protectedSnapshots?.thirdFamilyLesson?.title !== "Кто это?"
  ) {
    conflicts.push("Chapter 2 lesson order 3 is not the protected third lesson");
  }
  if (
    LESSON_ORDER > 4 &&
    protectedSnapshots?.fourthFamilyLesson?.title !== "У меня есть брат"
  ) {
    conflicts.push("Chapter 2 lesson order 4 is not the protected fourth lesson");
  }

  return {
    source,
    course,
    chapter,
    chapterLessons,
    lesson,
    conflicts,
    warnings: sourceValidation.warnings,
    protectedSnapshots,
    plan: {
      lesson: lesson ? lessonNeedsUpdate ? "update" : "reuse" : "create",
      questionsToCreate,
      questionsToUpdate,
      questionsToReuse,
      existingQuestionCount: existingQuestions.length,
    },
  };
}

function publicInspection(inspection) {
  return {
    database: getSafeDatabaseTarget(),
    course: inspection.course,
    chapter: inspection.chapter
      ? {
          id: inspection.chapter.id,
          title: inspection.chapter.title,
          order: inspection.chapter.order,
        }
      : null,
    existingLessons: inspection.chapterLessons.map(lesson => ({
      id: lesson.id,
      legacyId: lesson.legacyId,
      title: lesson.title,
      order: lesson.order,
      isPublished: lesson.isPublished,
      questionCount: lesson._count.questions,
    })),
    targetLesson: {
      exists: Boolean(inspection.lesson),
      id: inspection.lesson?.id || null,
      title: LESSON_TITLE,
      order: LESSON_ORDER,
      action: inspection.plan.lesson,
    },
    questions: {
      source: inspection.source.lesson.questions.length,
      existing: inspection.plan.existingQuestionCount,
      createOrders: inspection.plan.questionsToCreate,
      updateOrders: inspection.plan.questionsToUpdate,
      reuseOrders: inspection.plan.questionsToReuse,
      types: inspection.source.lesson.questions.map(question => question.type),
    },
    protected: inspection.protectedSnapshots,
    warnings: inspection.warnings,
    conflicts: inspection.conflicts,
    safeToApply: inspection.conflicts.length === 0,
  };
}

async function applyImport() {
  return prisma.$transaction(async tx => {
    const inspection = await inspectImport(tx);

    if (inspection.conflicts.length > 0) {
      throw new Error(`Import conflicts: ${inspection.conflicts.join("; ")}`);
    }

    const protectedBefore = inspection.protectedSnapshots;
    const lessonData = {
      legacyId: inspection.source.lesson.legacyId || null,
      chapterId: inspection.chapter.id,
      title: inspection.source.lesson.title,
      description: inspection.source.lesson.description,
      order: inspection.source.lesson.order,
      xpReward: inspection.source.lesson.xpReward,
      isPublished: inspection.source.lesson.isPublished,
      imageUrl: inspection.source.lesson.imageUrl || null,
    };
    let lesson = inspection.lesson;
    let lessonCreated = false;
    let lessonUpdated = false;

    if (!lesson) {
      lesson = await tx.lesson.create({ data: lessonData });
      lessonCreated = true;
    } else if (inspection.plan.lesson === "update") {
      lesson = await tx.lesson.update({
        where: { id: lesson.id },
        data: lessonData,
      });
      lessonUpdated = true;
    }

    let questionsCreated = 0;
    let questionsUpdated = 0;
    let questionsReused = 0;

    for (const sourceQuestion of inspection.source.lesson.questions) {
      const current = await tx.question.findUnique({
        where: {
          lessonId_order: {
            lessonId: lesson.id,
            order: sourceQuestion.order,
          },
        },
      });
      const target = toQuestionData(sourceQuestion, lesson.id);

      if (!current) {
        await tx.question.create({ data: target });
        questionsCreated += 1;
      } else if (questionNeedsUpdate(current, target)) {
        await tx.question.update({
          where: { id: current.id },
          data: target,
        });
        questionsUpdated += 1;
      } else {
        questionsReused += 1;
      }
    }

    const finalQuestions = await tx.question.findMany({
      where: { lessonId: lesson.id },
      orderBy: { order: "asc" },
      select: { id: true, order: true, type: true },
    });

    if (
      finalQuestions.length !== EXPECTED_QUESTION_COUNT ||
      finalQuestions.some((question, index) => question.order !== index + 1)
    ) {
      throw new Error(
        `Imported lesson does not contain exactly orders 1 through ${EXPECTED_QUESTION_COUNT}`
      );
    }

    const protectedAfter = await getProtectedSnapshots(
      tx,
      inspection.course.id,
      inspection.chapter.id
    );

    if (
      protectedBefore.firstChapter.fingerprint !==
        protectedAfter.firstChapter.fingerprint ||
      protectedBefore.firstFamilyLesson.fingerprint !==
        protectedAfter.firstFamilyLesson.fingerprint ||
      protectedBefore.secondFamilyLesson?.fingerprint !==
        protectedAfter.secondFamilyLesson?.fingerprint ||
      protectedBefore.thirdFamilyLesson?.fingerprint !==
        protectedAfter.thirdFamilyLesson?.fingerprint ||
      protectedBefore.fourthFamilyLesson?.fingerprint !==
        protectedAfter.fourthFamilyLesson?.fingerprint
    ) {
      throw new Error("Protected course content changed; transaction aborted");
    }

    return {
      courseId: inspection.course.id,
      chapterId: inspection.chapter.id,
      lessonId: lesson.id,
      lessonOrder: lesson.order,
      lessonCreated,
      lessonUpdated,
      questionsCreated,
      questionsUpdated,
      questionsReused,
      questionCount: finalQuestions.length,
      questionTypes: finalQuestions.map(question => question.type),
      protectedBefore,
      protectedAfter,
    };
  }, {
    maxWait: 10_000,
    timeout: 30_000,
  });
}

try {
  const inspection = await inspectImport(prisma);

  console.log(JSON.stringify({
    mode: applyChanges ? "apply-preflight" : "dry-run",
    ...publicInspection(inspection),
  }, null, 2));

  if (inspection.conflicts.length > 0) {
    process.exitCode = 2;
  } else if (applyChanges) {
    const result = await applyImport();

    console.log(JSON.stringify({
      mode: "apply-result",
      ...result,
    }, null, 2));
  }
} catch (error) {
  console.error(JSON.stringify({
    error: error.name,
    code: error.code || null,
    target: error.meta?.target || null,
    message: error.message,
  }, null, 2));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
