import { performance } from "perf_hooks";
import logger from "../utils/logger.js";
import { monitoringConfig } from "../config/monitoring.js";
import * as metricsService from "../services/monitoring/metrics.service.js";

export default function metricsTracker(req, res, next) {
  if (!monitoringConfig.enabled) {
    return next();
  }

  const startTime = performance.now();
  metricsService.incrementRequestCount();
  metricsService.incrementActiveRequests();

  res.on("finish", () => {
    metricsService.decrementActiveRequests();

    if (res.statusCode >= 500) {
      metricsService.incrementErrorCount();
    }

    const durationMs = Number((performance.now() - startTime).toFixed(2));
    const logPayload = {
      service: "monitoring",
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs
    };

    if (durationMs >= monitoringConfig.slowRequestThresholdMs) {
      logger.warn("Slow request", logPayload);
    } else {
      logger.info("Request completed", logPayload);
    }
  });

  next();
}
