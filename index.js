import dotenv from "dotenv";
dotenv.config();

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

app.use("/api/portfolio", portfolioRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
