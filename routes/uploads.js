import express from "express";
import multer from "multer";
import { uploadImage, uploadDocx } from "../controllers/uploads.controller.js";
import requireAuth from "../middleware/auth.js";
import AppError from "../utils/AppError.js";
import httpStatus from "../constants/httpStatus.js";
import errorCodes from "../constants/errorCodes.js";
import services from "../constants/services.js";
import * as uploadsMapper from "../services/uploads/uploads.mapper.js";

const router = express.Router();

// Create separate multer instances to prevent HTTP2 protocol errors
// Image uploads: strict filtering, 4MB limit
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

// Portfolio attachment uploads: one field for both documents and images
// (see DOCUMENT/IMAGE extension lists in uploads.mapper.js). Validation is
// extension-based, same approach the old "DOCX only" check used
// (file.originalname.endsWith(...)), since mimetypes for formats like
// .md/.yaml/.csv are inconsistent across browsers. 10MB limit unchanged.
const docxUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    if (uploadsMapper.isAllowedAttachment(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type for attachment upload"), false);
    }
  }
});

router.post("/image", requireAuth, imageUpload.single("image"), uploadImage);
router.post("/docx", requireAuth, docxUpload.single("file"), uploadDocx);

router.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  // Normalize multer/file-filter errors (and anything else that reaches here)
  // into an AppError so the centralized error handler in index.js formats
  // every upload error the same way as the rest of the API. AppErrors
  // (e.g. from requireAuth) already carry their own status/shape and pass through.
  if (err instanceof AppError) {
    return next(err);
  }

  return next(
    new AppError(err.message || "Upload error", {
      status: httpStatus.BAD_REQUEST,
      service: services.UPLOADS,
      code: errorCodes.VALIDATION_ERROR
    })
  );
});

export default router;
