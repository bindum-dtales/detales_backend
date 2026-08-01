import { getSupabaseClient } from "../config/supabase.js";
import AppError from "../utils/AppError.js";
import errorCodes from "../constants/errorCodes.js";
import httpStatus from "../constants/httpStatus.js";
import logger from "../utils/logger.js";
import asyncHandler from "./asyncHandler.js";

const SERVICE = "auth";

function extractBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function decodeJwtPayload(token) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

const requireAuth = asyncHandler(async (req, res, next) => {
  const operation = req.originalUrl;
  const token = extractBearerToken(req);

  if (!token) {
    logger.warn("Rejected request with missing token", { service: SERVICE, operation });
    throw new AppError("Missing token", {
      status: httpStatus.UNAUTHORIZED,
      service: SERVICE,
      code: errorCodes.UNAUTHORIZED
    });
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    logger.warn("Rejected request with malformed token", { service: SERVICE, operation });
    throw new AppError("Invalid token", {
      status: httpStatus.UNAUTHORIZED,
      service: SERVICE,
      code: errorCodes.UNAUTHORIZED
    });
  }

  if (typeof payload.exp === "number" && Date.now() >= payload.exp * 1000) {
    logger.warn("Rejected request with expired token", { service: SERVICE, operation });
    throw new AppError("Expired token", {
      status: httpStatus.FORBIDDEN,
      service: SERVICE,
      code: errorCodes.FORBIDDEN
    });
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    logger.error("Supabase client unavailable during auth check", { service: SERVICE, operation });
    throw new AppError("Authentication service unavailable", {
      status: httpStatus.SERVICE_UNAVAILABLE,
      service: SERVICE,
      code: errorCodes.SERVICE_UNAVAILABLE
    });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    logger.warn("Rejected token not recognized by Supabase", {
      service: SERVICE,
      operation,
      errorMessage: error?.message
    });
    throw new AppError("Invalid token", {
      status: httpStatus.UNAUTHORIZED,
      service: SERVICE,
      code: errorCodes.UNAUTHORIZED
    });
  }

  req.user = data.user;

  logger.info("Authenticated request", { service: SERVICE, operation, userId: data.user.id });

  next();
});

export default requireAuth;
