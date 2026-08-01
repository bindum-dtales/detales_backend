export const shutdownConfig = {
  enabled: process.env.GRACEFUL_SHUTDOWN_ENABLED !== "false",
  shutdownTimeoutMs: Number(process.env.SHUTDOWN_TIMEOUT_MS) || 10000,
  drainTimeoutMs: Number(process.env.DRAIN_TIMEOUT_MS) || 8000,
  forceExitTimeoutMs: Number(process.env.FORCE_EXIT_TIMEOUT_MS) || 15000
};

export default shutdownConfig;
