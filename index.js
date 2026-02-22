import "dotenv/config";
import express from "express";
import cors from "cors";

import portfolioRoute from "./routes/portfolio.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("SERVER RUNNING - STEP 2");
});

app.use("/api/portfolio", portfolioRoute);

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER STARTED ON PORT", PORT);
});
