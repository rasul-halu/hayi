import express from "express";
import {
  getStats,
  saveCorrectAnswer,
  saveWrongAnswer,
} from "../controllers/stats.controller.js";
import requireTelegramAuth from "../middleware/requireTelegramAuth.js";

const router = express.Router();

router.get("/", requireTelegramAuth, getStats);
router.post("/correct-answer", requireTelegramAuth, saveCorrectAnswer);
router.post("/wrong-answer", requireTelegramAuth, saveWrongAnswer);

export default router;
