import { describe, test, expect, jest, beforeAll } from "@jest/globals";
import request from "supertest";
import express from "express";
import { createMockSupabaseClient } from "../setup/mockSupabase.js";
import { makeTestToken } from "../setup/authToken.js";
import { blogRow } from "../fixtures/blogs.fixtures.js";
import errorHandler from "../../middleware/errorHandler.js";

let app;

beforeAll(async () => {
  jest.unstable_mockModule("../../config/supabase.js", () => ({
    getSupabaseClient: jest.fn(() => createMockSupabaseClient())
  }));

  jest.unstable_mockModule("fs/promises", () => ({
    default: {
      readFile: jest.fn(async () => JSON.stringify([blogRow])),
      writeFile: jest.fn(async () => undefined),
      mkdir: jest.fn(async () => undefined),
      unlink: jest.fn(async () => undefined)
    }
  }));

  const { default: blogRoutes } = await import("../../routes/blogs.js");

  app = express();
  app.use(express.json());
  app.use("/api/blogs", blogRoutes);
  app.use(errorHandler);
});

describe("GET /api/blogs", () => {
  test("returns the cached blog list wrapped in the standardized success envelope", async () => {
    const res = await request(app).get("/api/blogs");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].id).toBe(blogRow.id);
  });
});

describe("GET /api/blogs/:id", () => {
  test("returns 404 with the standardized error body for an unknown id", async () => {
    const res = await request(app).get("/api/blogs/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        code: "NOT_FOUND",
        message: "Blog not found",
        requestId: null,
        details: null
      })
    );
  });
});

describe("POST /api/blogs", () => {
  test("returns 401 with the standardized error body when no Authorization header is sent", async () => {
    const res = await request(app).post("/api/blogs").send({ title: "hi", content: "<p>hi</p>" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, code: "UNAUTHORIZED", message: "Missing token" })
    );
  });

  test("returns 400 with the standardized error body when title is missing", async () => {
    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${makeTestToken()}`)
      .send({ content: "<p>hi</p>" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, code: "VALIDATION_ERROR", message: "Title is required" })
    );
  });
});
