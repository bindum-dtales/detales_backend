export function buildImagePath(originalName, timestamp = Date.now()) {
  return `images/${timestamp}-${originalName}`;
}

export function buildDocxPath(originalName, timestamp = Date.now()) {
  return `docs/${timestamp}-${originalName}`;
}

export function toUploadResponse(publicUrl) {
  return { url: publicUrl };
}

export default {
  buildImagePath,
  buildDocxPath,
  toUploadResponse
};
