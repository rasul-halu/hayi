import express from "express";
import { getAdminMe } from "../controllers/admin.controller.js";
import {
  getAdminChapter,
  getAdminCourse,
  getAdminLesson,
  getAdminQuestion,
  listAdminCourses,
  listAdminLessons,
  patchAdminChapter,
  patchAdminLesson,
  patchAdminQuestion,
  postAdminChapter,
  postAdminLesson,
  postAdminQuestion,
  postDuplicateAdminLesson,
  postDuplicateAdminQuestion,
} from "../controllers/adminCourse.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireTelegramAuth from "../middleware/requireTelegramAuth.js";

const router = express.Router();

router.use(requireTelegramAuth, requireAdmin);

router.get("/me", getAdminMe);

router.get("/courses", listAdminCourses);
router.get("/courses/:courseId", getAdminCourse);
router.post("/courses/:courseId/chapters", postAdminChapter);

router.get("/chapters/:chapterId", getAdminChapter);
router.patch("/chapters/:chapterId", patchAdminChapter);
router.post("/chapters/:chapterId/lessons", postAdminLesson);

router.get("/lessons", listAdminLessons);
router.get("/lessons/:lessonId", getAdminLesson);
router.patch("/lessons/:lessonId", patchAdminLesson);
router.post("/lessons/:lessonId/duplicate", postDuplicateAdminLesson);
router.post("/lessons/:lessonId/questions", postAdminQuestion);

router.get("/questions/:questionId", getAdminQuestion);
router.patch("/questions/:questionId", patchAdminQuestion);
router.post("/questions/:questionId/duplicate", postDuplicateAdminQuestion);

export default router;
