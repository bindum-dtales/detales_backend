import { describe, test, expect } from "@jest/globals";
import metricsTracker from "../../middleware/metricsTracker.js";
import * as metricsService from "../../services/monitoring/metrics.service.js";
import { createMockReq, createMockRes, createMockNext } from "../setup/mockExpress.js";

function triggerFinish(res) {
  const finishCall = res.on.mock.calls.find(([event]) => event === "finish");
  finishCall?.[1]();
}

describe("metricsTracker middleware", () => {
  test("calls next synchronously", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    metricsTracker(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("increments requestCount and activeRequests on start, decrements activeRequests on finish", () => {
    const before = metricsService.getApplicationMetrics();

    const req = createMockReq({ method: "GET", originalUrl: "/api/portfolio" });
    const res = createMockRes();
    res.statusCode = 200;
    const next = createMockNext();

    metricsTracker(req, res, next);

    const duringMetrics = metricsService.getApplicationMetrics();
    expect(duringMetrics.requestCount).toBe(before.requestCount + 1);
    expect(duringMetrics.activeRequests).toBe(before.activeRequests + 1);

    triggerFinish(res);

    const afterMetrics = metricsService.getApplicationMetrics();
    expect(afterMetrics.activeRequests).toBe(before.activeRequests);
  });

  test("increments errorCount only when status >= 500", () => {
    const before = metricsService.getApplicationMetrics();

    const req = createMockReq({ method: "GET", originalUrl: "/api/blogs" });
    const res = createMockRes();
    res.statusCode = 404;
    const next = createMockNext();

    metricsTracker(req, res, next);
    triggerFinish(res);

    expect(metricsService.getApplicationMetrics().errorCount).toBe(before.errorCount);

    const req2 = createMockReq({ method: "GET", originalUrl: "/api/blogs" });
    const res2 = createMockRes();
    res2.statusCode = 500;
    const next2 = createMockNext();

    metricsTracker(req2, res2, next2);
    triggerFinish(res2);

    expect(metricsService.getApplicationMetrics().errorCount).toBe(before.errorCount + 1);
  });
});
