import path from "path";
import { createFileCache } from "../shared/fileCache.js";
import services from "../../constants/services.js";

const CACHE_DIR = path.resolve(process.cwd(), "cache");

const cache = await createFileCache({
  cacheDir: CACHE_DIR,
  fileName: "portfolio.json",
  service: services.PORTFOLIO
});

export const writePortfolio = cache.write;
export const clearPortfolio = cache.clear;
export const loadPortfolio = cache.load;
export const revalidateInBackground = cache.revalidateInBackground;

export default {
  writePortfolio,
  clearPortfolio,
  loadPortfolio,
  revalidateInBackground
};
