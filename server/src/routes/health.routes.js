import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "hayi-api",
  });
});

router.get("/health/database", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

export default router;
