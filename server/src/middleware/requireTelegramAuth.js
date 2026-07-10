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
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Telegram auth middleware error:",
        error.code || error.name || "UnknownError"
      );
    }

    return res.status(503).json({
      error: "Database is temporarily unavailable",
    });
  }
}
