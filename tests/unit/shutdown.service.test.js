import { describe, test, expect, jest, beforeEach, afterEach } from "@jest/globals";

async function loadFreshShutdownService() {
  jest.resetModules();
  const shutdownModule = await import("../../services/system/shutdown.service.js");
  const metricsModule = await import("../../services/monitoring/metrics.service.js");
  return { registerShutdown: shutdownModule.registerShutdown, metricsService: metricsModule };
}

function createMockServer() {
  let closeCallback;
  return {
    close: jest.fn((cb) => {
      closeCallback = cb;
    }),
    triggerClose: () => closeCallback?.()
  };
}

describe("shutdown.service", () => {
  let exitSpy;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    process.removeAllListeners("SIGINT");
    process.removeAllListeners("SIGTERM");
    process.removeAllListeners("uncaughtException");
    process.removeAllListeners("unhandledRejection");
  });

  test("closes the server and exits 0 on SIGINT", async () => {
    const { registerShutdown, metricsService } = await loadFreshShutdownService();
    const server = createMockServer();

    registerShutdown(server);
    process.emit("SIGINT");

    await new Promise((resolve) => setTimeout(resolve, 10));
    server.triggerClose();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(server.close).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(metricsService.getApplicationMetrics().activeRequests).toBe(0);
  });

  test("ignores duplicate shutdown signals", async () => {
    const { registerShutdown } = await loadFreshShutdownService();
    const server = createMockServer();

    registerShutdown(server);
    process.emit("SIGTERM");
    process.emit("SIGTERM");
    process.emit("SIGINT");

    await new Promise((resolve) => setTimeout(resolve, 10));
    server.triggerClose();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(server.close).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledTimes(1);
  });

  test("exits 1 on uncaughtException", async () => {
    const { registerShutdown } = await loadFreshShutdownService();
    const server = createMockServer();

    registerShutdown(server);
    process.emit("uncaughtException", new Error("boom"));

    await new Promise((resolve) => setTimeout(resolve, 10));
    server.triggerClose();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test("waits for active requests to drain before exiting", async () => {
    const { registerShutdown, metricsService } = await loadFreshShutdownService();
    const server = createMockServer();

    metricsService.incrementActiveRequests();
    registerShutdown(server);
    process.emit("SIGINT");

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(exitSpy).not.toHaveBeenCalled();

    metricsService.decrementActiveRequests();
    server.triggerClose();

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
