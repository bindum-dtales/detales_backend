import { describe, test, expect, beforeAll } from "@jest/globals";
import request from "supertest";
import express from "express";

let app;

beforeAll(async () => {
  const { default: metricsRoutes } = await import("../../routes/metrics.js");

  app = express();
  app.use(metricsRoutes);
});

describe("GET /metrics", () => {
  test("returns 200 with server, memory, cpu, eventLoop, application, cache, environment", async () => {
    const res = await request(app).get("/metrics");

    expect(res.status).toBe(200);

    expect(res.body.server).toEqual(
      expect.objectContaining({
        uptime: expect.any(Number),
        pid: expect.any(Number),
        nodeVersion: expect.any(String),
        platform: expect.any(String),
        arch: expect.any(String)
      })
    );

    expect(res.body.memory).toEqual(
      expect.objectContaining({
        rss: expect.any(Number),
        heapTotal: expect.any(Number),
        heapUsed: expect.any(Number),
        external: expect.any(Number)
      })
    );

    expect(res.body.cpu).toEqual(
      expect.objectContaining({
        loadAverage: expect.any(Array),
        cpuCount: expect.any(Number)
      })
    );

    expect(res.body.eventLoop).toHaveProperty("lag");

    expect(res.body.application).toEqual(
      expect.objectContaining({
        requestCount: expect.any(Number),
        errorCount: expect.any(Number),
        activeRequests: expect.any(Number)
      })
    );

    expect(res.body.cache).toEqual(
      expect.objectContaining({
        blogs: expect.any(Number),
        caseStudies: expect.any(Number),
        portfolio: expect.any(Number)
      })
    );

    expect(res.body.environment).toEqual(
      expect.objectContaining({ NODE_ENV: expect.any(String) })
    );
  });
});
