const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
];

function asDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function toDateKey(value) {
  const date = asDate(value);

  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isSameDay(dateA, dateB) {
  const first = asDate(dateA);
  const second = asDate(dateB);

  if (!first || !second) {
    return false;
  }

  return toDateKey(first) === toDateKey(second);
}

export function formatMonthTitle(date = new Date()) {
  const current = asDate(date) || new Date();
  return `${MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`;
}

export function getCurrentMonthDays(date = new Date()) {
  const current = asDate(date) || new Date();
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
  const cells = [];

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    cells.push({
      type: "empty",
      key: `empty-start-${index}`
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const cellDate = new Date(year, month, day);

    cells.push({
      type: "day",
      key: toDateKey(cellDate),
      date: cellDate,
      day
    });
  }

  const trailingEmptyDays = (7 - (cells.length % 7)) % 7;

  for (let index = 0; index < trailingEmptyDays; index += 1) {
    cells.push({
      type: "empty",
      key: `empty-end-${index}`
    });
  }

  return cells;
}

export function getStreakDaySet({ streak, lastLessonCompletedDate }) {
  const streakLength = Math.max(0, Number(streak) || 0);
  const days = new Set();

  if (streakLength === 0) {
    return days;
  }

  // TODO: replace this fallback with real DailyActivity records from backend.
  const today = new Date();
  const parsedLastDate = asDate(lastLessonCompletedDate);
  const endDate =
    parsedLastDate && parsedLastDate <= today
      ? parsedLastDate
      : today;

  for (let index = 0; index < streakLength; index += 1) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - index);
    days.add(toDateKey(date));
  }

  return days;
}
