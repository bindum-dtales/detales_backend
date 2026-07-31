import { isProduction } from "../config/env.js";

function write(level, entry) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), level, ...entry });

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else if (level === "debug") {
    console.debug(line);
  } else {
    console.log(line);
  }
}

const logger = {
  info(message, meta = {}) {
    write("info", { message, ...meta });
  },

  warn(message, meta = {}) {
    write("warn", { message, ...meta });
  },

  debug(message, meta = {}) {
    write("debug", { message, ...meta });
  },

  error(message, { service, operation, error, ...meta } = {}) {
    write("error", {
      message,
      service,
      operation,
      errorType: error?.name,
      errorMessage: error?.message,
      stack: isProduction ? undefined : error?.stack,
      ...meta
    });
  },

  request({ method, endpoint, service, durationMs, success }) {
    write(success ? "info" : "error", {
      message: "request",
      method,
      endpoint,
      service,
      durationMs,
      success
    });
  }
};

export default logger;
