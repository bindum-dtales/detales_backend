import { Router } from "express";
import { getSupabaseClient } from "../config/supabase.js";

const router = Router();

function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildExcerpt(html, maxLen = 200) {
  const text = stripHtml(html);
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function extractContent(bodyContent) {
  // Content should be a plain string from frontend
  if (typeof bodyContent === "string") {
    return bodyContent;
  }
  // LEGACY: Handle { html: "..." } format from older frontend
  if (bodyContent && typeof bodyContent === "object" && typeof bodyContent.html === "string") {
    return bodyContent.html;
  }
  return "";
}

function normalizeCaseStudy(row) {
  // Use cover_image_url directly from database (schema column)
  const cover_image_url = row?.cover_image_url ?? null;
  
  // Content is plain HTML string from database
  const content = row?.content ?? "";
  
  // Generate excerpt from HTML content
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
    updated_at: row.updated_at,
  };
}

router.get("/", async (_req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json((data || []).map(normalizeCaseStudy));
  } catch (error) {
    console.error("GET / error:", error);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/public", async (_req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json((data || []).map(normalizeCaseStudy));
  } catch (error) {
    console.error("GET /public error:", error);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: "Case study not found" });
    }

    res.json(normalizeCaseStudy(data));
  } catch (error) {
    console.error("GET /:id error:", error);
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

    console.log("POST /case-studies - Request body:", JSON.stringify(req.body, null, 2));
    
    const title = (req.body.title || "").toString().trim();
    const content = extractContent(req.body.content);
    const cover_image_url = req.body.cover_image_url ?? null;
    const published = req.body.published === true;

    console.log("Extracted values:", { title, contentLength: content.length, cover_image_url, published });

    // Validation
    if (!title) {
      console.error("Validation failed: Title is empty");
      return res.status(400).json({ error: "Title is required" });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      console.error("Validation failed: Content invalid", { contentType: typeof content, contentLength: content?.length });
      return res.status(400).json({ error: "Content is required (must be HTML string)" });
    }

    const excerpt = buildExcerpt(content, 200);

    console.log("Inserting into Supabase:", { title, excerpt, contentLength: content.length, cover_image_url, published });

    const { data, error } = await supabase
      .from("case_studies")
      .insert([
        {
          title,
          excerpt,
          content,
          cover_image_url,
          published,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("Case study created successfully:", data.id);
    res.status(201).json(normalizeCaseStudy(data));
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

    console.log("PUT /case-studies/:id - Request body:", JSON.stringify(req.body, null, 2));
    
    const { data: current, error: fetchError } = await supabase
      .from("case_studies")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (!current) {
      return res.status(404).json({ error: "Case study not found" });
    }

    const title = ((req.body.title ?? current.title) || "").toString().trim();
    const contentRaw = extractContent(req.body.content);
    const content = contentRaw !== "" ? contentRaw : current.content || "";
    const cover_image_url = req.body.cover_image_url !== undefined ? req.body.cover_image_url : current.cover_image_url ?? null;
    const published = typeof req.body.published === "boolean" ? req.body.published : current.published === true;

    console.log("Extracted values:", { title, contentLength: content.length, cover_image_url, published });

    // Validation
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "Content is required (must be HTML string)" });
    }

    const excerpt = buildExcerpt(content, 200);

    console.log("Updating in Supabase:", { title, excerpt, contentLength: content.length, cover_image_url, published });

    const { data, error } = await supabase
      .from("case_studies")
      .update({
        title,
        excerpt,
        content,
        cover_image_url,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    console.log("Case study updated successfully:", data.id);
    res.json(normalizeCaseStudy(data));
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

    const { data, error } = await supabase
      .from("case_studies")
      .delete()
      .eq("id", req.params.id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Case study not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("DELETE /:id error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
