import { Router } from "express";
import { listBlogs, getBlog, createBlog, updateBlog, deleteBlog } from "../controllers/blogs.controller.js";
import { validateCreateBlog } from "../validators/blogs.validator.js";

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
router.post("/", validateCreateBlog, createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
