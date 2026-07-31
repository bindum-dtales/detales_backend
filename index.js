import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { getSupabaseClient } from "./config/supabase.js";
import logger from "./utils/logger.js";
import requestId from "./middleware/requestId.js";

import portfolioRoutes from "./routes/portfolio.js";
import blogRoutes from "./routes/blogs.js";
import caseStudyRoutes from "./routes/case-studies.js";
import uploadRoutes from "./routes/uploads.js";
import healthRoutes from "./routes/health.js";

const app = express();
app.set("trust proxy", 1);
app.use(requestId);
const PORT = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === "production";

const CACHE_DIR = path.resolve(process.cwd(), "cache");
const PORTFOLIO_CACHE_PATH = path.join(CACHE_DIR, "portfolio.json");
const BLOGS_CACHE_PATH = path.join(CACHE_DIR, "blogs.json");
const CASE_STUDIES_CACHE_PATH = path.join(CACHE_DIR, "case_studies.json");
const CACHE_REFRESH_INTERVAL_MS = 300000;
const SUPABASE_TIMEOUT_MS = 5000;
const SUPABASE_RETRIES = 3;
const SUPABASE_RETRY_DELAY_MS = 1000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWithTimeout(operation) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runSupabaseQueryWithRetry(queryFactory) {
  let lastError;

  for (let attempt = 1; attempt <= SUPABASE_RETRIES; attempt += 1) {
    try {
      const result = await runWithTimeout(queryFactory);

      if (result.error) {
        throw result.error;
      }

      return result.data || [];
    } catch (error) {
      lastError = error;

      if (attempt < SUPABASE_RETRIES) {
        await wait(SUPABASE_RETRY_DELAY_MS);
      }
    }
  }

  throw lastError;
}

function normalizeBlog(row) {
  const content = row?.content ?? "";
  const excerpt = String(content).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover_image_url: row?.cover_image_url ?? null,
    excerpt,
    content,
    published: row.published,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function normalizeCaseStudy(row) {
  const content = row?.content ?? "";
  const excerpt = String(content).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover_image_url: row?.cover_image_url ?? null,
    excerpt,
    content,
    published: row.published,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function writeCache(cachePath, data) {
  await fs.promises.mkdir(CACHE_DIR, { recursive: true });
  await fs.promises.writeFile(cachePath, JSON.stringify(data, null, 2), "utf8");
  logger.info("[CACHE UPDATED]");
}

async function refreshPortfolioCache() {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client unavailable");
    }

    const data = await runSupabaseQueryWithRetry(async (signal) => {
      let query = supabase
        .from("portfolio")
        .select("id, title, category, cover_image_url, link")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    await writeCache(PORTFOLIO_CACHE_PATH, data);
    logger.info("[CACHE REFRESH SUCCESS] portfolio");
  } catch (error) {
    logger.error("[CACHE REFRESH FAILED] portfolio", { details: error.message });
    logger.error("[SUPABASE ERROR - KEEPING OLD CACHE]");
  }
}

async function refreshBlogsCache() {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client unavailable");
    }

    const rows = await runSupabaseQueryWithRetry(async (signal) => {
      let query = supabase
        .from("blogs")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    const data = (rows || []).map(normalizeBlog);
    await writeCache(BLOGS_CACHE_PATH, data);
    logger.info("[CACHE REFRESH SUCCESS] blogs");
  } catch (error) {
    logger.error("[CACHE REFRESH FAILED] blogs", { details: error.message });
    logger.error("[SUPABASE ERROR - KEEPING OLD CACHE]");
  }
}

async function refreshCaseStudiesCache() {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase client unavailable");
    }

    const rows = await runSupabaseQueryWithRetry(async (signal) => {
      let query = supabase
        .from("case_studies")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    const data = (rows || []).map(normalizeCaseStudy);
    await writeCache(CASE_STUDIES_CACHE_PATH, data);
    logger.info("[CACHE REFRESH SUCCESS] case_studies");
  } catch (error) {
    logger.error("[CACHE REFRESH FAILED] case_studies", { details: error.message });
    logger.error("[SUPABASE ERROR - KEEPING OLD CACHE]");
  }
}

async function refreshAllCaches() {
  logger.info("[AUTO CACHE REFRESH START]");
  await Promise.all([
    refreshPortfolioCache(),
    refreshBlogsCache(),
    refreshCaseStudiesCache()
  ]);
}

process.on("uncaughtException", (err) => {
  logger.error("[UNCAUGHT EXCEPTION]", { error: err });
});

process.on("unhandledRejection", (reason) => {
  logger.error("[UNHANDLED PROMISE]", { details: reason });
});

setInterval(() => {
  const heapUsed = process.memoryUsage().heapUsed;
  const oneGb = 1024 * 1024 * 1024;

  if (heapUsed > oneGb) {
    logger.warn("[MEMORY WARNING] High memory usage detected.");
  }
}, 60 * 1000);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  logger.error("[ENV ERROR] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.");
  process.exit(1);
}

const allowedOrigins = isProduction
  ? [...new Set([process.env.FRONTEND_URL, "https://dtales.tech"].filter(Boolean))]
  : true;

if (isProduction && !process.env.FRONTEND_URL) {
  logger.error("FRONTEND_URL is required in production");
  process.exit(1);
}

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://dtales.tech");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  return next();
});
app.use(express.json({ limit: "10mb" }));
app.use(helmet());

app.use((req, res, next) => {
  const timeoutId = setTimeout(() => {
    logger.error(`[REQUEST TIMEOUT] ${req.method} ${req.originalUrl}`);

    if (!res.headersSent) {
      res.status(504).json({ error: "Request timeout" });
    }
  }, 10000);

  const clearRequestTimeout = () => {
    clearTimeout(timeoutId);
  };

  res.on("finish", clearRequestTimeout);
  res.on("close", clearRequestTimeout);

  req.on("aborted", clearRequestTimeout);

  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use("/api", limiter);

logger.info(`Environment: ${process.env.NODE_ENV}`);
logger.info(`Frontend URL: ${process.env.FRONTEND_URL}`);

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("CDN-Cache-Control", "no-store");
  next();
});

app.get("/api/health", (req, res) => {
  return res.json({ status: "OK" });
});

logger.info("Health route registered");

app.get("/", (req, res) => {
  res.send("SERVER RUNNING - STEP 6");
});

app.use("/api/blogs", blogRoutes);
app.use("/api/case-studies", caseStudyRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/uploads", uploadRoutes);
app.use(healthRoutes);

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
      logger.error(`Supabase fetch failed: ${response.status} for ${filename}`);
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
    
    // Fix CORS + Cross-Origin-Resource-Policy for cross-origin image loading
    res.removeHeader("Cross-Origin-Resource-Policy");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "https://dtales.tech");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Convert Web ReadableStream to Node.js stream and pipe to response
    const nodeStream = Readable.fromWeb(response.body);
    
    nodeStream.on("error", (err) => {
      logger.error(`Stream error for ${filename}`, { details: err.message });
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream error" });
      }
    });

    nodeStream.pipe(res);

  } catch (err) {
    if (err.name === "AbortError") {
      logger.error(`Request timeout for ${req.params.filename}`);
      if (!res.headersSent) {
        res.status(504).json({ error: "Gateway timeout" });
      }
    } else {
      logger.error("Media proxy error", { details: err.message });
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

app.use((err, req, res, next) => {
  logger.error("[UNHANDLED ERROR]", { error: err });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({ error: "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});

const server = app.listen(PORT, () => {
  logger.info("[SERVER STARTED]");
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`Port: ${PORT}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || "not-set"}`);
});

refreshAllCaches();

setInterval(() => {
  refreshAllCaches();
}, CACHE_REFRESH_INTERVAL_MS);

function shutdown(signal) {
  logger.info(`Shutting down server... (${signal})`);

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(0);
  }, 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
