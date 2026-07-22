import express from "express";
import { listPublicAlphabet } from "../controllers/alphabet.controller.js";

const router = express.Router();

router.get("/", listPublicAlphabet);

export default router;
