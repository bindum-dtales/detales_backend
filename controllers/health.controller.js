import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";
import * as healthService from "../services/health/health.service.js";

export const getHealthStatus = asyncHandler(async (req, res) => {
  const data = healthService.getHealth();
  return res.status(200).json(data);
});

export const getReadinessStatus = asyncHandler(async (req, res) => {
  const data = await healthService.getReadiness();
  const status = data.ready ? 200 : 503;

  logger.info("Readiness check", { service: "health", endpoint: req.originalUrl, ready: data.ready });

  return res.status(status).json(data);
});

export const getVersionInfo = asyncHandler(async (req, res) => {
  const data = await healthService.getVersionInfo();
  return res.status(200).json(data);
});

export default {
  getHealthStatus,
  getReadinessStatus,
  getVersionInfo
};
