import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import errorCodes from "../constants/errorCodes.js";
import httpStatus from "../constants/httpStatus.js";
import logger from "../utils/logger.js";
import env from "../config/env.js";

const SERVICE = "auth";

function extractBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function requireAuth(req, res, next) {
  const operation = req.originalUrl;
  const token = extractBearerToken(req);

  if (!token) {
    logger.warn("Rejected request with missing token", { service: SERVICE, operation });
    return next(
      new AppError("Missing token", {
        status: httpStatus.UNAUTHORIZED,
        service: SERVICE,
        code: errorCodes.UNAUTHORIZED
      })
    );
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    logger.info("Authenticated request", { service: SERVICE, operation, role: req.user.role });
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn("Rejected request with expired token", { service: SERVICE, operation });
      return next(
        new AppError("Expired token", {
          status: httpStatus.FORBIDDEN,
          service: SERVICE,
          code: errorCodes.FORBIDDEN
        })
      );
    }

    logger.warn("Rejected request with invalid token", {
      service: SERVICE,
      operation,
      errorMessage: error.message
    });
    return next(
      new AppError("Invalid token", {
        status: httpStatus.UNAUTHORIZED,
        service: SERVICE,
        code: errorCodes.UNAUTHORIZED
      })
    );
  }
}

export default requireAuth;
