import { describe, test, expect, jest, beforeAll } from "@jest/globals";
import { createMockReq, createMockRes, createMockNext } from "../setup/mockExpress.js";
import { makeTestToken } from "../setup/authToken.js";

let requireAuth;
let mockGetUser;

function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

beforeAll(async () => {
  mockGetUser = jest.fn(async () => ({
    data: { user: { id: "mock-user-id", email: "mock-user@dtales.tech" } },
    error: null
  }));

  jest.unstable_mockModule("../../config/supabase.js", () => ({
    getSupabaseClient: jest.fn(() => ({ auth: { getUser: mockGetUser } }))
  }));

  ({ default: requireAuth } = await import("../../middleware/auth.js"));
});

describe("requireAuth middleware", () => {
  test("rejects requests with no Authorization header", async () => {
    const req = createMockReq();
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);
    await flush();

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Missing token");
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  test("rejects a non-Bearer Authorization header", async () => {
    const req = createMockReq({ headers: { authorization: "Basic abc123" } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);
    await flush();

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Missing token");
  });

  test("rejects malformed (non-JWT) tokens", async () => {
    const req = createMockReq({ headers: { authorization: "Bearer not-a-jwt" } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);
    await flush();

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Invalid token");
  });

  test("rejects expired tokens without calling Supabase", async () => {
    const token = makeTestToken({ exp: Math.floor(Date.now() / 1000) - 60 });
    const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);
    await flush();

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(403);
    expect(err.message).toBe("Expired token");
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  test("rejects tokens Supabase reports as invalid", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: "invalid JWT" } });
    const token = makeTestToken();
    const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);
    await flush();

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Invalid token");
  });

  test("attaches req.user and calls next() with no error for a valid token", async () => {
    const token = makeTestToken();
    const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
    const next = createMockNext();

    requireAuth(req, createMockRes(), next);
    await flush();

    expect(req.user).toEqual({ id: "mock-user-id", email: "mock-user@dtales.tech" });
    expect(next).toHaveBeenCalledWith();
  });
});
