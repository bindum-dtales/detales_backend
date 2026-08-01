import express from "express";
import { listPortfolio, createPortfolio, updatePortfolio, deletePortfolio } from "../controllers/portfolio.controller.js";
import { validatePortfolioId, validatePortfolioUpdate } from "../validators/portfolio.validator.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

function setNoCacheHeaders(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
}

router.use((req, res, next) => {
  setNoCacheHeaders(res);
  next();
});

router.get("/", listPortfolio);
router.post("/", requireAuth, createPortfolio);
router.put("/:id", requireAuth, validatePortfolioId, validatePortfolioUpdate, updatePortfolio);
router.delete("/:id", requireAuth, validatePortfolioId, deletePortfolio);

export default router;
