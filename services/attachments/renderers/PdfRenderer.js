import { createAttachmentResult } from "../AttachmentResult.js";

// No conversion — PDFs are rendered client-side by a PDF viewer against
// storageUrl, so this just signals that intent.
export async function render(file) {
  return createAttachmentResult({
    type: "document",
    renderer: "pdf",
    viewer: "pdf",
    mime: file.mimetype ?? "application/pdf",
    filename: file.originalname ?? null,
    storageUrl: file.storageUrl ?? null
  });
}

export default { render };
