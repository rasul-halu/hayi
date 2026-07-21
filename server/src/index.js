import "dotenv/config";

import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import achievementRouter from "./routes/achievement.routes.js";
import adminMediaRouter from "./routes/adminMedia.routes.js";
import adminRouter from "./routes/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import courseRouter from "./routes/course.routes.js";
import dictionaryRouter from "./routes/dictionary.routes.js";
import healthRouter from "./routes/health.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";
import lessonRouter from "./routes/lesson.routes.js";
import progressRouter from "./routes/progress.routes.js";
import statsRouter from "./routes/stats.routes.js";
import userRouter from "./routes/user.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL;
const isProduction = process.env.NODE_ENV === "production";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeOrigin(origin) {
  return origin?.replace(/\/$/, "");
}

const allowedOrigins = new Set(
  isProduction
    ? [
        normalizeOrigin(CLIENT_URL),
      ].filter(Boolean)
    : [
        normalizeOrigin(CLIENT_URL || "http://localhost:3000"),
        "http://localhost:3000",
      ]
);

function corsOrigin(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }

  callback(null, allowedOrigins.has(normalizeOrigin(origin)));
}

app.use(express.json());
app.use(
  cors({
    origin: corsOrigin,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", healthRouter);
app.use("/api/admin/media", adminMediaRouter);
app.use("/api/admin", adminRouter);
app.use("/api/achievements", achievementRouter);
app.use("/api/auth", authRouter);
app.use("/api/courses", courseRouter);
app.use("/api/dictionary", dictionaryRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/progress", progressRouter);
app.use("/api/stats", statsRouter);
app.use("/api/user", userRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Hayi API is running on port ${PORT}`);
});
