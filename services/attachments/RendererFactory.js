import AppError from "../../utils/AppError.js";
import httpStatus from "../../constants/httpStatus.js";
import errorCodes from "../../constants/errorCodes.js";
import services from "../../constants/services.js";
import DocxRenderer from "./renderers/DocxRenderer.js";
import TextRenderer from "./renderers/TextRenderer.js";
import MarkdownRenderer from "./renderers/MarkdownRenderer.js";
import PdfRenderer from "./renderers/PdfRenderer.js";
import SpreadsheetRenderer from "./renderers/SpreadsheetRenderer.js";
import ImageRenderer from "./renderers/ImageRenderer.js";

// The single registration point for renderers. Adding a new renderer means
// adding one entry here, one file under renderers/, and one mapping in
// AttachmentDetector — no other module in the engine needs to change.
const RENDERERS = {
  docx: DocxRenderer,
  text: TextRenderer,
  markdown: MarkdownRenderer,
  pdf: PdfRenderer,
  spreadsheet: SpreadsheetRenderer,
  image: ImageRenderer
};

export function getRenderer(rendererKey) {
  const renderer = RENDERERS[rendererKey];

  if (!renderer) {
    throw new AppError(`No renderer registered for "${rendererKey}"`, {
      status: httpStatus.BAD_REQUEST,
      service: services.UPLOADS,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  return renderer;
}

export default { getRenderer };
