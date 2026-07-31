import { Router } from "express";
import {
  listCaseStudies,
  getCaseStudy,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy
} from "../controllers/caseStudies.controller.js";
import { validateCreateCaseStudy } from "../validators/caseStudies.validator.js";

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
router.post("/", validateCreateCaseStudy, createCaseStudy);
router.put("/:id", updateCaseStudy);
router.delete("/:id", deleteCaseStudy);

export default router;
