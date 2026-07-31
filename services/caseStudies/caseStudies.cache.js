import path from "path";
import { createFileCache } from "../shared/fileCache.js";
import services from "../../constants/services.js";
import { cacheConfig } from "../../config/appConfig.js";

const CACHE_DIR = path.resolve(process.cwd(), cacheConfig.dir);

const cache = await createFileCache({
  cacheDir: CACHE_DIR,
  fileName: cacheConfig.files.caseStudies,
  service: services.CASE_STUDIES
});

export const writeCaseStudies = cache.write;
export const clearCaseStudies = cache.clear;
export const loadCaseStudies = cache.load;
export const revalidateInBackground = cache.revalidateInBackground;

export default {
  writeCaseStudies,
  clearCaseStudies,
  loadCaseStudies,
  revalidateInBackground
};
