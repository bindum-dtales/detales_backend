import { createClient } from "@supabase/supabase-js";

let cachedClient = null;

export function getSupabaseClient() {
  const url =
    process.env.SUPABASE_URL ||
    "https://upkfbqljrnlufflknkv.supabase.co";

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwa2ZidHFsanJubHVmZmxrbmt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk4ODIwOCwiZXhwIjoyMDg0NTY0MjA4fQ.wIQe5KZAZFdKst5s1v9TbH844D0xqHpoOFstVTUnOUM";

  if (!url || !key) {
    console.warn("Supabase environment variables missing.");
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key);
  }

  return cachedClient;
}
