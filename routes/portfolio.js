import express from "express";
import { getSupabaseClient } from "../config/supabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("portfolio")
      .select("*");

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);

  } catch (err) {
    console.error("Portfolio fetch error:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch portfolio items" });
  }
});

export default router;
