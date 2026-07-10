import express from "express";
import {
  completeLesson,
  completeLessonOnServer,
  getProgress,
} from "../controllers/progress.controller.js";
import requireTelegramAuth from "../middleware/requireTelegramAuth.js";

const router = express.Router();

router.get("/", requireTelegramAuth, getProgress);
router.post("/lesson", requireTelegramAuth, completeLesson);
router.post("/lesson-complete", requireTelegramAuth, completeLessonOnServer);

export default router;
