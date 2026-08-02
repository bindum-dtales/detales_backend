import AppError from "../utils/AppError.js";
import httpStatus from "../constants/httpStatus.js";
import errorCodes from "../constants/errorCodes.js";
import services from "../constants/services.js";

export function validateLogin(req, res, next) {
  const { username, password } = req.body || {};

  if (!username || typeof username !== "string") {
    return next(
      new AppError("Username is required", {
        status: httpStatus.BAD_REQUEST,
        service: services.AUTH,
        code: errorCodes.VALIDATION_ERROR
      })
    );
  }

  if (!password || typeof password !== "string") {
    return next(
      new AppError("Password is required", {
        status: httpStatus.BAD_REQUEST,
        service: services.AUTH,
        code: errorCodes.VALIDATION_ERROR
      })
    );
  }

  next();
}

export default { validateLogin };
