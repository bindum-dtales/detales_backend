import fs from "fs/promises";
import path from "path";
import { getSupabaseClient } from "../../config/supabase.js";
import { env } from "../../config/env.js";

const packageJsonPath = path.resolve(process.cwd(), "package.json");

let cachedVersion = null;

async function readAppVersion() {
  if (cachedVersion) {
    return cachedVersion;
  }

  try {
    const raw = await fs.readFile(packageJsonPath, "utf8");
    const parsed = JSON.parse(raw);
    cachedVersion = parsed.version || "unknown";
  } catch {
    cachedVersion = "unknown";
  }

  return cachedVersion;
}

export function getHealth() {
  return {
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

export async function getReadiness() {
  const supabaseConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
  const supabaseClient = supabaseConfigured ? getSupabaseClient() : null;
  const ready = supabaseConfigured && Boolean(supabaseClient);

  return {
    ready,
    checks: {
      supabase: {
        configured: supabaseConfigured,
        clientInitialized: Boolean(supabaseClient)
      }
    },
    timestamp: new Date().toISOString()
  };
}

export async function getVersionInfo() {
  const version = await readAppVersion();

  return {
    version,
    node: process.version,
    environment: env.NODE_ENV
  };
}

export default {
  getHealth,
  getReadiness,
  getVersionInfo
};
