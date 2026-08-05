import { extractContent } from "../services/blogs/blogs.mapper.js";
import AppError from "../utils/AppError.js";
import httpStatus from "../constants/httpStatus.js";
import errorCodes from "../constants/errorCodes.js";
import services from "../constants/services.js";

export function validateBlogFields({ title, content, company_name, published }) {
  if (!title) {
    return "Title is required";
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    return "Content is required (must be HTML string)";
  }

  if (published && (!company_name || !company_name.toString().trim())) {
    return "Company name is required before publishing";
  }

  return null;
}

export function validateCreateBlog(req, res, next) {
  const title = (req.body.title || "").toString().trim();
  const content = extractContent(req.body.content);
  const company_name = req.body.company_name ? req.body.company_name.toString().trim() : "";
  const published = req.body.published === true;

  const error = validateBlogFields({ title, content, company_name, published });

  if (error) {
    return next(
      new AppError(error, {
        status: httpStatus.BAD_REQUEST,
        service: services.BLOGS,
        code: errorCodes.VALIDATION_ERROR
      })
    );
  }

  next();
}

export default {
  validateBlogFields,
  validateCreateBlog
};
