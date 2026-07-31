export default class AppError extends Error {
  constructor(message, { status = 500, service = "unknown", code = "INTERNAL_ERROR", details } = {}) {
    super(message);

    this.name = "AppError";
    this.status = status;
    this.service = service;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace?.(this, AppError);
  }
}
