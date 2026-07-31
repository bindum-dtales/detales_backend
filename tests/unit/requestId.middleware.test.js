import { describe, test, expect } from "@jest/globals";
import requestId from "../../middleware/requestId.js";
import { createMockReq, createMockRes, createMockNext } from "../setup/mockExpress.js";

describe("requestId middleware", () => {
  test("attaches req.requestId and mirrors it on the X-Request-ID header", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    requestId(req, res, next);

    expect(typeof req.requestId).toBe("string");
    expect(req.requestId.length).toBeGreaterThan(0);
    expect(res.headers["X-Request-ID"]).toBe(req.requestId);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("generates a unique id per invocation", () => {
    const req1 = createMockReq();
    const req2 = createMockReq();

    requestId(req1, createMockRes(), createMockNext());
    requestId(req2, createMockRes(), createMockNext());

    expect(req1.requestId).not.toBe(req2.requestId);
  });
});
