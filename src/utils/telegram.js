export function getTelegramWebApp() {
  return typeof window === "undefined"
    ? null
    : window.Telegram?.WebApp || null;
}

export function getTelegramInitData() {
  return getTelegramWebApp()?.initData || "";
}

export function isTelegramWebApp() {
  return getTelegramInitData().trim().length > 0;
}

export function getTelegramUserUnsafe() {
  return getTelegramWebApp()?.initDataUnsafe?.user || null;
}

export function getTelegramUser() {
  return getTelegramUserUnsafe();
}

export function prepareTelegramWebApp() {
  const webApp = getTelegramWebApp();

  webApp?.ready?.();
  webApp?.expand?.();
}

// initDataUnsafe user is only for temporary display.
// Trusted authentication must use backend validation of initData.
