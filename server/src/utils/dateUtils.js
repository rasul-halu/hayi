function getUtcDayStart(date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
}

export function isSameUtcDay(leftDate, rightDate) {
  if (!leftDate || !rightDate) {
    return false;
  }

  return getUtcDayStart(leftDate).getTime() ===
    getUtcDayStart(rightDate).getTime();
}

export function isPreviousUtcDay(previousDate, currentDate) {
  if (!previousDate || !currentDate) {
    return false;
  }

  const previousDay = getUtcDayStart(previousDate).getTime();
  const currentDay = getUtcDayStart(currentDate).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  return currentDay - previousDay === oneDayMs;
}
