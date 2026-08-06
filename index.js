import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { getSupabaseClient } from "./config/supabase.js";
import logger from "./utils/logger.js";
import requestId from "./middleware/requestId.js";
import metricsTracker from "./middleware/metricsTracker.js";
import errorHandler from "./middleware/errorHandler.js";
import { registerShutdown } from "./services/system/shutdown.service.js";
import {
  configureTrustProxy,
  disablePoweredBy,
  helmetMiddleware,
  compressionMiddleware,
  apiRateLimiter,
  bodyLimit
} from "./middleware/security.js";
import { supabaseConfig, cacheConfig, serverConfig } from "./config/appConfig.js";

import portfolioRoutes from "./routes/portfolio.js";
import blogRoutes from "./routes/blogs.js";
import caseStudyRoutes from "./routes/case-studies.js";
import uploadRoutes from "./routes/uploads.js";
import healthRoutes from "./routes/health.js";
import metricsRoutes from "./routes/metrics.js";
import authRoutes from "./routes/auth.js";
import docsRoutes from "./docs/docsRouter.js";

const app = express();
configureTrustProxy(app);
disablePoweredBy(app);
app.use(requestId);
app.use(metricsTracker);
const PORT = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === "production";

const CACHE_DIR = path.resolve(process.cwd(), cacheConfig.dir);
const PORTFOLIO_CACHE_PATH = path.join(CACHE_DIR, cacheConfig.files.portfolio);
const BLOGS_CACHE_PATH = path.join(CACHE_DIR, cacheConfig.files.blogs);
const CASE_STUDIES_CACHE_PATH = path.join(CACHE_DIR, cacheConfig.files.caseStudies);
const CACHE_REFRESH_INTERVAL_MS = cacheConfig.refreshIntervalMs;
const SUPABASE_TIMEOUT_MS = supabaseConfig.timeoutMs;
const SUPABASE_RETRIES = supabaseConfig.retries;
const SUPABASE_RETRY_DELAY_MS = supabaseConfig.retryDelayMs;

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
    company_name: row?.company_name ?? null,
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
    company_name: row?.company_name ?? null,
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
        .select("id, title, capability, subcategory, cover_image_url, link, content, company_name, description, featured")
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

setInterval(() => {
  const heapUsed = process.memoryUsage().heapUsed;

  if (heapUsed > serverConfig.heapWarningThresholdBytes) {
    logger.warn("[MEMORY WARNING] High memory usage detected.");
  }
}, serverConfig.heapCheckIntervalMs);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  logger.error("[ENV ERROR] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.");
  process.exit(1);
}

if (isProduction && !process.env.FRONTEND_URL) {
  logger.error("FRONTEND_URL is required in production");
  process.exit(1);
}

const productionOrigins = [process.env.FRONTEND_URL, "https://dtales.tech", "https://www.dtales.tech"].filter(
  Boolean
);
const developmentOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = [...new Set([...productionOrigins, ...developmentOrigins])];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["*"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: bodyLimit }));
app.use(helmetMiddleware);
app.use(compressionMiddleware);

app.use((req, res, next) => {
  const timeoutId = setTimeout(() => {
    logger.error(`[REQUEST TIMEOUT] ${req.method} ${req.originalUrl}`);

    if (!res.headersSent) {
      res.status(504).json({ error: "Request timeout" });
    }
  }, serverConfig.requestTimeoutMs);

  const clearRequestTimeout = () => {
    clearTimeout(timeoutId);
  };

  res.on("finish", clearRequestTimeout);
  res.on("close", clearRequestTimeout);

  req.on("aborted", clearRequestTimeout);

  next();
});

app.use("/api", apiRateLimiter);

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

app.use("/api/blogs", blogRoutes);
app.use("/api/case-studies", caseStudyRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use(healthRoutes);
app.use(metricsRoutes);
app.use("/api/docs", docsRoutes);

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
    const timeoutId = setTimeout(() => controller.abort(), serverConfig.mediaProxyTimeoutMs);

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

app.use(errorHandler);

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

registerShutdown(server);
