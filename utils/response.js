export function sendSuccess(res, { status = 200, message = "", data = null } = {}) {
  return res.status(status).json({ success: true, message, data });
}

export function sendError(
  res,
  { status = 500, code = "INTERNAL_ERROR", message = "", requestId = null, details = null } = {}
) {
  return res.status(status).json({ success: false, code, message, requestId, details });
}
