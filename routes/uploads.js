import express from "express";
import multer from "multer";
import { getSupabaseClient, getSupabaseBucket } from "../config/supabase.js";

const router = express.Router();

// Create separate multer instances to prevent HTTP2 protocol errors
// Image uploads: strict filtering, 4MB limit
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB limit
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

router.post("/image", imageUpload.single("image"), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const bucket = getSupabaseBucket();

    // Validate file exists
    if (!req.file) {
      console.error("POST /image: No file in request");
      return res.status(400).json({ error: "No image file provided" });
    }

    // Validate file properties
    if (!req.file.buffer || !req.file.originalname || !req.file.mimetype) {
      console.error("POST /image: Invalid file properties", {
        hasBuffer: !!req.file.buffer,
        hasOriginalname: !!req.file.originalname,
        hasMimetype: !!req.file.mimetype
      });
      return res.status(400).json({ error: "Invalid image file" });
    }

    // Generate unique file path
    const timestamp = Date.now();
    const filePath = `images/${timestamp}-${req.file.originalname}`;
    console.log("POST /image: Uploading to", filePath);

    // Upload to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error("POST /image: Supabase upload error:", {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError
      });
      return res.status(500).json({ 
        error: "Failed to upload image to storage",
        details: uploadError.message 
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      console.error("POST /image: Failed to generate public URL");
      return res.status(500).json({ error: "Failed to generate image URL" });
    }

    console.log("POST /image: Success", urlData.publicUrl);
    return res.status(200).json({ url: urlData.publicUrl });

  } catch (err) {
    console.error("POST /image: Unexpected error:", {
      message: err.message,
      stack: err.stack,
      error: err
    });
    
    // Ensure we always return JSON, never let Express default error handler run
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: "Internal server error during image upload",
        message: err.message 
      });
    }
  }
});

router.post("/docx", docxUpload.single("file"), async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const bucket = getSupabaseBucket();

    if (!req.file) {
      return res.status(400).json({ error: "No docx file" });
    }

    const filePath = `docs/${Date.now()}-${req.file.originalname}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    res.json({ url: data.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Docx upload failed" });
  }
});

export default router;
