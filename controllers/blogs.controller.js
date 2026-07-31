import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as blogsService from "../services/blogs/blogs.service.js";

function sendLegacyError(res, err) {
  return res.status(err.status || 500).json({ error: err.message });
}

export const listBlogs = asyncHandler(async (req, res) => {
  try {
    const data = await blogsService.getBlogs();

    logger.info("Blogs served", {
      service: services.BLOGS,
      endpoint: req.originalUrl,
      count: data.length
    });

    return res.status(200).json(data || []);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export const getBlog = asyncHandler(async (req, res) => {
  try {
    const data = await blogsService.getBlogById(req.params.id);
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export const createBlog = asyncHandler(async (req, res) => {
  try {
    const data = await blogsService.createBlog(req.body);
    return res.status(201).json(data);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export const updateBlog = asyncHandler(async (req, res) => {
  try {
    const data = await blogsService.updateBlog(req.params.id, req.body);
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export const deleteBlog = asyncHandler(async (req, res) => {
  try {
    await blogsService.deleteBlog(req.params.id);
    return res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export default {
  listBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog
};
