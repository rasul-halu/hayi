import express from "express";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";
import requireTelegramAuth from "../middleware/requireTelegramAuth.js";

const router = express.Router();

router.get("/", requireTelegramAuth, getLeaderboard);

export default router;
