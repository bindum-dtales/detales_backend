import { getSupabaseClient } from "../../config/supabase.js";
import { runSupabaseQuery } from "../../utils/supabaseQuery.js";
import logger from "../../utils/logger.js";
import services from "../../constants/services.js";
import { supabaseConfig } from "../../config/appConfig.js";

const TABLE = "blogs";

function getClientOrThrow() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }

  return supabase;
}

export function getClient() {
  return getSupabaseClient();
}

function logDbFailure(operation, error) {
  logger.error("Supabase operation failed", {
    service: services.BLOGS,
    operation,
    error
  });
}

async function runQuery(queryFactory, label) {
  try {
    return await runSupabaseQuery(queryFactory, { timeoutMs: supabaseConfig.timeoutMs });
  } catch (error) {
    logDbFailure(label, error);
    throw error;
  }
}

export async function fetchPublishedBlogs() {
  const supabase = getClientOrThrow();

  return runQuery(
    () =>
      supabase
        .from(TABLE)
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false }),
    "fetchPublishedBlogs"
  );
}

export async function findBlogById(id) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).select("*").eq("id", id).single(),
    "findBlogById"
  );
}

export async function insertBlog(payload) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).insert([payload]).select().single(),
    "insertBlog"
  );
}

export async function updateBlog(id, payload) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).update(payload).eq("id", id).select().single(),
    "updateBlog"
  );
}

export async function deleteBlog(id) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).delete().eq("id", id).select("id"),
    "deleteBlog"
  );
}

export default {
  getClient,
  fetchPublishedBlogs,
  findBlogById,
  insertBlog,
  updateBlog,
  deleteBlog
};
