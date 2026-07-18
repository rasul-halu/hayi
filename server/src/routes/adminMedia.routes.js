import express from "express";
import {
  postAdminAudio,
  postAdminImage,
} from "../controllers/adminMedia.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireTelegramAuth from "../middleware/requireTelegramAuth.js";
import {
  uploadAudioFile,
  uploadImageFile,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(requireTelegramAuth, requireAdmin);

router.post("/image", uploadImageFile, postAdminImage);
router.post("/audio", uploadAudioFile, postAdminAudio);

export default router;
