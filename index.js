// Production fallback for environment variables (Hostinger doesn't load .env)
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = "https://upkfbqljrnlufflknkv.supabase.co";
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwa2ZidHFsanJubHVmZmxrbmt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk4ODIwOCwiZXhwIjoyMDg0NTY0MjA4fQ.wIQe5KZAZFdKst5s1v9TbH844D0xqHpoOFstVTUnOUM";
}

if (!process.env.SUPABASE_BUCKET) {
  process.env.SUPABASE_BUCKET = "dtales-media";
}

if (!process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL = "https://dtales.tech";
}

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import portfolioRoute from "./routes/portfolio.js";
import blogsRoute from "./routes/blogs.js";
import caseStudiesRoute from "./routes/case-studies.js";
import uploadsRoute from "./routes/uploads.js";

console.log("ENV CHECK START:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "EXISTS" : "MISSING");
console.log("NODE_ENV:", process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("SERVER RUNNING - STEP 6");
});

app.get("/debug-env", (req, res) => {
  res.json({
    hasUrl: !!process.env.SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeVersion: process.version
  });
});

app.use("/api/portfolio", portfolioRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/case-studies", caseStudiesRoute);
app.use("/api/uploads", uploadsRoute);

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.get("/test-fetch", async (req, res) => {
  try {
    const r = await fetch("https://google.com");
    res.json({ status: r.status });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/test-supabase", async (req, res) => {
  try {
    const r = await fetch(process.env.SUPABASE_URL, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    res.json({
      status: r.status,
      ok: r.ok
    });
  } catch (err) {
    res.json({
      error: err.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER STARTED ON PORT", PORT);
});
