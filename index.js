import "dotenv/config";
import express from "express";
import cors from "cors";

import blogsRouter from "./routes/blogs.js";
import caseStudiesRouter from "./routes/case-studies.js";
import uploadsRouter from "./routes/uploads.js";

const app = express();

// CRITICAL: CORS must come first (headers only)
app.use(cors());

// CRITICAL: Mount upload routes BEFORE any body parsing middleware
// Multer handles multipart/form-data parsing internally
// If express.json() or express.urlencoded() run first, they will
// consume/corrupt the request body, causing ERR_HTTP2_PROTOCOL_ERROR
app.use("/api/uploads", uploadsRouter);

// Body parsers - only applied to non-upload routes due to order above
// CRITICAL: 10mb limit to handle large HTML content with embedded images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/blogs", blogsRouter);
app.use("/api/case-studies", caseStudiesRouter); // ✅ THIS FIXES IT

app.get("/", (req, res) => {
  res.send("DTales Backend Running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
