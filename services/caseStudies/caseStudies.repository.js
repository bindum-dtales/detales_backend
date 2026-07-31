import { getSupabaseClient } from "../../config/supabase.js";
import { runSupabaseQuery } from "../../utils/supabaseQuery.js";
import logger from "../../utils/logger.js";
import services from "../../constants/services.js";

const SUPABASE_TIMEOUT_MS = 5000;
const TABLE = "case_studies";

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
    service: services.CASE_STUDIES,
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

export async function fetchPublishedCaseStudies() {
  const supabase = getClientOrThrow();

  return runQuery(
    () =>
      supabase
        .from(TABLE)
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false }),
    "fetchPublishedCaseStudies"
  );
}

export async function findCaseStudyById(id) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).select("*").eq("id", id).single(),
    "findCaseStudyById"
  );
}

export async function insertCaseStudy(payload) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).insert([payload]).select().single(),
    "insertCaseStudy"
  );
}

export async function updateCaseStudy(id, payload) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).update(payload).eq("id", id).select().single(),
    "updateCaseStudy"
  );
}

export async function deleteCaseStudy(id) {
  const supabase = getClientOrThrow();

  return runQuery(
    () => supabase.from(TABLE).delete().eq("id", id).select("id"),
    "deleteCaseStudy"
  );
}

export default {
  getClient,
  fetchPublishedCaseStudies,
  findCaseStudyById,
  insertCaseStudy,
  updateCaseStudy,
  deleteCaseStudy
};
