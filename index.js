import "dotenv/config";
import express from "express";
import cors from "cors";

import portfolioRoute from "./routes/portfolio.js";
import blogsRoute from "./routes/blogs.js";
import caseStudiesRoute from "./routes/case-studies.js";
import uploadsRoute from "./routes/uploads.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("SERVER RUNNING - STEP 6");
});

app.use("/api/portfolio", portfolioRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/case-studies", caseStudiesRoute);
app.use("/api/uploads", uploadsRoute);

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER STARTED ON PORT", PORT);
});
