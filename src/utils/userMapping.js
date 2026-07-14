export function mapBackendUserToAppUser(backendUser = {}) {
  const firstName =
    backendUser.firstName ||
    backendUser.first_name ||
    "";

  const lastName =
    backendUser.lastName ||
    backendUser.last_name ||
    "";

  const username =
    backendUser.username ||
    "";

  const displayName =
    firstName ||
    username ||
    "Ученик";

  return {
    backendUserId:
      backendUser.id !== undefined && backendUser.id !== null
        ? String(backendUser.id)
        : null,
    telegramId:
      backendUser.telegramId !== undefined && backendUser.telegramId !== null
        ? String(backendUser.telegramId)
        : backendUser.id !== undefined && backendUser.id !== null
        ? String(backendUser.id)
        : null,
    firstName,
    lastName: lastName || null,
    username,
    telegramUsername: username || null,
    avatarUrl:
      backendUser.avatarUrl ||
      backendUser.photo_url ||
      "",
    displayName,
    languageCode:
      backendUser.languageCode ||
      backendUser.language_code ||
      null,
    isPremium: Boolean(
      backendUser.isPremium ||
      backendUser.is_premium
    ),
    role: backendUser.role || "USER",
    isGuest: false,
    authProvider: "telegram"
  };
}
