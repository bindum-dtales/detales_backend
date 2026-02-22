import express from "express";
import supabase from "../config/supabase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase not configured"
      });
    }

    const { data, error } = await supabase
      .from("portfolio")
      .select("*");

    if (error) {
      console.error("Portfolio query error:", error);
      return res.status(500).json({
        error: "Database error",
        details: error.message
      });
    }

    return res.json(data || []);

  } catch (err) {
    console.error("Portfolio route crash:", err);
    return res.status(500).json({
      error: "Portfolio route failed",
      details: err.message
    });
  }
});

export default router;
