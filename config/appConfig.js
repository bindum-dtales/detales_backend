export const supabaseConfig = {
  timeoutMs: Number(process.env.SUPABASE_TIMEOUT_MS) || 5000,
  retries: Number(process.env.SUPABASE_RETRIES) || 3,
  retryDelayMs: Number(process.env.SUPABASE_RETRY_DELAY_MS) || 1000
};

export const cacheConfig = {
  dir: process.env.CACHE_DIR || "cache",
  refreshIntervalMs: Number(process.env.CACHE_REFRESH_INTERVAL_MS) || 300000,
  files: {
    portfolio: "portfolio.json",
    blogs: "blogs.json",
    caseStudies: "case_studies.json"
  }
};

export const contentConfig = {
  excerptMaxLength: Number(process.env.EXCERPT_MAX_LENGTH) || 200
};

export const serverConfig = {
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS) || 10000,
  mediaProxyTimeoutMs: Number(process.env.MEDIA_PROXY_TIMEOUT_MS) || 15000,
  heapWarningThresholdBytes: Number(process.env.HEAP_WARNING_THRESHOLD_BYTES) || 1024 * 1024 * 1024,
  heapCheckIntervalMs: Number(process.env.HEAP_CHECK_INTERVAL_MS) || 60 * 1000
};

export default {
  supabaseConfig,
  cacheConfig,
  contentConfig,
  serverConfig
};
