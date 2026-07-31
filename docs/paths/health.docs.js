/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Liveness check
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */

/**
 * @openapi
 * /ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness check (verifies Supabase configuration/client availability, no data mutation)
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessStatus'
 *       503:
 *         description: Service is not ready (Supabase not configured or client failed to initialize)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessStatus'
 */

/**
 * @openapi
 * /version:
 *   get:
 *     tags: [Health]
 *     summary: Application version information
 *     responses:
 *       200:
 *         description: Version details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VersionInfo'
 */

export {};
