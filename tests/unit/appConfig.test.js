import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";

const ENV_KEYS = [
  "SUPABASE_TIMEOUT_MS",
  "SUPABASE_RETRIES",
  "SUPABASE_RETRY_DELAY_MS",
  "EXCERPT_MAX_LENGTH",
  "CACHE_REFRESH_INTERVAL_MS",
  "REQUEST_TIMEOUT_MS"
];

let originalEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
});

describe("config/appConfig", () => {
  test("uses documented defaults when no env overrides are set", async () => {
    jest.resetModules();
    const { supabaseConfig, contentConfig, cacheConfig, serverConfig } = await import("../../config/appConfig.js");

    expect(supabaseConfig).toEqual({ timeoutMs: 5000, retries: 3, retryDelayMs: 1000 });
    expect(contentConfig).toEqual({ excerptMaxLength: 200 });
    expect(cacheConfig.refreshIntervalMs).toBe(300000);
    expect(serverConfig.requestTimeoutMs).toBe(10000);
  });

  test("respects env var overrides", async () => {
    process.env.SUPABASE_RETRIES = "7";
    process.env.EXCERPT_MAX_LENGTH = "42";

    jest.resetModules();
    const { supabaseConfig, contentConfig } = await import("../../config/appConfig.js");

    expect(supabaseConfig.retries).toBe(7);
    expect(contentConfig.excerptMaxLength).toBe(42);
  });
});
