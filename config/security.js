export const trustProxy = process.env.TRUST_PROXY !== undefined ? Number(process.env.TRUST_PROXY) : 1;

export const bodyLimit = process.env.BODY_LIMIT || "10mb";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;

// Fallback bucket for any /api route not covered by a dedicated bucket below
// (e.g. /api/docs). Kept so no future endpoint is accidentally unlimited.
export const rateLimitConfig = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || FIFTEEN_MIN_MS,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false
};

// Public reads: GET /api/blogs|case-studies|portfolio (+ /:id)
export const publicApiRateLimitConfig = {
  windowMs: Number(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS) || FIFTEEN_MIN_MS,
  max: Number(process.env.PUBLIC_RATE_LIMIT_MAX) || 1000,
  standardHeaders: true,
  legacyHeaders: false
};

// Admin uploads: /api/uploads/*
export const uploadRateLimitConfig = {
  windowMs: Number(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || FIFTEEN_MIN_MS,
  max: Number(process.env.UPLOAD_RATE_LIMIT_MAX) || 3000,
  standardHeaders: true,
  legacyHeaders: false
};

// Admin CRUD writes: POST/PUT/PATCH/DELETE on /api/blogs|case-studies|portfolio
export const adminCrudRateLimitConfig = {
  windowMs: Number(process.env.ADMIN_RATE_LIMIT_WINDOW_MS) || FIFTEEN_MIN_MS,
  max: Number(process.env.ADMIN_RATE_LIMIT_MAX) || 4000,
  standardHeaders: true,
  legacyHeaders: false
};

// Login: POST /api/auth/login
export const authRateLimitConfig = {
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || FIFTEEN_MIN_MS,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false
};

export const helmetOptions = {};

export default {
  trustProxy,
  bodyLimit,
  rateLimitConfig,
  publicApiRateLimitConfig,
  uploadRateLimitConfig,
  adminCrudRateLimitConfig,
  authRateLimitConfig,
  helmetOptions
};
