import { upsertTelegramUser } from "../services/user.service.js";
import { validateTelegramInitData } from "../utils/validateTelegramInitData.js";

export async function authenticateTelegram(req, res, next) {
  try {
    const { initData } = req.body || {};

    if (!initData) {
      return res.status(400).json({
        error: "initData is required",
      });
    }

    const result = validateTelegramInitData(initData);

    if (!result.isValid) {
      return res.status(401).json({
        error: "Invalid Telegram initData",
      });
    }

    try {
      const user = await upsertTelegramUser(result.user);

      return res.json({
        authenticated: true,
        user,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Database auth error:",
          error.code || error.name || "UnknownError"
        );
      }

      return res.status(503).json({
        error: "Database is temporarily unavailable",
      });
    }
  } catch (error) {
    return next(error);
  }
}
