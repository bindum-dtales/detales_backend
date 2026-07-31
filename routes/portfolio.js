import express from "express";
import fs from "fs/promises";
import path from "path";
import { getSupabaseClient } from "../config/supabase.js";

const router = express.Router();

const CACHE_DIR = path.resolve(process.cwd(), "cache");
const CACHE_FILE = path.join(CACHE_DIR, "portfolio.json");
const SUPABASE_TIMEOUT_MS = 5000;
const SUPABASE_RETRIES = 3;
const SUPABASE_RETRY_DELAY_MS = 1000;

let portfolioCache = null;
let isRevalidating = false;

function setNoCacheHeaders(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
}

router.use((req, res, next) => {
  setNoCacheHeaders(res);
  next();
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readCacheFile() {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (parsed && Array.isArray(parsed.data)) {
      return parsed.data;
    }

    return null;
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("[CACHE READ ERROR]", error.message);
    }
    return null;
  }
}

const initialPortfolioCache = await readCacheFile();

if (Array.isArray(initialPortfolioCache)) {
  portfolioCache = initialPortfolioCache;
}

async function writeCacheFile(data) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), "utf8");
    console.log("[CACHE UPDATED]");
  } catch (error) {
    console.error("[CACHE WRITE ERROR]", error.message);
  }
}

async function clearCacheFile() {
  portfolioCache = null;

  try {
    await fs.unlink(CACHE_FILE);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("[CACHE CLEAR ERROR]", error.message);
    }
  }
}

async function loadCachedPortfolio() {
  const diskCache = await readCacheFile();

  if (Array.isArray(diskCache)) {
    if (diskCache.length > 0) {
      portfolioCache = diskCache;
      return diskCache;
    }

    const reloadedCache = await readCacheFile();

    if (Array.isArray(reloadedCache)) {
      if (reloadedCache.length > 0) {
        portfolioCache = reloadedCache;
        return reloadedCache;
      }
    }

    return [];
  }

  if (Array.isArray(portfolioCache)) {
    return portfolioCache;
  }

  return [];
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

async function runSupabaseQuery(operation) {
  let lastError;

  for (let attempt = 1; attempt <= SUPABASE_RETRIES; attempt += 1) {
    try {
      const result = await runWithTimeout(operation);

      if (result.error) {
        throw result.error;
      }

      return result.data || [];
    } catch (error) {
      lastError = error;

      if (attempt < SUPABASE_RETRIES) {
        console.log(`[SUPABASE RETRY ${attempt}]`);
        await wait(SUPABASE_RETRY_DELAY_MS);
      }
    }
  }

  throw lastError;
}

async function fetchPortfolioFromSupabase() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }

  return runSupabaseQuery(async (signal) => {
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
}

async function refreshPortfolioCache() {
  const freshData = await fetchPortfolioFromSupabase();
  portfolioCache = freshData;
  await writeCacheFile(freshData);
  return freshData;
}

function revalidatePortfolioInBackground() {
  if (isRevalidating) {
    return;
  }

  isRevalidating = true;

  (async () => {
    try {
      await refreshPortfolioCache();
    } catch (error) {
      console.error("[SUPABASE ERROR - SERVING CACHE]", error.message);
    } finally {
      isRevalidating = false;
    }
  })();
}

router.get("/", async (_req, res) => {
  try {
    const data = await loadCachedPortfolio();

    console.log("Portfolio served:", data.length);

    return res.status(200).json(data || []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { title, link, category, cover_image_url } = req.body;

    const data = await runSupabaseQuery(async (signal) => {
      let query = supabase
        .from("portfolio")
        .insert([
          { title, link, category, cover_image_url }
        ])
        .select()
        .single();

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    await clearCacheFile();

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Portfolio create failed",
      details: err.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "Missing ID parameter"
      });
    }

    const data = await runSupabaseQuery(async (signal) => {
      let query = supabase
        .from("portfolio")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    if (!data) {
      return res.status(404).json({
        error: "Portfolio item not found"
      });
    }

    await clearCacheFile();

    return res.json({
      success: true,
      message: "Portfolio item deleted successfully",
      deleted: data
    });
  } catch (err) {
    console.error("Portfolio delete route crash:", err);
    return res.status(500).json({
      error: "Portfolio delete failed",
      details: err.message
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { id } = req.params;
    const { title, link, category, cover_image_url, published } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Missing ID parameter"
      });
    }

    if (!title || !link || !category) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "title, link, and category are required"
      });
    }

    const existingData = await runSupabaseQuery(async (signal) => {
      let query = supabase
        .from("portfolio")
        .select("id")
        .eq("id", id)
        .single();

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    if (!existingData) {
      return res.status(400).json({
        error: "Portfolio item not found"
      });
    }

    const data = await runSupabaseQuery(async (signal) => {
      let query = supabase
        .from("portfolio")
        .update({
          title,
          link,
          category,
          cover_image_url,
          ...(typeof published === "boolean" ? { published } : {}),
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    await clearCacheFile();

    return res.status(200).json({
      success: true,
      message: "Portfolio item updated successfully",
      data
    });
  } catch (err) {
    console.error("Portfolio update route crash:", err);
    return res.status(500).json({
      error: "Portfolio update failed",
      details: err.message
    });
  }
});

export default router;
