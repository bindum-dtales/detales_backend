import { getSupabaseClient } from "../../config/supabase.js";
import { env } from "../../config/env.js";
import { runSupabaseQuery } from "../../utils/supabaseQuery.js";
import logger from "../../utils/logger.js";
import services from "../../constants/services.js";

export function getClient() {
  return getSupabaseClient();
}

export function getBucket() {
  return env.SUPABASE_BUCKET;
}

function logStorageFailure(operation, error) {
  logger.error("Supabase storage operation failed", {
    service: services.UPLOADS,
    operation,
    error
  });
}

export async function uploadFile({ bucket, path, buffer, contentType, upsert }) {
  const supabase = getSupabaseClient();

  try {
    return await runSupabaseQuery(() =>
      supabase.storage.from(bucket).upload(path, buffer, {
        contentType,
        ...(upsert !== undefined ? { upsert } : {})
      })
    );
  } catch (error) {
    logStorageFailure("uploadFile", error);
    throw error;
  }
}

export function getPublicUrl({ bucket, path }) {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data;
}

export default {
  getClient,
  getBucket,
  uploadFile,
  getPublicUrl
};
