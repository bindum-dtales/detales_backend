import { createAttachmentResult } from "../AttachmentResult.js";

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Plain text -> semantic HTML: consecutive non-blank lines become one <p>
// (joined with <br> to preserve line breaks within a paragraph); each blank
// line becomes its own marker paragraph so blank lines are preserved
// visually rather than being silently collapsed.
export function textToHtml(text) {
  const normalized = String(text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  const htmlParts = [];
  let currentParagraphLines = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const paragraphHtml = currentParagraphLines.map(escapeHtml).join("<br>");
      htmlParts.push(`<p>${paragraphHtml}</p>`);
      currentParagraphLines = [];
    }
  };

  for (const line of lines) {
    if (line.trim() === "") {
      flushParagraph();
      htmlParts.push('<p class="blank-line">&nbsp;</p>');
    } else {
      currentParagraphLines.push(line);
    }
  }

  flushParagraph();

  return htmlParts.join("\n");
}

export async function render(file) {
  const text = file.buffer.toString("utf8");
  const html = textToHtml(text);

  return createAttachmentResult({
    type: "document",
    renderer: "text",
    viewer: "article",
    html,
    mime: file.mimetype ?? null,
    filename: file.originalname ?? null,
    storageUrl: file.storageUrl ?? null
  });
}

export default { render, textToHtml };
