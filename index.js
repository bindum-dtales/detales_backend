console.log("=== STARTUP ENV CHECK ===");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("SUPABASE_BUCKET:", process.env.SUPABASE_BUCKET);
console.log("==========================");

import express from "express";
import cors from "cors";
import portfolioRoute from "./routes/portfolio.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({
    status: "API working",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/env-check", (req, res) => {
  res.json({
    hasUrl: !!process.env.SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: process.env.SUPABASE_BUCKET || null
  });
});

app.get("/api/full-env", (req, res) => {
  res.json({
    SUPABASE_URL: process.env.SUPABASE_URL || null,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "LOADED" : null,
    SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || null,
    NODE_ENV: process.env.NODE_ENV || null
  });
});

app.use("/api/portfolio", portfolioRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
