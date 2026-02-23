import { createClient } from "@supabase/supabase-js";

let cachedClient = null;

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Supabase env variables missing.");
    return null;
  }

  if (!url.startsWith("https://")) {
    console.error("SUPABASE_URL must start with https://");
    console.error("Current value:", url);
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key);
      console.log("Supabase client initialized successfully.");
    } catch (err) {
      console.error("Supabase client init failed:", err);
      return null;
    }
  }

  return cachedClient;
}
