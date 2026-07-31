import { createRequire } from "module";
import validateEnv from "./validateEnv.js";

const require = createRequire(import.meta.url);
require("dotenv").config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 10000,
  FRONTEND_URL: process.env.FRONTEND_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET
};

export const isProduction = env.NODE_ENV === "production";

const requiredKeys = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

if (isProduction) {
  requiredKeys.push("FRONTEND_URL");
}

validateEnv(env, requiredKeys);

export default env;
