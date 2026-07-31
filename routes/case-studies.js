import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { getSupabaseClient } from "../config/supabase.js";

const router = Router();

const CACHE_DIR = path.resolve(process.cwd(), "cache");
const CACHE_FILE = path.join(CACHE_DIR, "case_studies.json");
const SUPABASE_TIMEOUT_MS = 5000;
const SUPABASE_RETRIES = 3;
const SUPABASE_RETRY_DELAY_MS = 1000;

let caseStudiesCache = null;
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

function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildExcerpt(html, maxLen = 200) {
  const text = stripHtml(html);
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function extractContent(bodyContent) {
  if (typeof bodyContent === "string") {
    return bodyContent;
  }

  if (bodyContent && typeof bodyContent === "object" && typeof bodyContent.html === "string") {
    return bodyContent.html;
  }

  return "";
}

function normalizeCaseStudy(row) {
  const cover_image_url = row?.cover_image_url ?? null;
  const content = row?.content ?? "";
  const excerpt = buildExcerpt(content, 200);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover_image_url,
    excerpt,
    content,
    published: row.published,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
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

const initialCaseStudiesCache = await readCacheFile();

if (Array.isArray(initialCaseStudiesCache)) {
  caseStudiesCache = initialCaseStudiesCache;
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
  caseStudiesCache = null;

  try {
    await fs.unlink(CACHE_FILE);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("[CACHE CLEAR ERROR]", error.message);
    }
  }
}

async function loadCachedCaseStudies() {
  const diskCache = await readCacheFile();

  if (Array.isArray(diskCache)) {
    if (diskCache.length > 0) {
      caseStudiesCache = diskCache;
      return diskCache;
    }

    const reloadedCache = await readCacheFile();

    if (Array.isArray(reloadedCache)) {
      if (reloadedCache.length > 0) {
        caseStudiesCache = reloadedCache;
        return reloadedCache;
      }
    }

    return [];
  }

  if (Array.isArray(caseStudiesCache)) {
    return caseStudiesCache;
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

      return result.data;
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

async function fetchPublicCaseStudiesFromSupabase() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }

  const rows = await runSupabaseQuery(async (signal) => {
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

  return (rows || []).map(normalizeCaseStudy);
}

async function refreshCaseStudiesCache() {
  const freshData = await fetchPublicCaseStudiesFromSupabase();
  caseStudiesCache = freshData;
  await writeCacheFile(freshData);
  return freshData;
}

function revalidateCaseStudiesInBackground() {
  if (isRevalidating) {
    return;
  }

  isRevalidating = true;

  (async () => {
    try {
      await refreshCaseStudiesCache();
    } catch (error) {
      console.error("[SUPABASE ERROR - SERVING CACHE]", error.message);
    } finally {
      isRevalidating = false;
    }
  })();
}

router.get("/", async (_req, res) => {
  try {
    const data = await loadCachedCaseStudies();

    console.log("Case studies served:", data.length);

    return res.status(200).json(data || []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/public", async (_req, res) => {
  try {
    const data = await loadCachedCaseStudies();

    console.log("Case studies served:", data.length);

    return res.status(200).json(data || []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const cachedData = await loadCachedCaseStudies();

    if (Array.isArray(cachedData)) {
      const cachedItem = cachedData.find((item) => String(item.id) === String(req.params.id));
      if (cachedItem) {
        return res.status(200).json(cachedItem);
      }
    }

    const reloadedData = await loadCachedCaseStudies();
    const reloadedItem = Array.isArray(reloadedData)
      ? reloadedData.find((item) => String(item.id) === String(req.params.id))
      : null;

    if (reloadedItem) {
      return res.status(200).json(reloadedItem);
    }

    return res.status(404).json({ error: "Case study not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const title = (req.body.title || "").toString().trim();
    const content = extractContent(req.body.content);
    const cover_image_url = req.body.cover_image_url ?? null;
    const published = req.body.published === true;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "Content is required (must be HTML string)" });
    }

    const excerpt = buildExcerpt(content, 200);

    const data = await runSupabaseQuery(async (signal) => {
      let query = supabase
        .from("case_studies")
        .insert([
          {
            title,
            excerpt,
            content,
            cover_image_url,
            published
          }
        ])
        .select()
        .single();

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    await clearCacheFile();

    return res.status(201).json(normalizeCaseStudy(data));
  } catch (error) {
    console.error("POST / error:", error);
    return res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    let current;

    try {
      current = await runSupabaseQuery(async (signal) => {
        let query = supabase
          .from("case_studies")
          .select("*")
          .eq("id", req.params.id)
          .single();

        if (typeof query.abortSignal === "function") {
          query = query.abortSignal(signal);
        }

        return query;
      });
    } catch (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Case study not found" });
      }
      throw error;
    }

    const title = ((req.body.title ?? current.title) || "").toString().trim();
    const contentRaw = extractContent(req.body.content);
    const content = contentRaw !== "" ? contentRaw : current.content || "";
    const cover_image_url = req.body.cover_image_url !== undefined ? req.body.cover_image_url : current.cover_image_url ?? null;
    const published = typeof req.body.published === "boolean" ? req.body.published : current.published === true;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "Content is required (must be HTML string)" });
    }

    const excerpt = buildExcerpt(content, 200);

    const data = await runSupabaseQuery(async (signal) => {
      let query = supabase
        .from("case_studies")
        .update({
          title,
          excerpt,
          content,
          cover_image_url,
          published,
          updated_at: new Date().toISOString()
        })
        .eq("id", req.params.id)
        .select()
        .single();

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    await clearCacheFile();

    return res.json(normalizeCaseStudy(data));
  } catch (error) {
    console.error("PUT /:id error:", error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const data = await runSupabaseQuery(async (signal) => {
      let query = supabase
        .from("case_studies")
        .delete()
        .eq("id", req.params.id)
        .select("id");

      if (typeof query.abortSignal === "function") {
        query = query.abortSignal(signal);
      }

      return query;
    });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Case study not found" });
    }

    await clearCacheFile();

    return res.status(200).json({
      success: true,
      message: "Case study deleted successfully"
    });
  } catch (error) {
    console.error("DELETE /:id error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
