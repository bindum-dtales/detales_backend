export async function runSupabaseQuery(queryFactory, { timeoutMs = 5000 } = {}) {
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
