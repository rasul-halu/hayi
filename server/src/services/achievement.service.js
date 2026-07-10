import { ACHIEVEMENTS } from "../config/achievements.js";
import prisma from "../lib/prisma.js";
import { toStatsResponse } from "./userStats.service.js";
import { awardXp } from "./xp.service.js";

const MAX_EVALUATION_PASSES = 3;

function getCurrentValue(achievement, {
  user,
  completedLessonsCount,
}) {
  if (achievement.type === "completed_lessons") {
    return completedLessonsCount;
  }

  if (achievement.type === "xp") {
    return user.xp;
  }

  if (achievement.type === "streak") {
    return user.longestStreak;
  }

  if (achievement.type === "correct_answers") {
    return user.totalCorrectAnswers;
  }

  return 0;
}

function formatAchievement(achievement, {
  currentValue,
  unlockedAt,
}) {
  const progress = Math.min(currentValue, achievement.target);

  return {
    key: achievement.key,
    title: achievement.title,
    description: achievement.description,
    type: achievement.type,
    progress,
    target: achievement.target,
    maxProgress: achievement.target,
    unlocked: Boolean(unlockedAt),
    unlockedAt,
    xpReward: achievement.xpReward,
    image: achievement.image || null,
  };
}

async function getAchievementState(userId, client = prisma) {
  const [user, completedLessonsCount, unlockedAchievements] =
    await Promise.all([
      client.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      }),
      client.lessonProgress.count({
        where: {
          userId,
          completed: true,
        },
      }),
      client.userAchievement.findMany({
        where: {
          userId,
        },
      }),
    ]);

  const unlockedByKey = new Map(
    unlockedAchievements.map(achievement => [
      achievement.achievementKey,
      achievement,
    ])
  );

  return {
    user,
    completedLessonsCount,
    unlockedByKey,
  };
}

function buildAchievementProgress(state) {
  return ACHIEVEMENTS.map(achievement => {
    const storedAchievement = state.unlockedByKey.get(achievement.key);

    return formatAchievement(achievement, {
      currentValue: getCurrentValue(achievement, state),
      unlockedAt: storedAchievement?.unlockedAt || null,
    });
  });
}

export async function getAchievementProgress(userId) {
  return buildAchievementProgress(
    await getAchievementState(userId)
  );
}

async function unlockAchievement(client, userId, achievement) {
  try {
    const unlockedAchievement = await client.userAchievement.create({
      data: {
        userId,
        achievementKey: achievement.key,
      },
    });

    if (achievement.xpReward > 0) {
      await awardXp({
        userId,
        amount: achievement.xpReward,
        source: "achievement",
        lessonId: null,
        uniqueKey: `achievement:${userId}:${achievement.key}`,
        tx: client,
      });
    }

    return unlockedAchievement;
  } catch (error) {
    if (error.code === "P2002") {
      return null;
    }

    throw error;
  }
}

export async function evaluateAndUnlockAchievements(userId) {
  return prisma.$transaction(async client => {
    const newlyUnlocked = [];

    for (let pass = 0; pass < MAX_EVALUATION_PASSES; pass += 1) {
      const state = await getAchievementState(userId, client);
      const unlockableAchievements = ACHIEVEMENTS.filter(achievement => {
        if (state.unlockedByKey.has(achievement.key)) {
          return false;
        }

        return getCurrentValue(achievement, state) >= achievement.target;
      });

      if (unlockableAchievements.length === 0) {
        break;
      }

      for (const achievement of unlockableAchievements) {
        const unlockedAchievement = await unlockAchievement(
          client,
          userId,
          achievement
        );

        if (unlockedAchievement) {
          newlyUnlocked.push({
            key: achievement.key,
            title: achievement.title,
            xpReward: achievement.xpReward,
          });
        }
      }
    }

    const finalState = await getAchievementState(userId, client);

    return {
      achievements: buildAchievementProgress(finalState),
      newlyUnlocked,
      stats: toStatsResponse(finalState.user),
    };
  });
}
