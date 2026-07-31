export function sendSuccess(res, { status = 200, message = "", data = {} } = {}) {
  return res.status(status).json({ success: true, message, data });
}

export function sendError(res, { status = 500, code = "INTERNAL_ERROR", message = "", requestId = null } = {}) {
  return res.status(status).json({ success: false, code, message, requestId });
}
