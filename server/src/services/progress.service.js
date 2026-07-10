import prisma from "../lib/prisma.js";

function toProgressResponse(progress) {
  return {
    lessonId: progress.lessonId,
    completed: progress.completed,
    attempts: progress.attempts,
    correctAnswers: progress.correctAnswers,
    wrongAnswers: progress.wrongAnswers,
    completedAt: progress.completedAt,
  };
}

export async function getUserProgress(userId) {
  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return progress.map(toProgressResponse);
}

export async function recordLessonAttempt({
  userId,
  lessonId,
  correctAnswers,
  wrongAnswers,
  completed,
}) {
  const now = new Date();
  const existingProgress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });
  const shouldBeCompleted = Boolean(existingProgress?.completed || completed);
  const completedAt =
    existingProgress?.completedAt ||
    (completed ? now : null);

  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    create: {
      userId,
      lessonId,
      completed: shouldBeCompleted,
      attempts: 1,
      correctAnswers,
      wrongAnswers,
      completedAt,
    },
    update: {
      attempts: {
        increment: 1,
      },
      correctAnswers: {
        increment: correctAnswers,
      },
      wrongAnswers: {
        increment: wrongAnswers,
      },
      completed: shouldBeCompleted,
      completedAt,
    },
  });

  return toProgressResponse(progress);
}

export function formatProgress(progress) {
  return toProgressResponse(progress);
}
