import { evaluateAndUnlockAchievements } from "../services/achievement.service.js";

export async function getAchievements(req, res) {
  try {
    const result = await evaluateAndUnlockAchievements(req.user.id);

    return res.json(result);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Achievements loading error:",
        error.code || error.name || "UnknownError"
      );
    }

    return res.status(503).json({
      error: "Achievements are temporarily unavailable",
    });
  }
}
