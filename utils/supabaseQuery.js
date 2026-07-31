import { supabaseConfig } from "../config/appConfig.js";

export async function runSupabaseQuery(queryFactory, { timeoutMs = supabaseConfig.timeoutMs } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let query = queryFactory(controller.signal);

    if (query && typeof query.abortSignal === "function") {
      query = query.abortSignal(controller.signal);
    }

    const result = await query;

    if (result.error) {
      throw result.error;
    }

    return result.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default runSupabaseQuery;
