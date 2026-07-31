import { extractContent } from "../services/blogs/blogs.mapper.js";

export function validateBlogFields({ title, content }) {
  if (!title) {
    return "Title is required";
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    return "Content is required (must be HTML string)";
  }

  return null;
}

export function validateCreateBlog(req, res, next) {
  const title = (req.body.title || "").toString().trim();
  const content = extractContent(req.body.content);

  const error = validateBlogFields({ title, content });

  if (error) {
    return res.status(400).json({ error });
  }

  next();
}

export default {
  validateBlogFields,
  validateCreateBlog
};
