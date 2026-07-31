import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as uploadsService from "../services/uploads/uploads.service.js";

function sendLegacyError(res, err) {
  const body = { error: err.message };

  if (err.details !== undefined) {
    body.details = err.details;
  }

  return res.status(err.status || 500).json(body);
}

export const uploadImage = asyncHandler(async (req, res) => {
  try {
    const data = await uploadsService.uploadImage(req.file);
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    logger.error("Upload route error", { service: services.UPLOADS, operation: "uploadImage", error: err });
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

export const uploadDocx = asyncHandler(async (req, res) => {
  try {
    const data = await uploadsService.uploadDocx(req.file);
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    logger.error("Upload route error", { service: services.UPLOADS, operation: "uploadDocx", error: err });
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

export default {
  uploadImage,
  uploadDocx
};
