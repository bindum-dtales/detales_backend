import fs from "fs/promises";
import path from "path";
import logger from "../../utils/logger.js";

export async function createFileCache({ cacheDir, fileName, service }) {
  const cacheFile = path.join(cacheDir, fileName);

  let memoryCache = null;
  let isRevalidating = false;

  async function readCacheFile() {
    try {
      const raw = await fs.readFile(cacheFile, "utf8");
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (parsed && Array.isArray(parsed.data)) {
        return parsed.data;
      }

      return null;
    } catch (error) {
      if (error.code !== "ENOENT") {
        logger.error("Cache read failed", { service, operation: "readCacheFile", error });
      }
      return null;
    }
  }

  const initial = await readCacheFile();

  if (Array.isArray(initial)) {
    memoryCache = initial;
  }

  async function write(data) {
    try {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(data, null, 2), "utf8");
      memoryCache = data;
      logger.info("Cache written", { service, count: Array.isArray(data) ? data.length : 0 });
    } catch (error) {
      logger.error("Cache write failed", { service, operation: "write", error });
    }
  }

  async function clear() {
    memoryCache = null;

    try {
      await fs.unlink(cacheFile);
    } catch (error) {
      if (error.code !== "ENOENT") {
        logger.error("Cache clear failed", { service, operation: "clear", error });
      }
    }
  }

  async function load() {
    const diskCache = await readCacheFile();

    if (Array.isArray(diskCache)) {
      if (diskCache.length > 0) {
        memoryCache = diskCache;
        return diskCache;
      }

      const reloadedCache = await readCacheFile();

      if (Array.isArray(reloadedCache) && reloadedCache.length > 0) {
        memoryCache = reloadedCache;
        return reloadedCache;
      }

      return [];
    }

    if (Array.isArray(memoryCache)) {
      return memoryCache;
    }

    return [];
  }

  function revalidateInBackground(refreshFn) {
    if (isRevalidating || typeof refreshFn !== "function") {
      return;
    }

    isRevalidating = true;

    (async () => {
      try {
        await refreshFn();
      } catch (error) {
        logger.error("Background revalidation failed", { service, operation: "revalidateInBackground", error });
      } finally {
        isRevalidating = false;
      }
    })();
  }

  return { write, clear, load, revalidateInBackground };
}

export default createFileCache;
