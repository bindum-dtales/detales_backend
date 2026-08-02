import { describe, test, expect } from "@jest/globals";
import jwt from "jsonwebtoken";
import * as authService from "../../services/auth/auth.service.js";
import env from "../../config/env.js";

describe("auth.service login", () => {
  test("returns a signed JWT and expiresIn for valid credentials", async () => {
    const result = await authService.login({ username: "test-admin", password: "test-password" });

    expect(result).toEqual({ token: expect.any(String), expiresIn: 86400 });

    const decoded = jwt.verify(result.token, env.JWT_SECRET);
    expect(decoded.role).toBe("admin");
  });

  test("rejects an unknown username", async () => {
    await expect(authService.login({ username: "nope", password: "test-password" })).rejects.toMatchObject({
      status: 401,
      code: "INVALID_CREDENTIALS"
    });
  });

  test("rejects a wrong password", async () => {
    await expect(authService.login({ username: "test-admin", password: "wrong" })).rejects.toMatchObject({
      status: 401,
      code: "INVALID_CREDENTIALS"
    });
  });
});
