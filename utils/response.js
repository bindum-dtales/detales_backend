export function sendSuccess(res, { status = 200, message = "", data = {} } = {}) {
  return res.status(status).json({ success: true, message, data });
}

export function sendError(res, { status = 500, message = "", service = "", code = "", details = "" } = {}) {
  return res.status(status).json({ success: false, message, service, code, details });
}
