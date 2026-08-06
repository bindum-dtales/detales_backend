import { marked } from "marked";
import { createAttachmentResult } from "../AttachmentResult.js";

export async function render(file) {
  const text = file.buffer.toString("utf8");
  const html = marked.parse(text);

  return createAttachmentResult({
    type: "document",
    renderer: "markdown",
    viewer: "article",
    html,
    mime: file.mimetype ?? null,
    filename: file.originalname ?? null,
    storageUrl: file.storageUrl ?? null
  });
}

export default { render };
