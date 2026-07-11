export function getUserInitials(user = {}) {
  const name =
    user.authProvider === "telegram"
      ? user.firstName ||
        (
          user.displayName === "Гость" ||
          user.displayName === "Р“РѕСЃС‚СЊ"
            ? ""
            : user.displayName
        ) ||
        user.username ||
        "У"
      : user.displayName ||
        user.firstName ||
        user.username ||
        "";

  return name.trim().slice(0, 1).toUpperCase();
}
