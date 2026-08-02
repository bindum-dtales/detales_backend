import { describe, test, expect } from "@jest/globals";
import { createMockReq, createMockRes, createMockNext } from "../setup/mockExpress.js";
import { makeTestToken } from "../setup/authToken.js";
import requireAuth from "../../middleware/auth.js";

describe("requireAuth middleware", () => {
  test("rejects requests with no Authorization header", () => {
    const req = createMockReq();
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Missing token");
  });

  test("rejects a non-Bearer Authorization header", () => {
    const req = createMockReq({ headers: { authorization: "Basic abc123" } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Missing token");
  });

  test("rejects malformed (non-JWT) tokens", () => {
    const req = createMockReq({ headers: { authorization: "Bearer not-a-jwt" } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Invalid token");
  });

  test("rejects tokens signed with the wrong secret", () => {
    const token = makeTestToken({}, { expiresIn: "1h" });
    const req = createMockReq({ headers: { authorization: `Bearer ${token}0` } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Invalid token");
  });

  test("rejects expired tokens", () => {
    const token = makeTestToken({ exp: Math.floor(Date.now() / 1000) - 60 });
    const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Expired token");
  });

  test("attaches decoded payload to req.user and calls next() with no error for a valid token", () => {
    const token = makeTestToken();
    const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);

    expect(req.user).toMatchObject({ role: "admin" });
    expect(next).toHaveBeenCalledWith();
  });
});
