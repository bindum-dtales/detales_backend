import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";
import httpStatus from "../../constants/httpStatus.js";
import errorCodes from "../../constants/errorCodes.js";
import services from "../../constants/services.js";
import * as uploadsStorage from "./uploads.storage.js";
import * as uploadsMapper from "./uploads.mapper.js";

function assertSupabaseConfigured() {
  const supabase = uploadsStorage.getClient();

  if (!supabase) {
    throw new AppError("Supabase not configured", {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      service: services.UPLOADS,
      code: errorCodes.SERVICE_UNAVAILABLE
    });
  }
}

function assertBucketConfigured() {
  const bucket = uploadsStorage.getBucket();

  if (!bucket) {
    throw new AppError("Supabase bucket not configured", {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      service: services.UPLOADS,
      code: errorCodes.SERVICE_UNAVAILABLE
    });
  }

  return bucket;
}

export async function uploadImage(file) {
  assertSupabaseConfigured();
  const bucket = assertBucketConfigured();

  if (!file) {
    logger.error("Upload image: no file in request", { service: services.UPLOADS, operation: "uploadImage" });
    throw new AppError("No image file provided", {
      status: httpStatus.BAD_REQUEST,
      service: services.UPLOADS,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  if (!file.buffer || !file.originalname || !file.mimetype) {
    logger.error("Upload image: invalid file properties", {
      service: services.UPLOADS,
      operation: "uploadImage",
      hasBuffer: Boolean(file.buffer),
      hasOriginalname: Boolean(file.originalname),
      hasMimetype: Boolean(file.mimetype)
    });
    throw new AppError("Invalid image file", {
      status: httpStatus.BAD_REQUEST,
      service: services.UPLOADS,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  const filePath = uploadsMapper.buildImagePath(file.originalname);

  logger.info("Upload image: uploading", { service: services.UPLOADS, operation: "uploadImage", path: filePath });

  let uploadError;

  try {
    await uploadsStorage.uploadFile({
      bucket,
      path: filePath,
      buffer: file.buffer,
      contentType: file.mimetype,
      upsert: false
    });
  } catch (error) {
    uploadError = error;
  }

  if (uploadError) {
    logger.error("Upload image: Supabase upload error", {
      service: services.UPLOADS,
      operation: "uploadImage",
      error: uploadError
    });
    throw new AppError("Failed to upload image to storage", {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      service: services.UPLOADS,
      code: errorCodes.INTERNAL_ERROR,
      details: uploadError.message
    });
  }

  const urlData = uploadsStorage.getPublicUrl({ bucket, path: filePath });

  if (!urlData || !urlData.publicUrl) {
    logger.error("Upload image: failed to generate public URL", {
      service: services.UPLOADS,
      operation: "uploadImage"
    });
    throw new AppError("Failed to generate image URL", {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      service: services.UPLOADS,
      code: errorCodes.INTERNAL_ERROR
    });
  }

  logger.info("Upload image: success", {
    service: services.UPLOADS,
    operation: "uploadImage",
    url: urlData.publicUrl
  });

  return uploadsMapper.toUploadResponse(urlData.publicUrl);
}

export async function uploadDocx(file) {
  assertSupabaseConfigured();
  const bucket = assertBucketConfigured();

  if (!file) {
    throw new AppError("No docx file", {
      status: httpStatus.BAD_REQUEST,
      service: services.UPLOADS,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  const filePath = uploadsMapper.buildDocxPath(file.originalname);

  await uploadsStorage.uploadFile({
    bucket,
    path: filePath,
    buffer: file.buffer,
    contentType: file.mimetype
  });

  const urlData = uploadsStorage.getPublicUrl({ bucket, path: filePath });

  // Category is metadata only here — DOCX is still stored as-is (no
  // conversion happens server-side today for any attachment type).
  const attachmentType = uploadsMapper.detectAttachmentType(file.originalname);

  logger.info("Upload docx: success", {
    service: services.UPLOADS,
    operation: "uploadDocx",
    url: urlData?.publicUrl,
    attachmentType
  });

  return uploadsMapper.toUploadResponse(urlData?.publicUrl, {
    originalName: file.originalname,
    mimeType: file.mimetype,
    attachmentType
  });
}

export default {
  uploadImage,
  uploadDocx
};
