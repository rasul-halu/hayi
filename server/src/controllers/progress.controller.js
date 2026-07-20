import {
  formatProgress,
  getUserProgress,
  recordLessonAttempt,
} from "../services/progress.service.js";
import { evaluateAndUnlockAchievements } from "../services/achievement.service.js";
import { completeLessonAndUpdateStats } from "../services/userStats.service.js";

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function validateProgressPayload(body) {
  const lessonId =
    body?.lessonId === undefined || body?.lessonId === null
      ? ""
      : String(body.lessonId).trim();
  const correctAnswers = Number(body?.correctAnswers);
  const wrongAnswers = Number(body?.wrongAnswers);
  const completed = body?.completed;

  if (!lessonId) {
    return { error: "lessonId is required" };
  }

  if (!isNonNegativeInteger(correctAnswers)) {
    return { error: "correctAnswers must be a non-negative integer" };
  }

  if (!isNonNegativeInteger(wrongAnswers)) {
    return { error: "wrongAnswers must be a non-negative integer" };
  }

  if (typeof completed !== "boolean") {
    return { error: "completed must be a boolean" };
  }

  return {
    value: {
      lessonId,
      correctAnswers,
      wrongAnswers,
      completed,
    },
  };
}

function validateLessonCompletePayload(body) {
  const lessonId =
    body?.lessonId === undefined || body?.lessonId === null
      ? ""
      : String(body.lessonId).trim();

  if (!lessonId) {
    return { error: "lessonId is required" };
  }

  return {
    value: {
      lessonId,
    },
  };
}

export async function getProgress(req, res, next) {
  try {
    const progress = await getUserProgress(req.user.id);

    return res.json({
      progress,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Progress loading error:",
        error.code || error.name || "UnknownError"
      );
    }

    return res.status(503).json({
      error: "Database is temporarily unavailable",
    });
  }
}

export async function completeLesson(req, res, next) {
  try {
    const validation = validateProgressPayload(req.body);

    if (validation.error) {
      return res.status(400).json({
        error: validation.error,
      });
    }

    const progress = await recordLessonAttempt({
      userId: req.user.id,
      ...validation.value,
    });

    return res.json({
      saved: true,
      progress,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Progress saving error:",
        error.code || error.name || "UnknownError"
      );
    }

    return res.status(503).json({
      error: "Database is temporarily unavailable",
    });
  }
}

export async function completeLessonOnServer(req, res) {
  try {
    const validation = validateLessonCompletePayload(req.body);

    if (validation.error) {
      return res.status(400).json({
        error: validation.error,
      });
    }

    const result = await completeLessonAndUpdateStats({
      userId: req.user.id,
      lessonId: validation.value.lessonId,
    });
    const achievementResult = await evaluateAndUnlockAchievements(req.user.id);

    return res.json({
      saved: true,
      xpAwarded: result.xpAwarded,
      alreadyCompleted: result.alreadyCompleted,
      progress: formatProgress(result.progress),
      achievements: achievementResult.achievements,
      newlyUnlocked: achievementResult.newlyUnlocked,
      stats: achievementResult.stats,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        error: "Lesson not found",
      });
    }

    if (error.statusCode === 402) {
      return res.status(402).json({
        error: "Hearts are empty",
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.error(
        "Lesson complete error:",
        error.code || error.name || "UnknownError"
      );
    }

    return res.status(503).json({
      error: "Database is temporarily unavailable",
    });
  }
}
