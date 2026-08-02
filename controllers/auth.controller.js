import asyncHandler from "../middleware/asyncHandler.js";
import * as authService from "../services/auth/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const login = asyncHandler(async (req, res) => {
  const { token, expiresIn } = await authService.login(req.body);
  return sendSuccess(res, { status: 200, message: "Login successful.", data: { token, expiresIn } });
});

export default { login };
