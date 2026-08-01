import asyncHandler from "../middleware/asyncHandler.js";
import * as metricsService from "../services/monitoring/metrics.service.js";

export const getMetrics = asyncHandler(async (req, res) => {
  const data = await metricsService.collectMetrics();
  return res.status(200).json(data);
});

export default {
  getMetrics
};
