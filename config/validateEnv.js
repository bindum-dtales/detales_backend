export function validateEnv(vars, requiredKeys) {
  const missing = requiredKeys.filter((key) => !vars[key]);

  if (missing.length > 0) {
    console.error(`[ENV ERROR] Missing required environment variable(s): ${missing.join(", ")}`);
    process.exit(1);
  }
}

export default validateEnv;
