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
 *               $ref: '#/components/schemas/UploadResult'
 *       400:
 *         description: Missing/invalid file, or a multer file-filter rejection (wrong mimetype). The multer rejection path uses the router-level legacy error shape; the missing-file case uses the standardized error shape.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/LegacyErrorResponse'
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
 *               $ref: '#/components/schemas/UploadResult'
 *       400:
 *         description: Missing/invalid file, or a multer file-filter rejection (must be .docx). The multer rejection path uses the router-level legacy error shape; the missing-file case uses the standardized error shape.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/LegacyErrorResponse'
 *       500:
 *         description: Storage not configured, or the upload to Supabase Storage failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export {};
