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
 *     summary: Upload a portfolio attachment (document or image) directly to Supabase Storage
 *     description: >
 *       Accepts one attachment field covering both documents
 *       (doc, docx, pdf, txt, rtf, md, csv, xls, xlsx, odt, ods, xml, json, yaml, yml)
 *       and images (jpg, jpeg, png, webp, gif, bmp, svg, avif, tif, tiff).
 *       Files are stored as-is; no server-side conversion happens for any type.
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
 *         description: Missing/invalid file, or a multer file-filter rejection (unsupported extension)
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
