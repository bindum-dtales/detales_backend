import asyncHandler from "../middleware/asyncHandler.js";
import * as uploadsService from "../services/uploads/uploads.service.js";
import { sendSuccess } from "../utils/response.js";

export const uploadImage = asyncHandler(async (req, res) => {
  const data = await uploadsService.uploadImage(req.file);
  return sendSuccess(res, { status: 200, message: "Image uploaded successfully", data });
});

export const uploadDocx = asyncHandler(async (req, res) => {
  const data = await uploadsService.uploadDocx(req.file);
  return sendSuccess(res, { status: 200, message: "Document uploaded successfully", data });
});

export default {
  uploadImage,
  uploadDocx
};
