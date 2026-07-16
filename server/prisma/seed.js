import "dotenv/config";

import prisma from "../src/lib/prisma.js";
import { courseSeed } from "./data/course.seed.js";

function toQuestionData(question, lessonId) {
  const metadata = {
    question: question.question,
    image: question.image,
    sentence: question.sentence,
    translations: question.translations,
    targetSentence: question.targetSentence,
    newWord: question.newWord,
    characterImageAlt: question.characterImage?.alt,
  };

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

async function seedCourse() {
  const course = await prisma.course.upsert({
    where: {
      slug: courseSeed.slug,
    },
    create: {
      slug: courseSeed.slug,
      title: courseSeed.title,
      description: courseSeed.description,
      language: courseSeed.language,
      isPublished: courseSeed.isPublished,
      order: courseSeed.order,
    },
    update: {
      title: courseSeed.title,
      description: courseSeed.description,
      language: courseSeed.language,
      isPublished: courseSeed.isPublished,
      order: courseSeed.order,
    },
  });

  for (const chapterSeed of courseSeed.chapters) {
    const chapter = await prisma.chapter.upsert({
      where: {
        courseId_order: {
          courseId: course.id,
          order: chapterSeed.order,
        },
      },
      create: {
        courseId: course.id,
        title: chapterSeed.title,
        description: chapterSeed.description,
        order: chapterSeed.order,
      },
      update: {
        title: chapterSeed.title,
        description: chapterSeed.description,
      },
    });

    for (const lessonSeed of chapterSeed.lessons) {
      const lesson = await prisma.lesson.upsert({
        where: {
          legacyId: lessonSeed.legacyId,
        },
        create: {
          legacyId: lessonSeed.legacyId,
          chapterId: chapter.id,
          title: lessonSeed.title,
          description: lessonSeed.description,
          order: lessonSeed.order,
          xpReward: lessonSeed.xpReward,
          isPublished: lessonSeed.isPublished,
          imageUrl: lessonSeed.imageUrl || null,
        },
        update: {
          chapterId: chapter.id,
          title: lessonSeed.title,
          description: lessonSeed.description,
          order: lessonSeed.order,
          xpReward: lessonSeed.xpReward,
          isPublished: lessonSeed.isPublished,
          imageUrl: lessonSeed.imageUrl || null,
        },
      });

      // Update known questions in place. Removing old questions should be an
      // explicit content operation so seed reruns cannot accidentally erase data.
      for (const questionSeed of lessonSeed.questions) {
        await prisma.question.upsert({
          where: {
            lessonId_order: {
              lessonId: lesson.id,
              order: questionSeed.order,
            },
          },
          create: toQuestionData(questionSeed, lesson.id),
          update: toQuestionData(questionSeed, lesson.id),
        });
      }
    }
  }

  return course;
}

try {
  const course = await seedCourse();
  console.log(`Seeded course: ${course.slug}`);
} finally {
  await prisma.$disconnect();
}
