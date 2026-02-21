import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  console.log("ENV CHECK:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables missing");
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}
