import express from "express";
import { getSupabaseClient } from "../config/supabase.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { data, error } = await supabase
      .from("portfolio")
      .select("*");

    if (error) {
      throw error;
    }

    return res.json(data || []);

  } catch (error) {
    console.error("GET /portfolio error:", error);
    return res.status(500).json({
      error: error.message
    });
  }
});

export default router;
