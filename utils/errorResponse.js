import { getRequestId } from "./requestContext.js";

export function formatErrorBody(err) {
  return {
    success: false,
    code: (err && err.code) || "INTERNAL_ERROR",
    message: (err && err.message) || "Internal server error",
    requestId: getRequestId() || null
  };
}

export function sendLegacyError(res, err) {
  const status = (err && err.status) || 500;
  return res.status(status).json(formatErrorBody(err));
}

export default {
  formatErrorBody,
  sendLegacyError
};
