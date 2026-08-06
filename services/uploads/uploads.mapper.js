export function buildImagePath(originalName, timestamp = Date.now()) {
  return `images/${timestamp}-${originalName}`;
}

export function buildDocxPath(originalName, timestamp = Date.now()) {
  return `docs/${timestamp}-${originalName}`;
}

// Single source of truth for the portfolio attachment field: reused by the
// multer fileFilter (validation) and by attachment category detection
// (response metadata), so the allowlist is never duplicated.
const DOCUMENT_EXTENSIONS = new Set([
  "doc", "docx", "pdf", "txt", "rtf", "md", "csv",
  "xls", "xlsx", "odt", "ods", "xml", "json", "yaml", "yml"
]);

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "avif", "tif", "tiff"
]);

export function getFileExtension(originalName = "") {
  const match = /\.([^.]+)$/.exec(originalName);
  return match ? match[1].toLowerCase() : "";
}

// "document" | "image" | null (unsupported extension)
export function detectAttachmentType(originalName) {
  const ext = getFileExtension(originalName);

  if (IMAGE_EXTENSIONS.has(ext)) {
    return "image";
  }

  if (DOCUMENT_EXTENSIONS.has(ext)) {
    return "document";
  }

  return null;
}

export function isAllowedAttachment(originalName) {
  return detectAttachmentType(originalName) !== null;
}

export function toUploadResponse(publicUrl, attachment) {
  const response = { url: publicUrl };

  if (attachment) {
    response.attachmentUrl = publicUrl;
    response.attachmentMime = attachment.mimeType ?? null;
    response.attachmentType = attachment.attachmentType ?? null;
    response.attachmentName = attachment.originalName ?? null;
  }

  return response;
}

export default {
  buildImagePath,
  buildDocxPath,
  getFileExtension,
  detectAttachmentType,
  isAllowedAttachment,
  toUploadResponse
};
