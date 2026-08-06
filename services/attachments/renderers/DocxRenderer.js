import mammoth from "mammoth";
import { createAttachmentResult } from "../AttachmentResult.js";

// Real DOCX -> HTML conversion via mammoth. Note: this is new server-side
// behavior — no server-side DOCX rendering existed in this backend before;
// the frontend has been converting DOCX to HTML client-side. This renderer
// is not wired into any live route yet.
export async function render(file) {
  const { value: html } = await mammoth.convertToHtml({ buffer: file.buffer });

  return createAttachmentResult({
    type: "document",
    renderer: "docx",
    viewer: "article",
    html,
    mime: file.mimetype ?? null,
    filename: file.originalname ?? null,
    storageUrl: file.storageUrl ?? null
  });
}

export default { render };
