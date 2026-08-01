export const monitoringConfig = {
  enabled: process.env.METRICS_ENABLED !== "false",
  sampleIntervalMs: Number(process.env.METRICS_SAMPLE_INTERVAL_MS) || 20,
  slowRequestThresholdMs: Number(process.env.SLOW_REQUEST_THRESHOLD_MS) || 1000
};

export default monitoringConfig;
