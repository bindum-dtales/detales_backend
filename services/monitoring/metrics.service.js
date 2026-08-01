import os from "os";
import { monitorEventLoopDelay } from "perf_hooks";
import { monitoringConfig } from "../../config/monitoring.js";
import logger from "../../utils/logger.js";
import { loadBlogs } from "../blogs/blogs.cache.js";
import { loadCaseStudies } from "../caseStudies/caseStudies.cache.js";
import { loadPortfolio } from "../portfolio/portfolio.cache.js";

const state = {
  requestCount: 0,
  errorCount: 0,
  activeRequests: 0
};

const eventLoopHistogram = monitoringConfig.enabled
  ? monitorEventLoopDelay({ resolution: monitoringConfig.sampleIntervalMs })
  : null;

eventLoopHistogram?.enable();

export function incrementRequestCount() {
  state.requestCount += 1;
}

export function incrementErrorCount() {
  state.errorCount += 1;
}

export function incrementActiveRequests() {
  state.activeRequests += 1;
}

export function decrementActiveRequests() {
  state.activeRequests = Math.max(0, state.activeRequests - 1);
}

export function getApplicationMetrics() {
  return { ...state };
}

function getEventLoopLagMs() {
  if (!eventLoopHistogram || Number.isNaN(eventLoopHistogram.mean)) {
    return null;
  }

  return Number((eventLoopHistogram.mean / 1e6).toFixed(3));
}

async function getCacheSize(loadFn, label) {
  try {
    const data = await loadFn();
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    logger.error("Cache size lookup failed", { service: "monitoring", operation: label, error });
    return 0;
  }
}

export async function collectMetrics() {
  const memoryUsage = process.memoryUsage();

  const [blogsSize, caseStudiesSize, portfolioSize] = await Promise.all([
    getCacheSize(loadBlogs, "blogs"),
    getCacheSize(loadCaseStudies, "caseStudies"),
    getCacheSize(loadPortfolio, "portfolio")
  ]);

  return {
    server: {
      uptime: process.uptime(),
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external
    },
    cpu: {
      loadAverage: os.loadavg(),
      cpuCount: os.cpus().length
    },
    eventLoop: {
      lag: getEventLoopLagMs()
    },
    application: getApplicationMetrics(),
    cache: {
      blogs: blogsSize,
      caseStudies: caseStudiesSize,
      portfolio: portfolioSize
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || "development"
    }
  };
}

export default {
  incrementRequestCount,
  incrementErrorCount,
  incrementActiveRequests,
  decrementActiveRequests,
  getApplicationMetrics,
  collectMetrics
};
