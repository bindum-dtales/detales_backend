import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (url && key) {
  supabase = createClient(url, key);
} else {
  console.warn("⚠ Supabase not configured properly.");
}

export default supabase;
