import express from "express";
import { getSupabaseClient } from "../config/supabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    const response = await supabase
      .from("portfolio")
      .select("*");

    if (!response) {
      return res.status(500).json({ error: "No response from Supabase" });
    }

    if (response.error) {
      console.error("Supabase portfolio error:", response.error);
      return res.status(500).json({
        error: response.error.message || "Supabase query failed"
      });
    }

    return res.json(response.data || []);

  } catch (err) {
    console.error("Portfolio route crashed:", err);
    return res.status(500).json({
      error: "Portfolio route failed",
      message: err.message
    });
  }
});

export default router;
