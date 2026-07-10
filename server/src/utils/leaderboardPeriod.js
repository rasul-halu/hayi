export const LEADERBOARD_PERIODS = new Set([
  "global",
  "daily",
  "weekly",
]);

function getUtcDayStart(date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
}

function getUtcWeekStart(date) {
  const dayStart = getUtcDayStart(date);
  const day = dayStart.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;

  dayStart.setUTCDate(dayStart.getUTCDate() - daysSinceMonday);

  return dayStart;
}

export function getLeaderboardPeriodRange(period) {
  const now = new Date();

  if (period === "global") {
    return {
      startDate: null,
      endDate: null,
    };
  }

  // UTC is the first leaderboard policy. Later this should become a
  // product-level timezone policy for each user's local day/week.
  if (period === "daily") {
    return {
      startDate: getUtcDayStart(now),
      endDate: null,
    };
  }

  if (period === "weekly") {
    return {
      startDate: getUtcWeekStart(now),
      endDate: null,
    };
  }

  throw new Error("Unknown leaderboard period");
}
