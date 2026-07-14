import express from "express";
import { getAdminMe } from "../controllers/admin.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireTelegramAuth from "../middleware/requireTelegramAuth.js";

const router = express.Router();

router.get("/me", requireTelegramAuth, requireAdmin, getAdminMe);

export default router;
