import { createClient } from "@supabase/supabase-js";

// Lazy initialization cache
let cachedClient = null;
let initializationAttempted = false;

/**
 * Lazily initialize and return Supabase client
 * @returns {object|null} Supabase client or null if env vars missing
 */
export function getSupabaseClient() {
  // Return cached client if already initialized
  if (initializationAttempted) {
    return cachedClient;
  }

  // Mark that we've attempted initialization
  initializationAttempted = true;

  // Read environment variables at runtime
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase initialization failed:");
    console.error("   SUPABASE_URL:", supabaseUrl ? "✓ Loaded" : "✗ Missing");
    console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✓ Loaded" : "✗ Missing");
    return null;
  }

  // Create and cache the client
  try {
    cachedClient = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase client initialized successfully");
    return cachedClient;
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error.message);
    return null;
  }
}

/**
 * Get status of Supabase environment variables
 * @returns {object} Status object with boolean flags
 */
export function getSupabaseStatus() {
  return {
    supabaseUrlLoaded: !!process.env.SUPABASE_URL,
    supabaseKeyLoaded: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

// Legacy export for backwards compatibility
// Routes should migrate to getSupabaseClient()
export const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Supabase client not initialized. Check environment variables.");
    }
    return client[prop];
  }
});
