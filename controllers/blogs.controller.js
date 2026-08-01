import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as blogsService from "../services/blogs/blogs.service.js";
import { sendSuccess } from "../utils/response.js";

export const listBlogs = asyncHandler(async (req, res) => {
  const data = await blogsService.getBlogs();

  logger.info("Blogs served", {
    service: services.BLOGS,
    endpoint: req.originalUrl,
    count: data.length
  });

  return sendSuccess(res, { status: 200, message: "Blogs retrieved successfully", data: data || [] });
});

export const getBlog = asyncHandler(async (req, res) => {
  const data = await blogsService.getBlogById(req.params.id);
  return sendSuccess(res, { status: 200, message: "Blog retrieved successfully", data });
});

export const createBlog = asyncHandler(async (req, res) => {
  const data = await blogsService.createBlog(req.body);
  return sendSuccess(res, { status: 201, message: "Blog created successfully", data });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const data = await blogsService.updateBlog(req.params.id, req.body);
  return sendSuccess(res, { status: 200, message: "Blog updated successfully", data });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  await blogsService.deleteBlog(req.params.id);
  return sendSuccess(res, { status: 200, message: "Blog deleted successfully", data: null });
});

export default {
  listBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog
};
