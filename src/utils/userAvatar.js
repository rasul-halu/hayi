const GUEST_NAMES = new Set([
  "Гость",
  "Guest",
  "Р“РѕСЃС‚СЊ",
  "Р вЂњР С•РЎРѓРЎвЂљРЎРЉ"
]);

export function getUserInitials(user = {}) {
  const telegramName =
    user.firstName ||
    user.displayName ||
    user.username ||
    "";

  const fallbackName =
    user.displayName ||
    user.firstName ||
    user.username ||
    "";

  const name = user.authProvider === "telegram"
    ? telegramName
    : fallbackName;

  const cleanName = GUEST_NAMES.has(name) ? "" : String(name).trim();

  if (!cleanName) {
    return "";
  }

  return cleanName.slice(0, 1).toUpperCase();
}
