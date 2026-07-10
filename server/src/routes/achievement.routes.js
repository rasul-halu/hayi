import express from "express";
import { getAchievements } from "../controllers/achievement.controller.js";
import requireTelegramAuth from "../middleware/requireTelegramAuth.js";

const router = express.Router();

router.get("/", requireTelegramAuth, getAchievements);

export default router;
