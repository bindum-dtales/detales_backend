import express from "express";
import cors from "cors";

import portfolioRoute from "./routes/portfolio.js";
import blogsRoute from "./routes/blogs.js";
import caseStudiesRoute from "./routes/case-studies.js";
import uploadsRoute from "./routes/uploads.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/test", (req, res) => {
  res.json({ status: "API running" });
});

// Mount routes
app.use("/api/portfolio", portfolioRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/case-studies", caseStudiesRoute);
app.use("/api/uploads", uploadsRoute);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
