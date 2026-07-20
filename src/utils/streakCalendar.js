import {
  normalizeActivityDateKeys,
  normalizeDateKey
} from "./streakUtils";

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
  return normalizeDateKey(value);
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
  return `${MONTH_NAMES[current.getUTCMonth()]} ${current.getUTCFullYear()}`;
}

export function getCurrentMonthDays(date = new Date()) {
  const current = asDate(date) || new Date();
  const year = current.getUTCFullYear();
  const month = current.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const leadingEmptyDays = (firstDay.getUTCDay() + 6) % 7;
  const cells = [];

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    cells.push({
      type: "empty",
      key: `empty-start-${index}`
    });
  }

  for (let day = 1; day <= lastDay.getUTCDate(); day += 1) {
    const cellDate = new Date(Date.UTC(year, month, day));

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

export function getActivityDaySet(activityDateKeys = []) {
  return new Set(normalizeActivityDateKeys(activityDateKeys));
}
