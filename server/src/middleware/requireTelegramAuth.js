import { upsertTelegramUser } from "../services/user.service.js";
import { validateTelegramInitData } from "../utils/validateTelegramInitData.js";

export default async function requireTelegramAuth(req, res, next) {
  try {
    const initData = req.headers["x-telegram-init-data"];

    if (!initData) {
      return res.status(401).json({
        error: "Telegram authentication required",
      });
    }

    const result = validateTelegramInitData(initData);

    if (!result.isValid) {
      return res.status(401).json({
        error: "Invalid Telegram authentication",
      });
    }

    req.user = await upsertTelegramUser(result.user);

    return next();
  } catch (error) {
    console.error("Telegram auth middleware error:", {
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });

    return res.status(503).json({
      error: "Database is temporarily unavailable",
    });
  }
}
