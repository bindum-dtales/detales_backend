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
 *     summary: Create a portfolio item. Exactly one of `link` or `content` must be provided.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, capability, subcategory]
 *             properties:
 *               title: { type: string }
 *               link: { type: string, description: "External project link. Mutually exclusive with content." }
 *               content: { type: string, nullable: true, description: "HTML document body (converted from DOCX client-side). Mutually exclusive with link." }
 *               capability: { type: string }
 *               subcategory: { type: string }
 *               cover_image_url: { type: string, nullable: true }
 *               company_name: { type: string, nullable: true }
 *               description: { type: string, nullable: true }
 *               featured: { type: boolean }
 *     responses:
 *       201:
 *         description: Portfolio item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioItemResponse'
 *       400:
 *         description: Missing required fields, or link/content provided together or neither provided
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
 */

/**
 * @openapi
 * /api/portfolio/{id}:
 *   put:
 *     tags: [Portfolio]
 *     summary: Update a portfolio item. Setting `link` clears any stored `content` and vice versa; omitting both leaves the existing value untouched.
 *     parameters:
 *       - $ref: '#/components/parameters/PortfolioId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, capability, subcategory]
 *             properties:
 *               title: { type: string }
 *               link: { type: string, description: "External project link. Mutually exclusive with content." }
 *               content: { type: string, nullable: true, description: "HTML document body. Mutually exclusive with link." }
 *               capability: { type: string }
 *               subcategory: { type: string }
 *               cover_image_url: { type: string, nullable: true }
 *               company_name: { type: string, nullable: true }
 *               description: { type: string, nullable: true }
 *               featured: { type: boolean }
 *               published: { type: boolean }
 *     responses:
 *       200:
 *         description: Portfolio item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioItemResponse'
 *       400:
 *         description: Missing id parameter, missing title/capability/subcategory, or link/content provided together or neither resolves
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
