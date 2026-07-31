function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryAsync(operation, { attempts = 3, delayMs = 1000, onRetry } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      if (onRetry) {
        onRetry({ attempt, attempts, error, willRetry: attempt < attempts });
      }

      if (attempt < attempts) {
        await wait(delayMs);
      }
    }
  }

  throw lastError;
}

export default retryAsync;
