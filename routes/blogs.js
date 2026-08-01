import { Router } from "express";
import { listBlogs, getBlog, createBlog, updateBlog, deleteBlog } from "../controllers/blogs.controller.js";
import { validateCreateBlog } from "../validators/blogs.validator.js";
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

router.get("/", listBlogs);
router.get("/public", listBlogs);
router.get("/:id", getBlog);
router.post("/", requireAuth, validateCreateBlog, createBlog);
router.put("/:id", requireAuth, updateBlog);
router.delete("/:id", requireAuth, deleteBlog);

export default router;
