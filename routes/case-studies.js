import { Router } from "express";
import {
  listCaseStudies,
  getCaseStudy,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy
} from "../controllers/caseStudies.controller.js";
import { validateCreateCaseStudy } from "../validators/caseStudies.validator.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

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

router.get("/", listCaseStudies);
router.get("/public", listCaseStudies);
router.get("/:id", getCaseStudy);
router.post("/", requireAuth, validateCreateCaseStudy, createCaseStudy);
router.put("/:id", requireAuth, updateCaseStudy);
router.delete("/:id", requireAuth, deleteCaseStudy);

export default router;
