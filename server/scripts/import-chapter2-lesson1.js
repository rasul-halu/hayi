import "dotenv/config";

import crypto from "node:crypto";
import prisma from "../src/lib/prisma.js";
import { courseSeed } from "../prisma/data/course.seed.js";

const COURSE_SLUG = "lezgian";
const CHAPTER_ORDER = 2;
const LESSON_TITLE = "Это мой брат";
const TARGET_CHAPTER_TITLE = "Рассказывайте о семье";
const applyChanges = process.argv.includes("--apply");

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  );
}

function getImportSource() {
  const chapter = courseSeed.chapters.find(item =>
    item.order === CHAPTER_ORDER &&
    item.lessons?.some(lesson => lesson.title === LESSON_TITLE)
  );
  const lesson = chapter?.lessons.find(item => item.title === LESSON_TITLE);

  if (!chapter || !lesson) {
    throw new Error("Chapter 2 lesson source was not found in course.seed.js");
  }

  if (lesson.questions.length !== 11) {
    throw new Error(
      `Expected 11 source questions, received ${lesson.questions.length}`
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

async function getFirstChapterSnapshot(client, courseId) {
  const chapter = await client.chapter.findUnique({
    where: {
      courseId_order: {
        courseId,
        order: 1,
      },
    },
    select: {
      id: true,
      courseId: true,
      title: true,
      description: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      lessons: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          legacyId: true,
          title: true,
          description: true,
          order: true,
          xpReward: true,
          isPublished: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
          questions: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
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
    },
  });
  const serialized = JSON.stringify(chapter);

  return {
    id: chapter?.id || null,
    lessonCount: chapter?.lessons.length || 0,
    questionCount: chapter?.lessons.reduce(
      (total, lesson) => total + lesson.questions.length,
      0
    ) || 0,
    fingerprint: crypto.createHash("sha256").update(serialized).digest("hex"),
  };
}

function matchesChapterIdentity(chapter, sourceChapter) {
  return chapter.title === TARGET_CHAPTER_TITLE || (
    chapter.title === sourceChapter.title &&
    chapter.description === sourceChapter.description
  );
}

async function inspectImport(client) {
  const source = getImportSource();
  const conflicts = [];
  const course = await client.course.findUnique({
    where: {
      slug: COURSE_SLUG,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
    },
  });

  if (!course) {
    throw new Error(`Course with slug ${COURSE_SLUG} was not found`);
  }

  const chapterCandidates = await client.chapter.findMany({
    where: {
      courseId: course.id,
      OR: [
        { order: CHAPTER_ORDER },
        { title: TARGET_CHAPTER_TITLE },
        {
          title: source.chapter.title,
          description: source.chapter.description,
        },
      ],
    },
    orderBy: {
      order: "asc",
    },
  });
  const chapterByOrder = chapterCandidates.find(
    chapter => chapter.order === CHAPTER_ORDER
  );
  const chapterByIdentity = chapterCandidates.find(
    chapter => matchesChapterIdentity(chapter, source.chapter)
  );

  if (
    chapterByOrder &&
    chapterByIdentity &&
    chapterByOrder.id !== chapterByIdentity.id
  ) {
    conflicts.push(
      "Chapter order 2 and the family chapter title refer to different records"
    );
  }
  if (chapterByOrder && !matchesChapterIdentity(chapterByOrder, source.chapter)) {
    conflicts.push(
      `Chapter order 2 is occupied by unrelated chapter ${chapterByOrder.id}`
    );
  }
  if (chapterByIdentity && chapterByIdentity.order !== CHAPTER_ORDER) {
    conflicts.push(
      `Family chapter exists at unexpected order ${chapterByIdentity.order}`
    );
  }

  const chapter = chapterByOrder || chapterByIdentity || null;
  const chapterLessons = chapter
    ? await client.lesson.findMany({
        where: {
          chapterId: chapter.id,
          OR: [
            { order: source.lesson.order },
            { title: source.lesson.title },
          ],
        },
        orderBy: {
          order: "asc",
        },
      })
    : [];
  const lessonByOrder = chapterLessons.find(
    lesson => lesson.order === source.lesson.order
  );
  const lessonByTitle = chapterLessons.find(
    lesson => lesson.title === source.lesson.title
  );
  const lessonByLegacyId = source.lesson.legacyId
    ? await client.lesson.findUnique({
        where: {
          legacyId: source.lesson.legacyId,
        },
      })
    : null;

  if (
    lessonByOrder &&
    lessonByTitle &&
    lessonByOrder.id !== lessonByTitle.id
  ) {
    conflicts.push(
      "Lesson order 1 and lesson title refer to different records in chapter 2"
    );
  }
  if (lessonByOrder && lessonByOrder.title !== source.lesson.title) {
    conflicts.push(
      `Lesson order 1 is occupied by unrelated lesson ${lessonByOrder.id}`
    );
  }
  if (lessonByTitle && lessonByTitle.order !== source.lesson.order) {
    conflicts.push(
      `Lesson ${source.lesson.title} exists at unexpected order ${lessonByTitle.order}`
    );
  }

  const lesson = lessonByOrder || lessonByTitle || (
    chapter && lessonByLegacyId?.chapterId === chapter.id
      ? lessonByLegacyId
      : null
  );

  if (
    lessonByLegacyId &&
    (!lesson || lessonByLegacyId.id !== lesson.id)
  ) {
    conflicts.push(
      `legacyId ${source.lesson.legacyId} belongs to another lesson ${lessonByLegacyId.id}`
    );
  }

  const existingQuestions = lesson
    ? await client.question.findMany({
        where: {
          lessonId: lesson.id,
        },
        orderBy: {
          order: "asc",
        },
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
      `Target lesson contains questions outside source orders: ${extraQuestions
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
      continue;
    }

    const target = toQuestionData(sourceQuestion, lesson.id);

    if (questionNeedsUpdate(existing, target)) {
      questionsToUpdate.push(sourceQuestion.order);
    } else {
      questionsToReuse.push(sourceQuestion.order);
    }
  }

  const chapterNeedsUpdate = Boolean(
    chapter && chapter.title !== TARGET_CHAPTER_TITLE
  );
  const lessonTarget = lesson
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
    lesson && Object.entries(lessonTarget).some(
      ([field, value]) => !valuesEqual(lesson[field], value)
    )
  );

  return {
    source,
    course,
    chapter,
    lesson,
    conflicts,
    firstChapter: await getFirstChapterSnapshot(client, course.id),
    plan: {
      chapter: chapter
        ? chapterNeedsUpdate ? "update" : "reuse"
        : "create",
      chapterOrder: CHAPTER_ORDER,
      lesson: lesson
        ? lessonNeedsUpdate ? "update" : "reuse"
        : "create",
      sourceQuestionCount: source.lesson.questions.length,
      existingQuestionCount: existingQuestions.length,
      questionsToCreate,
      questionsToUpdate,
      questionsToReuse,
    },
  };
}

function publicInspection(inspection) {
  return {
    database: getSafeDatabaseTarget(),
    course: inspection.course,
    chapter: {
      exists: Boolean(inspection.chapter),
      id: inspection.chapter?.id || null,
      currentTitle: inspection.chapter?.title || null,
      targetTitle: TARGET_CHAPTER_TITLE,
      order: CHAPTER_ORDER,
      action: inspection.plan.chapter,
    },
    lesson: {
      exists: Boolean(inspection.lesson),
      id: inspection.lesson?.id || null,
      title: LESSON_TITLE,
      order: inspection.source.lesson.order,
      action: inspection.plan.lesson,
    },
    questions: {
      source: inspection.plan.sourceQuestionCount,
      existing: inspection.plan.existingQuestionCount,
      createOrders: inspection.plan.questionsToCreate,
      updateOrders: inspection.plan.questionsToUpdate,
      reuseOrders: inspection.plan.questionsToReuse,
    },
    firstChapter: inspection.firstChapter,
    conflicts: inspection.conflicts,
    safeToApply: inspection.conflicts.length === 0,
  };
}

async function applyImport() {
  return prisma.$transaction(async tx => {
    const inspection = await inspectImport(tx);

    if (inspection.conflicts.length > 0) {
      throw new Error(
        `Import conflicts: ${inspection.conflicts.join("; ")}`
      );
    }

    const beforeFirstChapter = inspection.firstChapter;
    let chapter = inspection.chapter;
    let chapterCreated = false;
    let chapterUpdated = false;

    if (!chapter) {
      chapter = await tx.chapter.create({
        data: {
          courseId: inspection.course.id,
          title: TARGET_CHAPTER_TITLE,
          description: null,
          order: CHAPTER_ORDER,
        },
      });
      chapterCreated = true;
    } else if (inspection.plan.chapter === "update") {
      chapter = await tx.chapter.update({
        where: {
          id: chapter.id,
        },
        data: {
          title: TARGET_CHAPTER_TITLE,
        },
      });
      chapterUpdated = true;
    }

    let lesson = inspection.lesson;
    let lessonCreated = false;
    let lessonUpdated = false;
    const lessonData = {
      legacyId: inspection.source.lesson.legacyId || null,
      chapterId: chapter.id,
      title: inspection.source.lesson.title,
      description: inspection.source.lesson.description,
      order: inspection.source.lesson.order,
      xpReward: inspection.source.lesson.xpReward,
      isPublished: inspection.source.lesson.isPublished,
      imageUrl: inspection.source.lesson.imageUrl || null,
    };

    if (!lesson) {
      lesson = await tx.lesson.create({
        data: lessonData,
      });
      lessonCreated = true;
    } else if (inspection.plan.lesson === "update") {
      lesson = await tx.lesson.update({
        where: {
          id: lesson.id,
        },
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
        await tx.question.create({
          data: target,
        });
        questionsCreated += 1;
      } else if (questionNeedsUpdate(current, target)) {
        await tx.question.update({
          where: {
            id: current.id,
          },
          data: target,
        });
        questionsUpdated += 1;
      } else {
        questionsReused += 1;
      }
    }

    const finalQuestions = await tx.question.findMany({
      where: {
        lessonId: lesson.id,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        order: true,
        type: true,
      },
    });

    if (
      finalQuestions.length !== 11 ||
      finalQuestions.some((question, index) => question.order !== index + 1)
    ) {
      throw new Error("Imported lesson does not contain exactly orders 1 through 11");
    }

    const afterFirstChapter = await getFirstChapterSnapshot(
      tx,
      inspection.course.id
    );

    if (beforeFirstChapter.fingerprint !== afterFirstChapter.fingerprint) {
      throw new Error("First chapter changed during import; transaction aborted");
    }

    return {
      courseId: inspection.course.id,
      chapterId: chapter.id,
      lessonId: lesson.id,
      chapterCreated,
      chapterUpdated,
      lessonCreated,
      lessonUpdated,
      questionsCreated,
      questionsUpdated,
      questionsReused,
      questionCount: finalQuestions.length,
      firstChapterBefore: beforeFirstChapter,
      firstChapterAfter: afterFirstChapter,
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
