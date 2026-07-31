import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as uploadsService from "../services/uploads/uploads.service.js";
import { sendLegacyError } from "../utils/errorResponse.js";

export const uploadImage = asyncHandler(async (req, res) => {
  try {
    const data = await uploadsService.uploadImage(req.file);
    return res.status(200).json(data);
  } catch (err) {
    if (!(err instanceof AppError)) {
      logger.error("Upload route error", { service: services.UPLOADS, operation: "uploadImage", error: err });
    }
    return sendLegacyError(res, err);
  }
});

export const uploadDocx = asyncHandler(async (req, res) => {
  try {
    const data = await uploadsService.uploadDocx(req.file);
    return res.status(200).json(data);
  } catch (err) {
    if (!(err instanceof AppError)) {
      logger.error("Upload route error", { service: services.UPLOADS, operation: "uploadDocx", error: err });
    }
    return sendLegacyError(res, err);
  }
});

export default {
  uploadImage,
  uploadDocx
};
