import path from "path";
import { createFileCache } from "../shared/fileCache.js";
import services from "../../constants/services.js";

const CACHE_DIR = path.resolve(process.cwd(), "cache");

const cache = await createFileCache({
  cacheDir: CACHE_DIR,
  fileName: "blogs.json",
  service: services.BLOGS
});

export const writeBlogs = cache.write;
export const clearBlogs = cache.clear;
export const loadBlogs = cache.load;
export const revalidateInBackground = cache.revalidateInBackground;

export default {
  writeBlogs,
  clearBlogs,
  loadBlogs,
  revalidateInBackground
};
