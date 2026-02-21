import { createClient } from "@supabase/supabase-js";

let supabase = null;

export function getSupabaseClient() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables missing");
  }

  supabase = createClient(url, key);
  return supabase;
}

export function getSupabaseBucket() {
  const bucket = process.env.SUPABASE_BUCKET;
  if (!bucket) {
    throw new Error("SUPABASE_BUCKET environment variable missing");
  }
  return bucket;
}
