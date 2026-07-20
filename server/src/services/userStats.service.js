import {
  MAX_HEARTS,
} from "../config/game.constants.js";
import prisma from "../lib/prisma.js";
import { getPublishedLessonXpReward } from "./course.service.js";
import {
  applyHeartRegeneration,
  getRegeneratedHeartState,
  loseHeartForUser,
} from "./hearts.service.js";
import {
  getEffectiveStreakStats,
  getUserActivityDateKeys,
} from "./streak.service.js";
import { awardXp } from "./xp.service.js";

export function toStatsResponse(user, streakStats) {
  const heartState = getRegeneratedHeartState(user);
  const effectiveStreakStats = streakStats || {
    streak: user.streak,
    longestStreak: user.longestStreak,
    todayLessonCompleted: false,
    activityDateKeys: [],
  };

  return {
    xp: user.xp,
    hearts: heartState.hearts,
    maxHearts: heartState.maxHearts || MAX_HEARTS,
    nextHeartAt: heartState.nextHeartAt
      ? heartState.nextHeartAt.toISOString()
      : null,
    secondsUntilNextHeart: heartState.secondsUntilNextHeart,
    lastHeartRefillAt: user.lastHeartRefillAt
      ? user.lastHeartRefillAt.toISOString()
      : null,
    streak: effectiveStreakStats.streak,
    longestStreak: effectiveStreakStats.longestStreak,
    todayLessonCompleted: effectiveStreakStats.todayLessonCompleted,
    activityDateKeys: effectiveStreakStats.activityDateKeys,
    totalCorrectAnswers: user.totalCorrectAnswers,
    totalWrongAnswers: user.totalWrongAnswers,
    lastLessonCompletedDate: user.lastLessonCompletedDate,
  };
}

export async function applyHeartRefill(user) {
  return (await applyHeartRegeneration(user.id)).user;
}

export async function getUserStats(userId) {
  const { user } = await applyHeartRegeneration(userId);
  const activityDateKeys = await getUserActivityDateKeys(userId);

  return toStatsResponse(
    user,
    getEffectiveStreakStats({
      user,
      activityDateKeys,
    })
  );
}

export async function recordWrongAnswer(userId) {
  const { user: heartUser } = await loseHeartForUser(userId);

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      totalWrongAnswers: {
        increment: 1,
      },
    },
  });

  const responseUser = {
    ...updatedUser,
    hearts: heartUser.hearts,
    lastHeartRefillAt: heartUser.lastHeartRefillAt,
  };
  const activityDateKeys = await getUserActivityDateKeys(userId);

  return toStatsResponse(
    responseUser,
    getEffectiveStreakStats({
      user: responseUser,
      activityDateKeys,
    })
  );
}

export async function recordCorrectAnswer(userId) {
  const { user: heartUser } = await applyHeartRegeneration(userId);
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

  const responseUser = {
    ...updatedUser,
    hearts: heartUser.hearts,
    lastHeartRefillAt: heartUser.lastHeartRefillAt,
  };
  const activityDateKeys = await getUserActivityDateKeys(userId);

  return toStatsResponse(
    responseUser,
    getEffectiveStreakStats({
      user: responseUser,
      activityDateKeys,
    })
  );
}

export async function completeLessonAndUpdateStats({
  userId,
  lessonId,
}) {
  const { user: heartUser } = await applyHeartRegeneration(userId);

  if (heartUser.hearts <= 0) {
    const error = new Error("Hearts are empty");
    error.statusCode = 402;
    throw error;
  }

  return prisma.$transaction(async tx => {
    const lesson = await getPublishedLessonXpReward(lessonId, tx);

    if (!lesson) {
      const error = new Error("Lesson not found");
      error.statusCode = 404;
      throw error;
    }

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
      const activityDateKeys = await getUserActivityDateKeys(userId, tx);

      return {
        progress,
        stats: toStatsResponse(
          user,
          getEffectiveStreakStats({
            user,
            activityDateKeys,
            now,
          })
        ),
        xpAwarded: 0,
        xpEvent: null,
        alreadyCompleted: true,
      };
    }

    const uniqueKey = `lesson_complete:${userId}:${lessonId}`;
    const xpReward = lesson.xpReward;

    const xpAward = await awardXp({
      userId,
      amount: xpReward,
      source: "lesson_complete",
      lessonId,
      uniqueKey,
      tx,
    });
    const activityDateKeys = await getUserActivityDateKeys(userId, tx);
    const streakValues = getEffectiveStreakStats({
      user,
      activityDateKeys,
      now,
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
      stats: toStatsResponse(updatedUser, streakValues),
      xpAwarded: xpReward,
      xpEvent: xpAward.event,
      alreadyCompleted: false,
    };
  });
}
