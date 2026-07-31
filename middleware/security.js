import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { trustProxy, bodyLimit, rateLimitConfig, helmetOptions } from "../config/security.js";

export function configureTrustProxy(app) {
  app.set("trust proxy", trustProxy);
}

export function disablePoweredBy(app) {
  app.disable("x-powered-by");
}

export const helmetMiddleware = helmet(helmetOptions);
export const compressionMiddleware = compression();

export function createRateLimiter(overrides = {}) {
  return rateLimit({ ...rateLimitConfig, ...overrides });
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
  configureTrustProxy,
  disablePoweredBy,
  helmetMiddleware,
  compressionMiddleware,
  bodyLimit
};
