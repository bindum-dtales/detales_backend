/**
 * @openapi
 * /api/blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: List published blogs (served from the JSON cache)
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogListResponse'
 *   post:
 *     tags: [Blogs]
 *     summary: Create a blog
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
 *         description: Blog created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogResponse'
 *       400:
 *         description: Missing/invalid title or content
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
 * /api/blogs/public:
 *   get:
 *     tags: [Blogs]
 *     summary: List published blogs (identical to GET /api/blogs)
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogListResponse'
 */

/**
 * @openapi
 * /api/blogs/{id}:
 *   get:
 *     tags: [Blogs]
 *     summary: Get a single blog by id
 *     parameters:
 *       - $ref: '#/components/parameters/BlogId'
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogResponse'
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Blogs]
 *     summary: Update a blog
 *     parameters:
 *       - $ref: '#/components/parameters/BlogId'
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
 *         description: Blog updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogResponse'
 *       400:
 *         description: Missing/invalid title or content
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
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Blogs]
 *     summary: Delete a blog
 *     parameters:
 *       - $ref: '#/components/parameters/BlogId'
 *     responses:
 *       200:
 *         description: Blog deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogDeleteResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * components:
 *   parameters:
 *     BlogId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 */

export {};
