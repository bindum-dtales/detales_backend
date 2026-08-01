/**
 * @openapi
 * /api/uploads/image:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload an image directly to Supabase Storage
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload succeeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResultResponse'
 *       400:
 *         description: Missing/invalid file, or a multer file-filter rejection (wrong mimetype)
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
 *       500:
 *         description: Storage not configured, or the upload to Supabase Storage failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/uploads/docx:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload a DOCX document directly to Supabase Storage
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload succeeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResultResponse'
 *       400:
 *         description: Missing/invalid file, or a multer file-filter rejection (must be .docx)
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
 *       500:
 *         description: Storage not configured, or the upload to Supabase Storage failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export {};
