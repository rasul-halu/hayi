import crypto from "crypto";

export const MAX_AUTH_AGE_SECONDS = 86400;

export function createTelegramHash(botToken, dataCheckString) {
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  return crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
}

function safeCompareHashes(expectedHash, actualHash) {
  const expected = Buffer.from(expectedHash, "hex");
  const actual = Buffer.from(actualHash, "hex");

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}

function pickTelegramUserFields(user) {
  if (!user || user.id === undefined || user.id === null) {
    return null;
  }

  return {
    id: String(user.id),
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    language_code: user.language_code,
    photo_url: user.photo_url,
    is_premium: user.is_premium,
  };
}

export function validateTelegramInitData(initData, options = {}) {
  const botToken = options.botToken || process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    const error = new Error("TELEGRAM_BOT_TOKEN is not configured");
    error.statusCode = 500;
    throw error;
  }

  if (typeof initData !== "string" || initData.length === 0) {
    return { isValid: false, user: null };
  }

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date"));

  if (!receivedHash || !Number.isFinite(authDate)) {
    return { isValid: false, user: null };
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (nowInSeconds - authDate > MAX_AUTH_AGE_SECONDS) {
    return { isValid: false, user: null };
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const calculatedHash = createTelegramHash(botToken, dataCheckString);

  if (!safeCompareHashes(calculatedHash, receivedHash)) {
    return { isValid: false, user: null };
  }

  const rawUser = params.get("user");

  if (!rawUser) {
    return { isValid: false, user: null };
  }

  try {
    const parsedUser = JSON.parse(rawUser);
    const user = pickTelegramUserFields(parsedUser);

    return {
      isValid: Boolean(user),
      user,
    };
  } catch {
    return { isValid: false, user: null };
  }
}
