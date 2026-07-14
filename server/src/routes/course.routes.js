import express from "express";
import {
  getCourse,
  getCourses,
} from "../controllers/course.controller.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:slug", getCourse);

export default router;
