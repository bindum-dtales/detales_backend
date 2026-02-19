import { Router } from "express";
import { getSupabaseClient } from "../config/supabase.js";

const router = Router();

// GET / - Return all portfolio items ordered by created_at DESC
router.get("/", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching portfolio items:", error);
      return res.status(500).json({
        error: "Failed to fetch portfolio items",
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    console.error("Unexpected error in GET /portfolio:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

// GET /public - Return only published portfolio items
router.get("/public", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching published portfolio items:", error);
      return res.status(500).json({
        error: "Failed to fetch published portfolio items",
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    console.error("Unexpected error in GET /portfolio/public:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

// GET /:id - Return single portfolio item
router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "Portfolio item ID is required"
      });
    }

    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          error: "Portfolio item not found"
        });
      }
      console.error("Error fetching portfolio item:", error);
      return res.status(500).json({
        error: "Failed to fetch portfolio item",
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    console.error("Unexpected error in GET /portfolio/:id:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

// POST / - Insert new portfolio item
router.post("/", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { title, link, category, cover_image_url, published } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        error: "Title is required"
      });
    }

    if (!category) {
      return res.status(400).json({
        error: "Category is required"
      });
    }

    // Prepare insert data
    const insertData = {
      title,
      link: link || null,
      category,
      cover_image_url: cover_image_url || null,
      published: published !== undefined ? published : false
    };

    const { data, error } = await supabase
      .from("portfolio")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Error creating portfolio item:", error);
      return res.status(500).json({
        error: "Failed to create portfolio item",
        details: error.message
      });
    }

    return res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    console.error("Unexpected error in POST /portfolio:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

// PUT /:id - Update portfolio item
router.put("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { id } = req.params;
    const { title, link, category, cover_image_url, published } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Portfolio item ID is required"
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link;
    if (category !== undefined) updateData.category = category;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (published !== undefined) updateData.published = published;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Check if there's anything to update
    if (Object.keys(updateData).length === 1) {
      return res.status(400).json({
        error: "No fields to update"
      });
    }

    const { data, error } = await supabase
      .from("portfolio")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          error: "Portfolio item not found"
        });
      }
      console.error("Error updating portfolio item:", error);
      return res.status(500).json({
        error: "Failed to update portfolio item",
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    console.error("Unexpected error in PUT /portfolio/:id:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

// DELETE /:id - Delete portfolio item
router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "Portfolio item ID is required"
      });
    }

    const { error } = await supabase
      .from("portfolio")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting portfolio item:", error);
      return res.status(500).json({
        error: "Failed to delete portfolio item",
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Portfolio item deleted successfully"
    });
  } catch (err) {
    console.error("Unexpected error in DELETE /portfolio/:id:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

export default router;
