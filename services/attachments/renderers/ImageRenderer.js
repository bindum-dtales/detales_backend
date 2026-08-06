import { createAttachmentResult } from "../AttachmentResult.js";

// No conversion — images are rendered client-side in a lightbox against
// storageUrl, so this just signals that intent.
export async function render(file) {
  return createAttachmentResult({
    type: "image",
    renderer: "image",
    viewer: "lightbox",
    mime: file.mimetype ?? null,
    filename: file.originalname ?? null,
    storageUrl: file.storageUrl ?? null
  });
}

export default { render };
