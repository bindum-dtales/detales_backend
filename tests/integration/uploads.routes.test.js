import { describe, test, expect, jest, beforeAll } from "@jest/globals";
import request from "supertest";
import express from "express";
import { createMockSupabaseClient } from "../setup/mockSupabase.js";
import { makeTestToken } from "../setup/authToken.js";
import errorHandler from "../../middleware/errorHandler.js";

let app;
let mockClient;

beforeAll(async () => {
  mockClient = createMockSupabaseClient({
    storageResult: {
      upload: { data: { path: "images/mock.png" }, error: null },
      publicUrl: { data: { publicUrl: "https://mock.local/storage/images/mock.png" } }
    }
  });

  jest.unstable_mockModule("../../config/supabase.js", () => ({
    getSupabaseClient: jest.fn(() => mockClient)
  }));

  const { default: uploadRoutes } = await import("../../routes/uploads.js");

  app = express();
  app.use(express.json());
  app.use("/api/uploads", uploadRoutes);
  app.use(errorHandler);
});

describe("POST /api/uploads/image", () => {
  test("uploads through the mocked Supabase storage client, never touching real Storage", async () => {
    const res = await request(app)
      .post("/api/uploads/image")
      .set("Authorization", `Bearer ${makeTestToken()}`)
      .attach("image", Buffer.from("fake-image-bytes"), { filename: "test.png", contentType: "image/png" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe("https://mock.local/storage/images/mock.png");
    expect(mockClient.storage.from.mock.calls.length).toBeGreaterThan(0);
  });

  test("returns 400 with the standardized error body when no file is provided", async () => {
    const res = await request(app).post("/api/uploads/image").set("Authorization", `Bearer ${makeTestToken()}`);

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, code: "VALIDATION_ERROR", message: "No image file provided" })
    );
  });

  test("returns 401 with the standardized error body when no Authorization header is sent", async () => {
    const res = await request(app)
      .post("/api/uploads/image")
      .attach("image", Buffer.from("fake-image-bytes"), { filename: "test.png", contentType: "image/png" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, code: "UNAUTHORIZED", message: "Missing token" })
    );
  });
});
