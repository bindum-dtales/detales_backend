import express from "express";
import multer from "multer";
import { uploadImage, uploadDocx } from "../controllers/uploads.controller.js";

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

// DOCX uploads: no image filtering, 10MB limit for documents
const docxUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    // Accept DOCX files only
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.originalname.endsWith(".docx")) {
      cb(null, true);
    } else {
      cb(new Error("Only DOCX files are allowed"), false);
    }
  }
});

router.post("/image", imageUpload.single("image"), uploadImage);
router.post("/docx", docxUpload.single("file"), uploadDocx);

router.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  return res.status(400).json({ error: err.message || "Upload error" });
});

export default router;
