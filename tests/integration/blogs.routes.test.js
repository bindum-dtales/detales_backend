import { describe, test, expect, jest, beforeAll } from "@jest/globals";
import request from "supertest";
import express from "express";
import { createMockSupabaseClient } from "../setup/mockSupabase.js";
import { blogRow } from "../fixtures/blogs.fixtures.js";

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
});

describe("GET /api/blogs", () => {
  test("returns the cached blog list without touching real disk or Supabase", async () => {
    const res = await request(app).get("/api/blogs");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(blogRow.id);
  });
});

describe("GET /api/blogs/:id", () => {
  test("returns 404 with the standardized error body for an unknown id", async () => {
    const res = await request(app).get("/api/blogs/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, code: "NOT_FOUND", message: "Blog not found" })
    );
  });
});

describe("POST /api/blogs", () => {
  // NOTE: this request is rejected by the router-level validateCreateBlog middleware,
  // which predates and is independent of the centralized error formatter, so it still
  // replies with the legacy { error } shape rather than the standardized error body.
  test("returns 400 with the router-level validator's error shape when title is missing", async () => {
    const res = await request(app).post("/api/blogs").send({ content: "<p>hi</p>" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });
});
