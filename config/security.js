export const trustProxy = process.env.TRUST_PROXY !== undefined ? Number(process.env.TRUST_PROXY) : 1;

export const bodyLimit = process.env.BODY_LIMIT || "10mb";

export const rateLimitConfig = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false
};

export const helmetOptions = {};

export default {
  trustProxy,
  bodyLimit,
  rateLimitConfig,
  helmetOptions
};
