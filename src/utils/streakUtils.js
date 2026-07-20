const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date
    ? new Date(value)
    : new Date(value);

  return Number.isFinite(date.getTime())
    ? date
    : null;
}

function keyToUtcDate(key) {
  const date = new Date(`${key}T00:00:00.000Z`);

  return Number.isFinite(date.getTime())
    ? date
    : null;
}

function addDaysToKey(key, days) {
  const date = keyToUtcDate(key);

  if (!date) {
    return "";
  }

  return normalizeDateKey(
    new Date(date.getTime() + days * ONE_DAY_MS)
  );
}

export function normalizeDateKey(value) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  )).toISOString().slice(0, 10);
}

export function normalizeActivityDateKeys(values = []) {
  return [...new Set(
    values
      .map(normalizeDateKey)
      .filter(Boolean)
  )].sort();
}

export function getTodayDateKey(date = new Date()) {
  return normalizeDateKey(date);
}

export function getYesterdayDateKey(date = new Date()) {
  return addDaysToKey(getTodayDateKey(date), -1);
}

export function calculateCurrentStreak(
  activityDateKeys,
  today = new Date()
) {
  const activityDays = new Set(
    normalizeActivityDateKeys(activityDateKeys)
  );
  const todayKey = getTodayDateKey(today);
  const yesterdayKey = getYesterdayDateKey(today);

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

export function isActivityToday(activityDateKeys, today = new Date()) {
  return new Set(
    normalizeActivityDateKeys(activityDateKeys)
  ).has(getTodayDateKey(today));
}

export function getDayWord(count) {
  const absolute = Math.abs(Number(count) || 0);
  const lastTwo = absolute % 100;
  const lastOne = absolute % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "дней";
  }

  if (lastOne === 1) {
    return "день";
  }

  if (lastOne >= 2 && lastOne <= 4) {
    return "дня";
  }

  return "дней";
}

export function pluralizeDays(count) {
  return `${count} ${getDayWord(count)}`;
}
