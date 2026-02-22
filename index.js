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

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER STARTED ON PORT", PORT);
});
