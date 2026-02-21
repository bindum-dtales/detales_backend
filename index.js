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
    status: "Backend is running",
    version: "1.0.0"
  });
});

app.use("/api/portfolio", portfolioRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
