import express from "express";
import { listPublicDictionary } from "../controllers/dictionary.controller.js";

const router = express.Router();

router.get("/", listPublicDictionary);

export default router;
