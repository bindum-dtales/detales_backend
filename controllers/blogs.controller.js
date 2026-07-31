import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as blogsService from "../services/blogs/blogs.service.js";
import { sendLegacyError } from "../utils/errorResponse.js";

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
    return sendLegacyError(res, err);
  }
});

export const getBlog = asyncHandler(async (req, res) => {
  try {
    const data = await blogsService.getBlogById(req.params.id);
    return res.status(200).json(data);
  } catch (err) {
    return sendLegacyError(res, err);
  }
});

export const createBlog = asyncHandler(async (req, res) => {
  try {
    const data = await blogsService.createBlog(req.body);
    return res.status(201).json(data);
  } catch (err) {
    return sendLegacyError(res, err);
  }
});

export const updateBlog = asyncHandler(async (req, res) => {
  try {
    const data = await blogsService.updateBlog(req.params.id, req.body);
    return res.status(200).json(data);
  } catch (err) {
    return sendLegacyError(res, err);
  }
});

export const deleteBlog = asyncHandler(async (req, res) => {
  try {
    await blogsService.deleteBlog(req.params.id);
    return res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    return sendLegacyError(res, err);
  }
});

export default {
  listBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog
};
