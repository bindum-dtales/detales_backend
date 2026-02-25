import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Readable } from "stream";

import portfolioRoute from "./routes/portfolio.js";
import blogsRoute from "./routes/blogs.js";
import caseStudiesRoute from "./routes/case-studies.js";
import uploadsRoute from "./routes/uploads.js";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.FRONTEND_URL) {
  console.error("FRONTEND_URL is required in production");
  process.exit(1);
}

app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL : true,
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use("/api", limiter);

console.log("Environment:", process.env.NODE_ENV);
console.log("Frontend URL:", process.env.FRONTEND_URL);

// Health route must be defined BEFORE all other routes
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

console.log("Health route registered");

app.get("/", (req, res) => {
  res.send("SERVER RUNNING - STEP 6");
});

app.use("/api/portfolio", portfolioRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/case-studies", caseStudiesRoute);
app.use("/api/uploads", uploadsRoute);

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

// ============================================================================
// IMAGE PROXY ROUTE - Bypasses ISP routing issues for Supabase images
// ============================================================================
const SUPABASE_STORAGE_URL = "https://upkfbtqljrnlufflknkv.supabase.co/storage/v1/object/public/dtales-media/images";

app.get("/media/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    // Security: Validate filename to prevent directory traversal
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Construct the full Supabase URL
    const supabaseUrl = `${SUPABASE_STORAGE_URL}/${filename}`;

    // Fetch image from Supabase with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(supabaseUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "dtales-backend-proxy/1.0"
      }
    });

    clearTimeout(timeoutId);

    // Handle Supabase errors
    if (!response.ok) {
      console.error(`Supabase fetch failed: ${response.status} for ${filename}`);
      return res.status(response.status).json({ 
        error: "Image not found or inaccessible" 
      });
    }

    // Get content type from Supabase response
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");

    // Set response headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Convert Web ReadableStream to Node.js stream and pipe to response
    const nodeStream = Readable.fromWeb(response.body);
    
    nodeStream.on("error", (err) => {
      console.error(`Stream error for ${filename}:`, err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream error" });
      }
    });

    nodeStream.pipe(res);

  } catch (err) {
    if (err.name === "AbortError") {
      console.error(`Request timeout for ${req.params.filename}`);
      if (!res.headersSent) {
        res.status(504).json({ error: "Gateway timeout" });
      }
    } else {
      console.error("Media proxy error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
});
// ============================================================================

app.get("/debug-supabase", async (req, res) => {
  try {
    const url = process.env.SUPABASE_URL;

    if (!url) {
      return res.json({
        step: "env missing",
        error: "SUPABASE_URL is not defined"
      });
    }

    const dns = await import("dns/promises");

    let resolved;
    try {
      resolved = await dns.lookup(new URL(url).hostname);
    } catch (dnsErr) {
      return res.json({
        step: "dns lookup failed",
        error: dnsErr.message,
        url
      });
    }

    const response = await fetch(url);

    return res.json({
      step: "success",
      status: response.status,
      resolved
    });

  } catch (err) {
    return res.json({
      step: "fetch failed",
      error: err.message,
      url: process.env.SUPABASE_URL
    });
  }
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
