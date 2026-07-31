import { describe, test, expect } from "@jest/globals";
import AppError from "../../utils/AppError.js";

describe("AppError", () => {
  test("applies documented defaults", () => {
    const err = new AppError("Something broke");

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("AppError");
    expect(err.status).toBe(500);
    expect(err.service).toBe("unknown");
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.message).toBe("Something broke");
  });

  test("accepts overrides", () => {
    const err = new AppError("Not found", {
      status: 404,
      service: "blogs",
      code: "NOT_FOUND",
      details: { id: 1 }
    });

    expect(err.status).toBe(404);
    expect(err.service).toBe("blogs");
    expect(err.code).toBe("NOT_FOUND");
    expect(err.details).toEqual({ id: 1 });
  });
});
