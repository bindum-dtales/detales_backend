import { describe, test, expect, beforeAll } from "@jest/globals";
import request from "supertest";
import express from "express";
import errorHandler from "../../middleware/errorHandler.js";

let app;

beforeAll(async () => {
  const { default: authRoutes } = await import("../../routes/auth.js");

  app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use(errorHandler);
});

describe("POST /api/auth/login", () => {
  test("returns a token in the standardized success envelope for valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "test-admin", password: "test-password" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: true,
        message: "Login successful.",
        data: { token: expect.any(String), expiresIn: 86400 }
      })
    );
  });

  test("returns 401 with INVALID_CREDENTIALS for a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "test-admin", password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid username or password."
      })
    );
  });

  test("returns 400 with VALIDATION_ERROR when username is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ password: "test-password" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, code: "VALIDATION_ERROR", message: "Username is required" })
    );
  });

  test("returns 400 with VALIDATION_ERROR when password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "test-admin" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, code: "VALIDATION_ERROR", message: "Password is required" })
    );
  });
});
