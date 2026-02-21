import express from "express";
import { getSupabaseClient } from "../config/supabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  try {
    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);

  } catch (err) {
    console.error("Portfolio fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch portfolio items" });
  }
});

export default router;
