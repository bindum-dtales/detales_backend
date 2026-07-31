import path from "path";
import { createFileCache } from "../shared/fileCache.js";
import services from "../../constants/services.js";

const CACHE_DIR = path.resolve(process.cwd(), "cache");

const cache = await createFileCache({
  cacheDir: CACHE_DIR,
  fileName: "case_studies.json",
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
