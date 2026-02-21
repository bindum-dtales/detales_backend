import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://upkfbqjlrlufflknkv.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwa2ZidHFsanJybHVmZmxrbmt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk4ODIwOCwiZXhwIjoyMDg0NTY0MjA4fQ.wIQe5KZAZFdKst5s1v9TbH844D0xqHpoOFstVTUnOUM";
const SUPABASE_BUCKET = "dtales-media";

let client = null;

export function getSupabaseClient() {
  if (client) return client;

  client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  return client;
}

export function getSupabaseBucket() {
  return SUPABASE_BUCKET;
}
