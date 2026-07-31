import { describe, test, expect, jest, beforeAll } from "@jest/globals";
import request from "supertest";
import express from "express";
import { createMockSupabaseClient } from "../setup/mockSupabase.js";

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
});

describe("POST /api/uploads/image", () => {
  test("uploads through the mocked Supabase storage client, never touching real Storage", async () => {
    const res = await request(app)
      .post("/api/uploads/image")
      .attach("image", Buffer.from("fake-image-bytes"), { filename: "test.png", contentType: "image/png" });

    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://mock.local/storage/images/mock.png");
    expect(mockClient.storage.from.mock.calls.length).toBeGreaterThan(0);
  });

  test("returns 400 when no file is provided", async () => {
    const res = await request(app).post("/api/uploads/image");

    expect(res.status).toBe(400);
  });
});
