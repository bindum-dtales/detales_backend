import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";
import httpStatus from "../../constants/httpStatus.js";
import errorCodes from "../../constants/errorCodes.js";
import services from "../../constants/services.js";
import { retryAsync } from "../../utils/retry.js";
import * as blogsRepository from "./blogs.repository.js";
import * as blogsCache from "./blogs.cache.js";
import * as blogsMapper from "./blogs.mapper.js";
import { validateBlogFields } from "../../validators/blogs.validator.js";

const SUPABASE_RETRIES = 3;
const SUPABASE_RETRY_DELAY_MS = 1000;

function assertSupabaseConfigured() {
  const supabase = blogsRepository.getClient();

  if (!supabase) {
    throw new AppError("Supabase not configured", {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      service: services.BLOGS,
      code: errorCodes.SERVICE_UNAVAILABLE
    });
  }
}

async function withRetry(operation, { label }) {
  return retryAsync(operation, {
    attempts: SUPABASE_RETRIES,
    delayMs: SUPABASE_RETRY_DELAY_MS,
    onRetry: ({ attempt, error }) => {
      logger.warn("Supabase retry", {
        service: services.BLOGS,
        operation: label,
        attempt,
        error: error.message
      });
    }
  });
}

function toGenericFailure(error) {
  return new AppError(error.message, {
    status: httpStatus.INTERNAL_SERVER_ERROR,
    service: services.BLOGS,
    code: errorCodes.INTERNAL_ERROR
  });
}

export async function getBlogs() {
  const data = await blogsCache.loadBlogs();

  logger.info("Blogs read from cache", { service: services.BLOGS, count: data.length });

  return data;
}

export async function getBlogById(id) {
  const cachedData = await blogsCache.loadBlogs();

  if (Array.isArray(cachedData)) {
    const cachedItem = cachedData.find((item) => String(item.id) === String(id));
    if (cachedItem) {
      return cachedItem;
    }
  }

  const reloadedData = await blogsCache.loadBlogs();
  const reloadedItem = Array.isArray(reloadedData)
    ? reloadedData.find((item) => String(item.id) === String(id))
    : null;

  if (reloadedItem) {
    return reloadedItem;
  }

  throw new AppError("Blog not found", {
    status: httpStatus.NOT_FOUND,
    service: services.BLOGS,
    code: errorCodes.NOT_FOUND
  });
}

export async function refreshBlogsCache() {
  assertSupabaseConfigured();

  let rows;
  try {
    rows = await withRetry(() => blogsRepository.fetchPublishedBlogs(), { label: "fetchPublishedBlogs" });
  } catch (error) {
    throw toGenericFailure(error);
  }

  const mapped = blogsMapper.normalizeBlogList(rows || []);
  await blogsCache.writeBlogs(mapped);

  logger.info("Blogs cache refreshed", { service: services.BLOGS, count: mapped.length });

  return mapped;
}

export async function createBlog(payload) {
  assertSupabaseConfigured();

  const title = ((payload && payload.title) || "").toString().trim();
  const content = blogsMapper.extractContent(payload && payload.content);
  const cover_image_url = (payload && payload.cover_image_url) ?? null;
  const published = (payload && payload.published) === true;

  const validationError = validateBlogFields({ title, content });

  if (validationError) {
    throw new AppError(validationError, {
      status: httpStatus.BAD_REQUEST,
      service: services.BLOGS,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  const excerpt = blogsMapper.buildExcerpt(content, 200);

  let record;
  try {
    record = await withRetry(
      () => blogsRepository.insertBlog({ title, excerpt, content, cover_image_url, published }),
      { label: "insertBlog" }
    );
  } catch (error) {
    throw toGenericFailure(error);
  }

  await blogsCache.clearBlogs();

  logger.info("Blog created", { service: services.BLOGS, id: record?.id });

  return blogsMapper.normalizeBlog(record);
}

export async function updateBlog(id, payload) {
  assertSupabaseConfigured();

  let current;
  try {
    current = await withRetry(() => blogsRepository.findBlogById(id), { label: "findBlogById" });
  } catch (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Blog not found", {
        status: httpStatus.NOT_FOUND,
        service: services.BLOGS,
        code: errorCodes.NOT_FOUND
      });
    }
    throw toGenericFailure(error);
  }

  const title = (((payload && payload.title) ?? current.title) || "").toString().trim();
  const contentRaw = blogsMapper.extractContent(payload && payload.content);
  const content = contentRaw !== "" ? contentRaw : current.content || "";
  const cover_image_url =
    payload && payload.cover_image_url !== undefined ? payload.cover_image_url : current.cover_image_url ?? null;
  const published =
    payload && typeof payload.published === "boolean" ? payload.published : current.published === true;

  const validationError = validateBlogFields({ title, content });

  if (validationError) {
    throw new AppError(validationError, {
      status: httpStatus.BAD_REQUEST,
      service: services.BLOGS,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  const excerpt = blogsMapper.buildExcerpt(content, 200);

  let record;
  try {
    record = await withRetry(
      () =>
        blogsRepository.updateBlog(id, {
          title,
          excerpt,
          content,
          cover_image_url,
          published,
          updated_at: new Date().toISOString()
        }),
      { label: "updateBlog" }
    );
  } catch (error) {
    throw toGenericFailure(error);
  }

  await blogsCache.clearBlogs();

  logger.info("Blog updated", { service: services.BLOGS, id });

  return blogsMapper.normalizeBlog(record);
}

export async function deleteBlog(id) {
  assertSupabaseConfigured();

  let record;
  try {
    record = await withRetry(() => blogsRepository.deleteBlog(id), { label: "deleteBlog" });
  } catch (error) {
    throw toGenericFailure(error);
  }

  if (!record || record.length === 0) {
    throw new AppError("Blog not found", {
      status: httpStatus.NOT_FOUND,
      service: services.BLOGS,
      code: errorCodes.NOT_FOUND
    });
  }

  await blogsCache.clearBlogs();

  logger.info("Blog deleted", { service: services.BLOGS, id });
}

export default {
  getBlogs,
  getBlogById,
  refreshBlogsCache,
  createBlog,
  updateBlog,
  deleteBlog
};
