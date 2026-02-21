import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import portfolioRoute from "./routes/portfolio.js";
import blogsRoute from "./routes/blogs.js";
import caseStudiesRoute from "./routes/case-studies.js";
import uploadsRoute from "./routes/uploads.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/test", (req, res) => {
  res.json({ status: "API running" });
});

// Mount routes
app.use("/api/portfolio", portfolioRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/case-studies", caseStudiesRoute);
app.use("/api/uploads", uploadsRoute);

// Debug environment variables
app.get("/api/debug-env", (req, res) => {
  console.log("DEBUG: Checking environment variables...");
  console.log("DEBUG: SUPABASE_URL =", process.env.SUPABASE_URL ? "loaded" : "missing");
  console.log("DEBUG: SUPABASE_SERVICE_ROLE_KEY =", process.env.SUPABASE_SERVICE_ROLE_KEY ? "loaded" : "missing");
  console.log("DEBUG: SUPABASE_BUCKET =", process.env.SUPABASE_BUCKET || "missing");
  
  res.json({
    url: process.env.SUPABASE_URL || null,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "exists" : null,
    bucket: process.env.SUPABASE_BUCKET || null,
    nodeEnv: process.env.NODE_ENV || null
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
