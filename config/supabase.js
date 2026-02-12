import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("SUPABASE_URL:", supabaseUrl ? "Loaded" : "Missing");
console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "Loaded" : "Missing");

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.error("Supabase environment variables missing at runtime");
}

export { supabase };
