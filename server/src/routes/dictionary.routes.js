import express from "express";
import { listPublicDictionary } from "../controllers/dictionary.controller.js";
import { getReferenceEntry, searchReferenceDictionary } from "../controllers/referenceDictionary.controller.js";

const router = express.Router();

router.get("/", listPublicDictionary);
router.get("/search", searchReferenceDictionary);
router.get("/entries/:id", getReferenceEntry);

export default router;
