import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import {
  trustProxy,
  bodyLimit,
  rateLimitConfig,
  publicApiRateLimitConfig,
  uploadRateLimitConfig,
  adminCrudRateLimitConfig,
  authRateLimitConfig,
  helmetOptions
} from "../config/security.js";

export function configureTrustProxy(app) {
  app.set("trust proxy", trustProxy);
}

export function disablePoweredBy(app) {
  app.disable("x-powered-by");
}

export const helmetMiddleware = helmet(helmetOptions);
export const compressionMiddleware = compression();

// Reusable factory: any bucket below is just createRateLimiter(config).
export function createRateLimiter(config = rateLimitConfig) {
  return rateLimit(config);
}

// Isolated buckets so uploads, admin writes, public reads and login never
// share a counter. Built once at module load, same as the old single limiter.
const defaultApiLimiter = createRateLimiter(rateLimitConfig);
const publicApiLimiter = createRateLimiter(publicApiRateLimitConfig);
const uploadLimiter = createRateLimiter(uploadRateLimitConfig);
const adminCrudLimiter = createRateLimiter(adminCrudRateLimitConfig);
const authLimiter = createRateLimiter(authRateLimitConfig);

const HEALTH_PATHS = new Set(["/health", "/ready", "/version"]);
const CONTENT_PATH_PREFIXES = ["/blogs", "/case-studies", "/portfolio"];

function isHealthPath(path) {
  return HEALTH_PATHS.has(path);
}

function isAuthPath(path) {
  return path.startsWith("/auth");
}

function isUploadPath(path) {
  return path.startsWith("/uploads");
}

function isContentPath(path) {
  return CONTENT_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

// Single mount point: app.use("/api", apiRateLimiter). Dispatches each
// request to its bucket by route family + method; falls through to the
// generic default bucket for anything uncategorized (e.g. /api/docs).
export function apiRateLimiter(req, res, next) {
  const { path, method } = req;

  if (isHealthPath(path)) {
    return next();
  }

  if (isAuthPath(path)) {
    return authLimiter(req, res, next);
  }

  if (isUploadPath(path)) {
    return uploadLimiter(req, res, next);
  }

  if (isContentPath(path)) {
    return method === "GET" ? publicApiLimiter(req, res, next) : adminCrudLimiter(req, res, next);
  }

  return defaultApiLimiter(req, res, next);
}

export function applySecurityMiddleware(app) {
  configureTrustProxy(app);
  disablePoweredBy(app);
  app.use(helmetMiddleware);
  app.use(compressionMiddleware);
}

export { bodyLimit };

export default {
  applySecurityMiddleware,
  createRateLimiter,
  apiRateLimiter,
  configureTrustProxy,
  disablePoweredBy,
  helmetMiddleware,
  compressionMiddleware,
  bodyLimit
};
