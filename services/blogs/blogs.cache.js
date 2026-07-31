import path from "path";
import { createFileCache } from "../shared/fileCache.js";
import services from "../../constants/services.js";
import { cacheConfig } from "../../config/appConfig.js";

const CACHE_DIR = path.resolve(process.cwd(), cacheConfig.dir);

const cache = await createFileCache({
  cacheDir: CACHE_DIR,
  fileName: cacheConfig.files.blogs,
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
