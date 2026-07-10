import { getLeaderboard as getLeaderboardData } from "../services/leaderboard.service.js";
import { LEADERBOARD_PERIODS } from "../utils/leaderboardPeriod.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const DEFAULT_PERIOD = "weekly";

function parseLimit(value) {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  const numericLimit = Number(value);

  if (!Number.isInteger(numericLimit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(numericLimit, 1), MAX_LIMIT);
}

function parsePeriod(value) {
  const period = value || DEFAULT_PERIOD;

  return LEADERBOARD_PERIODS.has(period)
    ? period
    : null;
}

export async function getLeaderboard(req, res) {
  try {
    const limit = parseLimit(req.query.limit);
    const period = parsePeriod(req.query.period);

    if (!period) {
      return res.status(400).json({
        error: "Unknown leaderboard period",
      });
    }

    const result = await getLeaderboardData({
      currentUserId: req.user.id,
      limit,
      period,
    });

    return res.json({
      period,
      leaderboard: result.entries,
      currentUser: result.currentUser,
      totalUsers: result.totalUsers,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Leaderboard loading error:",
        error.code || error.name || "UnknownError"
      );
    }

    return res.status(503).json({
      error: "Leaderboard is temporarily unavailable",
    });
  }
}
