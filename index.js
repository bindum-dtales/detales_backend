import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import portfolioRoute from "./routes/portfolio.js";
import blogsRoute from "./routes/blogs.js";
import caseStudiesRoute from "./routes/case-studies.js";
import uploadsRoute from "./routes/uploads.js";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 10000;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.FRONTEND_URL) {
  console.error("FRONTEND_URL is required in production");
  process.exit(1);
}

app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL : true,
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use("/api", limiter);

console.log("Environment:", process.env.NODE_ENV);
console.log("Frontend URL:", process.env.FRONTEND_URL);

// Health route must be defined BEFORE all other routes
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

console.log("Health route registered");

app.get("/", (req, res) => {
  res.send("SERVER RUNNING - STEP 6");
});

app.use("/api/portfolio", portfolioRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/case-studies", caseStudiesRoute);
app.use("/api/uploads", uploadsRoute);

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.get("/debug-supabase", async (req, res) => {
  try {
    const r = await fetch(process.env.SUPABASE_URL);
    res.json({ status: r.status });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
