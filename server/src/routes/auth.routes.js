import express from "express";
import { authenticateTelegram } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/telegram", authenticateTelegram);

export default router;
