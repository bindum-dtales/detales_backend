import { getSupabaseClient } from "../../config/supabase.js";
import { runSupabaseQuery } from "../../utils/supabaseQuery.js";
import logger from "../../utils/logger.js";
import services from "../../constants/services.js";

const SUPABASE_TIMEOUT_MS = 5000;
const TABLE = "portfolio";
const SELECT_COLUMNS = "id, title, category, cover_image_url, link";

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
    service: services.PORTFOLIO,
    operation,
    error
  });
}

async function runQuery(queryFactory, label) {
  try {
    return await runSupabaseQuery(queryFactory, { timeoutMs: SUPABASE_TIMEOUT_MS });
  } catch (error) {
    logDbFailure(label, error);
    throw error;
  }
}

export async function fetchPublishedPortfolio() {
  const supabase = getClientOrThrow();

  return runQuery(
    () =>
      supabase
        .from(TABLE)
        .select(SELECT_COLUMNS)
        .eq("published", true)
        .order("created_at", { ascending: false }),
    "fetchPublishedPortfolio"
  );
}

export async function findPortfolioById(id) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).select("id").eq("id", id).single(),
    "findPortfolioById"
  );
}

export async function insertPortfolio(payload) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).insert([payload]).select().single(),
    "insertPortfolio"
  );
}

export async function updatePortfolio(id, payload) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).update(payload).eq("id", id).select().single(),
    "updatePortfolio"
  );
}

export async function deletePortfolio(id) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).delete().eq("id", id).select().single(),
    "deletePortfolio"
  );
}

export default {
  getClient,
  fetchPublishedPortfolio,
  findPortfolioById,
  insertPortfolio,
  updatePortfolio,
  deletePortfolio
};
