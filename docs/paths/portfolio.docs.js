/**
 * @openapi
 * /api/portfolio:
 *   get:
 *     tags: [Portfolio]
 *     summary: List published portfolio items (served from the JSON cache)
 *     responses:
 *       200:
 *         description: Portfolio items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioListResponse'
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
 *               $ref: '#/components/schemas/PortfolioItemResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *               $ref: '#/components/schemas/PortfolioItemResponse'
 *       400:
 *         description: Missing id parameter, or missing title/link/category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Portfolio item deleted (the deleted record is returned under `data`)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioItemResponse'
 *       400:
 *         description: Missing id parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
