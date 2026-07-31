import AppError from "../utils/AppError.js";
import { sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const isAppError = err instanceof AppError;
  const status = isAppError ? err.status : 500;
  const service = isAppError ? err.service : "unknown";
  const code = isAppError ? err.code : "INTERNAL_ERROR";
  const message = err.message || "Internal server error";
  const requestId = req.requestId || null;

  logger.error(message, {
    service,
    operation: req.originalUrl,
    error: err
  });

  return sendError(res, {
    status,
    code,
    message,
    requestId
  });
}
