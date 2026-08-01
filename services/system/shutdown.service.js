import logger from "../../utils/logger.js";
import { shutdownConfig } from "../../config/shutdown.js";
import * as metricsService from "../monitoring/metrics.service.js";

let isShuttingDown = false;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logShutdownStart(reason) {
  const applicationMetrics = metricsService.getApplicationMetrics();

  logger.info("Shutdown initiated", {
    service: "shutdown",
    reason,
    uptime: process.uptime(),
    activeRequests: applicationMetrics.activeRequests,
    requestCount: applicationMetrics.requestCount,
    errorCount: applicationMetrics.errorCount,
    memory: process.memoryUsage()
  });
}

async function drainActiveRequests(timeoutMs) {
  const start = Date.now();

  while (metricsService.getApplicationMetrics().activeRequests > 0) {
    if (Date.now() - start >= timeoutMs) {
      logger.warn("Drain timeout reached with active requests still in flight", {
        service: "shutdown",
        activeRequests: metricsService.getApplicationMetrics().activeRequests
      });
      return;
    }

    await wait(100);
  }
}

function closeServer(server) {
  return new Promise((resolve) => {
    if (!server || typeof server.close !== "function") {
      resolve();
      return;
    }

    server.close((err) => {
      if (err) {
        logger.error("Error closing HTTP server", { service: "shutdown", error: err });
      } else {
        logger.info("HTTP server closed", { service: "shutdown" });
      }

      resolve();
    });
  });
}

async function runShutdown(server, reason, exitCode) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logShutdownStart(reason);

  const forceExitTimer = setTimeout(() => {
    logger.error("Force exit: shutdown exceeded forceExitTimeoutMs", { service: "shutdown", reason });
    process.exit(exitCode ?? 1);
  }, shutdownConfig.forceExitTimeoutMs);
  forceExitTimer.unref?.();

  const serverClosed = closeServer(server);

  await drainActiveRequests(shutdownConfig.drainTimeoutMs);
  await Promise.race([serverClosed, wait(shutdownConfig.shutdownTimeoutMs)]);

  metricsService.stopEventLoopMonitor();
  clearTimeout(forceExitTimer);

  logger.info("Shutdown complete", { service: "shutdown", reason });

  process.exit(exitCode ?? 0);
}

export function registerShutdown(server) {
  if (!shutdownConfig.enabled) {
    process.on("SIGINT", () => process.exit(0));
    process.on("SIGTERM", () => process.exit(0));
    return;
  }

  process.on("SIGINT", () => runShutdown(server, "SIGINT", 0));
  process.on("SIGTERM", () => runShutdown(server, "SIGTERM", 0));

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", { service: "shutdown", error });
    runShutdown(server, "uncaughtException", 1);
  });

  process.on("unhandledRejection", (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error("Unhandled rejection", { service: "shutdown", error });
    runShutdown(server, "unhandledRejection", 1);
  });
}

export default {
  registerShutdown
};
