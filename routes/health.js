import { Router } from "express";
import { getHealthStatus, getReadinessStatus, getVersionInfo } from "../controllers/health.controller.js";

const router = Router();

router.get("/health", getHealthStatus);
router.get("/ready", getReadinessStatus);
router.get("/version", getVersionInfo);

export default router;
