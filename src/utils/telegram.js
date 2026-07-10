export function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
}

export function getTelegramInitData() {
  return window.Telegram?.WebApp?.initData || "";
}

export function prepareTelegramWebApp() {
  window.Telegram?.WebApp?.ready?.();
  window.Telegram?.WebApp?.expand?.();
}

// initDataUnsafe user is only for temporary display.
// Trusted authentication must use backend validation of initData.
