import { applyHeartRegeneration } from "../services/hearts.service.js";
import {
  getUserStats,
  recordCorrectAnswer,
  recordWrongAnswer,
} from "../services/userStats.service.js";

function handleStatsError(res, error, label) {
  if (process.env.NODE_ENV === "development") {
    console.error(label, error.code || error.name || "UnknownError");
  }

  return res.status(503).json({
    error: "Database is temporarily unavailable",
  });
}

export async function getStats(req, res) {
  try {
    const stats = await getUserStats(req.user.id);

    return res.json({
      stats,
    });
  } catch (error) {
    return handleStatsError(res, error, "Stats loading error:");
  }
}

export async function getHearts(req, res) {
  try {
    const { heartState } = await applyHeartRegeneration(req.user.id);

    return res.json(heartState);
  } catch (error) {
    return handleStatsError(res, error, "Hearts loading error:");
  }
}

export async function saveCorrectAnswer(req, res) {
  try {
    const stats = await recordCorrectAnswer(req.user.id);

    return res.json({
      saved: true,
      stats,
    });
  } catch (error) {
    return handleStatsError(res, error, "Correct answer stats error:");
  }
}

export async function saveWrongAnswer(req, res) {
  try {
    const stats = await recordWrongAnswer(req.user.id);

    return res.json({
      saved: true,
      stats,
    });
  } catch (error) {
    return handleStatsError(res, error, "Wrong answer stats error:");
  }
}
