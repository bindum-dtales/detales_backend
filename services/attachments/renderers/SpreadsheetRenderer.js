import { createAttachmentResult } from "../AttachmentResult.js";

// No conversion — csv/xls/xlsx/ods are rendered client-side by a table
// preview against storageUrl, so this just signals that intent.
export async function render(file) {
  return createAttachmentResult({
    type: "spreadsheet",
    renderer: "spreadsheet",
    viewer: "table",
    mime: file.mimetype ?? null,
    filename: file.originalname ?? null,
    storageUrl: file.storageUrl ?? null
  });
}

export default { render };
