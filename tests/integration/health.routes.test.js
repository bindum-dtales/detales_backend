import { describe, test, expect, jest, beforeAll } from "@jest/globals";
import request from "supertest";
import express from "express";
import { createMockSupabaseClient } from "../setup/mockSupabase.js";

let app;

beforeAll(async () => {
  jest.unstable_mockModule("../../config/supabase.js", () => ({
    getSupabaseClient: jest.fn(() => createMockSupabaseClient())
  }));

  const { default: healthRoutes } = await import("../../routes/health.js");

  app = express();
  app.use(healthRoutes);
});

describe("GET /health", () => {
  test("returns 200 with status, uptime, and timestamp", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(typeof res.body.uptime).toBe("number");
    expect(typeof res.body.timestamp).toBe("string");
  });
});

describe("GET /ready", () => {
  test("returns 200 ready:true against the mocked Supabase client", async () => {
    const res = await request(app).get("/ready");

    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
    expect(res.body.checks.supabase.configured).toBe(true);
  });
});

describe("GET /version", () => {
  test("returns version, node, and environment", async () => {
    const res = await request(app).get("/version");

    expect(res.status).toBe(200);
    expect(res.body.version).toBe("1.0.0");
    expect(res.body.node).toBe(process.version);
    expect(res.body.environment).toBe("test");
  });
});
