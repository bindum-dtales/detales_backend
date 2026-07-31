import { describe, test, expect } from "@jest/globals";
import AppError from "../../utils/AppError.js";
import { formatErrorBody, sendLegacyError } from "../../utils/errorResponse.js";
import { createMockRes } from "../setup/mockExpress.js";
import requestId from "../../middleware/requestId.js";

describe("errorResponse", () => {
  test("formatErrorBody uses AppError status/code/message", () => {
    const err = new AppError("Not found", { status: 404, code: "NOT_FOUND" });
    const body = formatErrorBody(err);

    expect(body).toEqual({ success: false, code: "NOT_FOUND", message: "Not found", requestId: null });
  });

  test("formatErrorBody falls back to INTERNAL_ERROR for generic errors", () => {
    const body = formatErrorBody(new Error("boom"));

    expect(body.success).toBe(false);
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(body.message).toBe("boom");
  });

  test("sendLegacyError writes the correct status and standardized body", () => {
    const res = createMockRes();

    sendLegacyError(res, new AppError("Bad input", { status: 400, code: "VALIDATION_ERROR" }));

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, code: "VALIDATION_ERROR", message: "Bad input" })
    );
  });

  test("sendLegacyError defaults to 500 for generic errors", () => {
    const res = createMockRes();

    sendLegacyError(res, new Error("unexpected"));

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("requestId is picked up automatically inside a request context", async () => {
    const req = { headers: {} };
    const res = createMockRes();

    await new Promise((resolve) => {
      requestId(req, res, () => {
        const body = formatErrorBody(new AppError("x", { status: 400, code: "X" }));
        expect(body.requestId).toBe(req.requestId);
        expect(typeof body.requestId).toBe("string");
        resolve();
      });
    });
  });
});
