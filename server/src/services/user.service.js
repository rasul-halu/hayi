import prisma from "../lib/prisma.js";
import { isAdminTelegramId } from "../config/admin.js";

function mapTelegramUserToDatabaseFields(telegramUser) {
  return {
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name || null,
    username: telegramUser.username || null,
    avatarUrl: telegramUser.photo_url || null,
    languageCode: telegramUser.language_code || null,
    isPremium: Boolean(telegramUser.is_premium),
  };
}

export function upsertTelegramUser(telegramUser) {
  const telegramId = String(telegramUser.id);
  const profileFields = mapTelegramUserToDatabaseFields(telegramUser);
  const shouldBeAdmin = isAdminTelegramId(telegramId);

  return prisma.user.upsert({
    where: {
      telegramId,
    },
    create: {
      telegramId,
      role: shouldBeAdmin ? "ADMIN" : "USER",
      ...profileFields,
    },
    update: {
      ...profileFields,
      ...(shouldBeAdmin ? { role: "ADMIN" } : {}),
    },
  });
}
