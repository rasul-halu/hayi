import {
  DEFAULT_LESSON_XP,
  HEART_REFILL_INTERVAL_HOURS,
} from "../config/game.constants.js";
import prisma from "../lib/prisma.js";
import {
  isPreviousUtcDay,
  isSameUtcDay,
} from "../utils/dateUtils.js";
import { awardXp } from "./xp.service.js";

const HEART_REFILL_INTERVAL_MS =
  HEART_REFILL_INTERVAL_HOURS * 60 * 60 * 1000;

export function toStatsResponse(user) {
  return {
    xp: user.xp,
    hearts: user.hearts,
    maxHearts: user.maxHearts,
    streak: user.streak,
    longestStreak: user.longestStreak,
    totalCorrectAnswers: user.totalCorrectAnswers,
    totalWrongAnswers: user.totalWrongAnswers,
    lastLessonCompletedDate: user.lastLessonCompletedDate,
  };
}

export async function applyHeartRefill(user) {
  const now = new Date();
  const maxHearts = user.maxHearts;

  if (user.hearts >= maxHearts) {
    if (user.lastHeartRefillAt && user.lastHeartRefillAt < now) {
      return prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          hearts: maxHearts,
          lastHeartRefillAt: now,
        },
      });
    }

    return user;
  }

  const lastHeartRefillAt = user.lastHeartRefillAt || now;
  const elapsedMs = now.getTime() - lastHeartRefillAt.getTime();
  const refillCount = Math.floor(elapsedMs / HEART_REFILL_INTERVAL_MS);

  if (refillCount <= 0) {
    return user;
  }

  const nextHearts = Math.min(user.hearts + refillCount, maxHearts);
  const nextLastHeartRefillAt =
    nextHearts >= maxHearts
      ? now
      : new Date(
          lastHeartRefillAt.getTime() +
          refillCount * HEART_REFILL_INTERVAL_MS
        );

  return prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      hearts: nextHearts,
      lastHeartRefillAt: nextLastHeartRefillAt,
    },
  });
}

export async function getUserStats(userId) {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  return toStatsResponse(await applyHeartRefill(user));
}

export async function recordWrongAnswer(userId) {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const refilledUser = await applyHeartRefill(user);

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      hearts: Math.max(refilledUser.hearts - 1, 0),
      totalWrongAnswers: {
        increment: 1,
      },
    },
  });

  return toStatsResponse(updatedUser);
}

export async function recordCorrectAnswer(userId) {
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      totalCorrectAnswers: {
        increment: 1,
      },
    },
  });

  return toStatsResponse(updatedUser);
}

function getNextStreakValues(user, now) {
  const lastLessonCompletedDate = user.lastLessonCompletedDate;

  // UTC is the first server-side policy. Later this should become a
  // product-level timezone policy per user or per Telegram locale.
  if (isSameUtcDay(lastLessonCompletedDate, now)) {
    return {
      streak: user.streak,
      longestStreak: user.longestStreak,
    };
  }

  const streak = isPreviousUtcDay(lastLessonCompletedDate, now)
    ? user.streak + 1
    : 1;

  return {
    streak,
    longestStreak: Math.max(user.longestStreak, streak),
  };
}

export async function completeLessonAndUpdateStats({
  userId,
  lessonId,
}) {
  return prisma.$transaction(async tx => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    const existingProgress = await tx.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    const wasAlreadyCompleted = Boolean(existingProgress?.completed);
    const now = new Date();

    const progress = wasAlreadyCompleted
      ? existingProgress
      : await tx.lessonProgress.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },
          create: {
            userId,
            lessonId,
            completed: true,
            attempts: 1,
            completedAt: now,
          },
          update: {
            completed: true,
            attempts: {
              increment: 1,
            },
            completedAt: existingProgress?.completedAt || now,
          },
        });

    if (wasAlreadyCompleted) {
      return {
        progress,
        stats: toStatsResponse(user),
        xpAwarded: 0,
        xpEvent: null,
        alreadyCompleted: true,
      };
    }

    const streakValues = getNextStreakValues(user, now);
    const uniqueKey = `lesson_complete:${userId}:${lessonId}`;

    // Temporary: XP is fixed until Course/Lesson data moves to the database.
    const xpAward = await awardXp({
      userId,
      amount: DEFAULT_LESSON_XP,
      source: "lesson_complete",
      lessonId,
      uniqueKey,
      tx,
    });

    const updatedUser = await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        streak: streakValues.streak,
        longestStreak: streakValues.longestStreak,
        lastLessonCompletedDate: now,
      },
    });

    return {
      progress,
      stats: toStatsResponse(updatedUser),
      xpAwarded: DEFAULT_LESSON_XP,
      xpEvent: xpAward.event,
      alreadyCompleted: false,
    };
  });
}
