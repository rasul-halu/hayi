import express from "express";
import { getLesson } from "../controllers/course.controller.js";

const router = express.Router();

router.get("/:lessonId", getLesson);

export default router;
