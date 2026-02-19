import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import blogsRouter from "./routes/blogs.js";
import caseStudiesRouter from "./routes/case-studies.js";
import uploadsRouter from "./routes/uploads.js";
import portfolioRouter from "./routes/portfolio.js";
import { getSupabaseStatus } from "./config/supabase.js";

const app = express();

console.log("🚀 Initializing DTALES API Server...");
console.log("📁 Environment:", process.env.NODE_ENV || "development");
console.log("🌐 Frontend URL:", process.env.FRONTEND_URL || "not configured");

// CORS middleware - enable for all routes
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  })
);
console.log("✅ CORS enabled");

// Body parsing middleware
// CRITICAL: 10mb limit to handle large HTML content with embedded images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
console.log("✅ Body parsing middleware enabled (JSON + URL-encoded)");

// Root health check
app.get("/", (_req, res) => {
  res.send("DTALES API Running");
});
console.log("✅ Root route mounted: GET /");

// API test route for diagnostics
app.get("/api/test", (_req, res) => {
  const supabaseStatus = getSupabaseStatus();
  res.json({ 
    status: "API working",
    timestamp: new Date().toISOString(),
    supabase: {
      supabaseUrlLoaded: supabaseStatus.supabaseUrlLoaded,
      supabaseKeyLoaded: supabaseStatus.supabaseKeyLoaded,
      configured: supabaseStatus.supabaseUrlLoaded && supabaseStatus.supabaseKeyLoaded
    },
    endpoints: [
      "GET /api/blogs/public",
      "GET /api/case-studies/public",
      "GET /api/portfolio/public",
      "GET /api/test"
    ]
  });
});
console.log("✅ Test route mounted: GET /api/test");

// Mount API routes
app.use("/api/blogs", blogsRouter);
console.log("✅ Blogs routes mounted: /api/blogs/*");

app.use("/api/case-studies", caseStudiesRouter);
console.log("✅ Case studies routes mounted: /api/case-studies/*");

app.use("/api/uploads", uploadsRouter);
console.log("✅ Uploads routes mounted: /api/uploads/*");

app.use("/api/portfolio", portfolioRouter);
console.log("✅ Portfolio routes mounted: /api/portfolio/*");

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`⚠️  404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("\n" + "=".repeat(50));
  console.log(`🎉 Server successfully started!`);
  console.log(`📍 Listening on: http://0.0.0.0:${PORT}`);
  console.log(`📍 Local access: http://localhost:${PORT}`);
  console.log("\n📋 Available endpoints:");
  console.log(`   GET  /`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/blogs/public`);
  console.log(`   GET  /api/case-studies/public`);
  console.log(`   GET  /api/portfolio/public`);
  console.log(`   POST /api/uploads`);
  console.log("=".repeat(50) + "\n");
});
