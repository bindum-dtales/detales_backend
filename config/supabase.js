import { createClient } from "@supabase/supabase-js";
import logger from "../utils/logger.js";

let cachedClient = null;

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    logger.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.", {
      service: "supabase",
      operation: "getSupabaseClient"
    });
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key);
      logger.info("Supabase client initialized successfully.", { service: "supabase" });
    } catch (err) {
      logger.error("Supabase client init failed", {
        service: "supabase",
        operation: "getSupabaseClient",
        error: err
      });
      return null;
    }
  }

  return cachedClient;
}
