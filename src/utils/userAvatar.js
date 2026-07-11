export function getUserInitials(user = {}) {
  const name =
    user.displayName ||
    user.firstName ||
    user.username ||
    "";

  return name.trim().slice(0, 1).toUpperCase();
}
