/**
 * @openapi
 * /api/case-studies:
 *   get:
 *     tags: [Case Studies]
 *     summary: List published case studies (served from the JSON cache)
 *     responses:
 *       200:
 *         description: Array of case studies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CaseStudy'
 *   post:
 *     tags: [Case Studies]
 *     summary: Create a case study
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string }
 *               content: { type: string, description: "HTML string, or an object with an html field" }
 *               cover_image_url: { type: string, nullable: true }
 *               published: { type: boolean }
 *     responses:
 *       201:
 *         description: Case study created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaseStudy'
 *       400:
 *         description: Missing/invalid title or content. Rejected by the router-level field validator before reaching the controller, so it returns the legacy error shape rather than the standardized one.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LegacyErrorResponse'
 */

/**
 * @openapi
 * /api/case-studies/public:
 *   get:
 *     tags: [Case Studies]
 *     summary: List published case studies (identical to GET /api/case-studies)
 *     responses:
 *       200:
 *         description: Array of case studies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CaseStudy'
 */

/**
 * @openapi
 * /api/case-studies/{id}:
 *   get:
 *     tags: [Case Studies]
 *     summary: Get a single case study by id
 *     parameters:
 *       - $ref: '#/components/parameters/CaseStudyId'
 *     responses:
 *       200:
 *         description: The case study
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaseStudy'
 *       404:
 *         description: Case study not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Case Studies]
 *     summary: Update a case study
 *     parameters:
 *       - $ref: '#/components/parameters/CaseStudyId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               cover_image_url: { type: string, nullable: true }
 *               published: { type: boolean }
 *     responses:
 *       200:
 *         description: Case study updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaseStudy'
 *       400:
 *         description: Missing/invalid title or content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Case study not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Case Studies]
 *     summary: Delete a case study
 *     parameters:
 *       - $ref: '#/components/parameters/CaseStudyId'
 *     responses:
 *       200:
 *         description: Case study deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Case study deleted successfully" }
 *       404:
 *         description: Case study not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * components:
 *   parameters:
 *     CaseStudyId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 */

export {};
