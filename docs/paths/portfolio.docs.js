/**
 * @openapi
 * /api/portfolio:
 *   get:
 *     tags: [Portfolio]
 *     summary: List published portfolio items (served from the JSON cache)
 *     responses:
 *       200:
 *         description: Array of portfolio items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PortfolioItem'
 *   post:
 *     tags: [Portfolio]
 *     summary: Create a portfolio item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               link: { type: string }
 *               category: { type: string }
 *               cover_image_url: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Portfolio item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioItem'
 */

/**
 * @openapi
 * /api/portfolio/{id}:
 *   put:
 *     tags: [Portfolio]
 *     summary: Update a portfolio item
 *     parameters:
 *       - $ref: '#/components/parameters/PortfolioId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, link, category]
 *             properties:
 *               title: { type: string }
 *               link: { type: string }
 *               category: { type: string }
 *               cover_image_url: { type: string, nullable: true }
 *               published: { type: boolean }
 *     responses:
 *       200:
 *         description: Portfolio item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Portfolio item updated successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/PortfolioItem'
 *       400:
 *         description: Missing id parameter, or missing title/link/category. Both checks are router-level validators, so they return the legacy error shape.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LegacyErrorResponse'
 *       404:
 *         description: Portfolio item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Portfolio]
 *     summary: Delete a portfolio item
 *     parameters:
 *       - $ref: '#/components/parameters/PortfolioId'
 *     responses:
 *       200:
 *         description: Portfolio item deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Portfolio item deleted successfully" }
 *                 deleted:
 *                   $ref: '#/components/schemas/PortfolioItem'
 *       400:
 *         description: Missing id parameter. Router-level validator, returns the legacy error shape.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LegacyErrorResponse'
 *       404:
 *         description: Portfolio item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * components:
 *   parameters:
 *     PortfolioId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 */

export {};
