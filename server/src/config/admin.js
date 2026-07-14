export function getAdminTelegramIds() {
  return (process.env.ADMIN_TELEGRAM_IDS || "")
    .split(",")
    .map(id => id.trim())
    .filter(Boolean);
}

export function isAdminTelegramId(telegramId) {
  return getAdminTelegramIds().includes(String(telegramId));
}
