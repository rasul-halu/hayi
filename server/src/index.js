import "dotenv/config";

import cors from "cors";
import express from "express";
import achievementRouter from "./routes/achievement.routes.js";
import authRouter from "./routes/auth.routes.js";
import healthRouter from "./routes/health.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";
import progressRouter from "./routes/progress.routes.js";
import statsRouter from "./routes/stats.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL;
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = new Set(
  isProduction
    ? [
        CLIENT_URL,
      ].filter(Boolean)
    : [
        CLIENT_URL || "http://localhost:3000",
        "http://localhost:3000",
      ]
);

function corsOrigin(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }

  callback(null, allowedOrigins.has(origin));
}

app.use(express.json());
app.use(
  cors({
    origin: corsOrigin,
  })
);

app.use("/api", healthRouter);
app.use("/api/achievements", achievementRouter);
app.use("/api/auth", authRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/progress", progressRouter);
app.use("/api/stats", statsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Hayi API is running on port ${PORT}`);
});
