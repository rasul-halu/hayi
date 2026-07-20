import prisma from "../lib/prisma.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDayStart(date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
}

function toUtcDateKey(date) {
  return toUtcDayStart(date).toISOString().slice(0, 10);
}

function keyToUtcDayStart(key) {
  const date = new Date(`${key}T00:00:00.000Z`);

  return Number.isFinite(date.getTime())
    ? date
    : null;
}

function addDaysToKey(key, days) {
  const date = keyToUtcDayStart(key);

  if (!date) {
    return "";
  }

  return toUtcDateKey(
    new Date(date.getTime() + days * ONE_DAY_MS)
  );
}

export function normalizeActivityDateKeys(values = []) {
  return [...new Set(
    values
      .map(value => {
        const date = value instanceof Date
          ? value
          : new Date(value);

        return Number.isFinite(date.getTime())
          ? toUtcDateKey(date)
          : "";
      })
      .filter(Boolean)
  )].sort();
}

export function calculateCurrentStreak(
  activityDateKeys,
  now = new Date()
) {
  const activityDays = new Set(
    normalizeActivityDateKeys(activityDateKeys)
  );
  const todayKey = toUtcDateKey(now);
  const yesterdayKey = addDaysToKey(todayKey, -1);

  if (!activityDays.has(todayKey) && !activityDays.has(yesterdayKey)) {
    return 0;
  }

  let cursorKey = activityDays.has(todayKey)
    ? todayKey
    : yesterdayKey;
  let streak = 0;

  while (activityDays.has(cursorKey)) {
    streak += 1;
    cursorKey = addDaysToKey(cursorKey, -1);
  }

  return streak;
}

export function calculateLongestStreak(activityDateKeys) {
  const sortedKeys = normalizeActivityDateKeys(activityDateKeys);
  let longestStreak = 0;
  let currentStreak = 0;
  let previousKey = null;

  sortedKeys.forEach(key => {
    currentStreak = previousKey &&
      addDaysToKey(previousKey, 1) === key
        ? currentStreak + 1
        : 1;
    longestStreak = Math.max(longestStreak, currentStreak);
    previousKey = key;
  });

  return longestStreak;
}

export function isActivityToday(activityDateKeys, now = new Date()) {
  return new Set(
    normalizeActivityDateKeys(activityDateKeys)
  ).has(toUtcDateKey(now));
}

export async function getUserActivityDateKeys(userId, tx = prisma) {
  const client = tx;
  const progress = await client.lessonProgress.findMany({
    where: {
      userId,
      completed: true,
      completedAt: {
        not: null,
      },
    },
    select: {
      completedAt: true,
    },
    orderBy: {
      completedAt: "asc",
    },
  });

  return normalizeActivityDateKeys(
    progress.map(item => item.completedAt)
  );
}

export function getEffectiveStreakStats({
  user,
  activityDateKeys,
  now = new Date(),
}) {
  const normalizedActivityDateKeys =
    normalizeActivityDateKeys(activityDateKeys);
  const currentStreak = calculateCurrentStreak(
    normalizedActivityDateKeys,
    now
  );
  const longestFromActivity = calculateLongestStreak(
    normalizedActivityDateKeys
  );
  const storedLongestStreak = Math.max(
    0,
    Number(user?.longestStreak) || 0
  );

  return {
    streak: currentStreak,
    longestStreak: Math.max(
      storedLongestStreak,
      longestFromActivity,
      currentStreak
    ),
    todayLessonCompleted: isActivityToday(
      normalizedActivityDateKeys,
      now
    ),
    activityDateKeys: normalizedActivityDateKeys,
  };
}
