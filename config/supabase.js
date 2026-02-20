import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("ENV CHECK:");
  console.log("SUPABASE_URL:", supabaseUrl ? "Loaded" : "Missing");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "Loaded" : "Missing");

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

export function getSupabaseStatus() {
  return {
    supabaseUrlLoaded: !!process.env.SUPABASE_URL,
    supabaseKeyLoaded: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}
