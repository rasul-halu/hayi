export function getTelegramWebApp() {
  return typeof window === "undefined"
    ? null
    : window.Telegram?.WebApp || null;
}

export function getTelegramInitData() {
  const webAppInitData = getTelegramWebApp()?.initData || "";

  return webAppInitData || getTelegramInitDataFromHash();
}

export function getTelegramInitDataFromHash() {
  if (typeof window === "undefined") {
    return "";
  }

  const hash = window.location.hash || "";
  const normalizedHash = hash.startsWith("#")
    ? hash.slice(1)
    : hash;

  if (!normalizedHash) {
    return "";
  }

  const params = new URLSearchParams(normalizedHash);

  // URLSearchParams decodes the tgWebAppData wrapper once. Do not decode it
  // again: the inner Telegram initData query string must keep its own escaping.
  return params.get("tgWebAppData") || "";
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
