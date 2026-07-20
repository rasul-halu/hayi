import express from "express";
import { getHearts } from "../controllers/stats.controller.js";
import requireTelegramAuth from "../middleware/requireTelegramAuth.js";

const router = express.Router();

router.get("/hearts", requireTelegramAuth, getHearts);

export default router;
