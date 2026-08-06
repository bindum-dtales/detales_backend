import AppError from "../../utils/AppError.js";
import httpStatus from "../../constants/httpStatus.js";
import errorCodes from "../../constants/errorCodes.js";
import services from "../../constants/services.js";
import logger from "../../utils/logger.js";
import AttachmentDetector from "./AttachmentDetector.js";
import RendererFactory from "./RendererFactory.js";

// Universal Attachment Engine entry point:
//   AttachmentEngine -> AttachmentDetector -> RendererFactory -> Renderer
//
// `file` is { buffer, originalname, mimetype, storageUrl }. Not wired into
// any live route/controller — this is the standalone rendering layer only.
export async function renderAttachment(file) {
  if (!file || !file.originalname) {
    throw new AppError("Attachment file is required", {
      status: httpStatus.BAD_REQUEST,
      service: services.UPLOADS,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  const detection = AttachmentDetector.detect(file.originalname);

  if (!detection) {
    logger.warn("AttachmentEngine: unsupported file type", {
      service: services.UPLOADS,
      operation: "renderAttachment",
      filename: file.originalname
    });
    throw new AppError(`Unsupported attachment type: ${file.originalname}`, {
      status: httpStatus.BAD_REQUEST,
      service: services.UPLOADS,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  const renderer = RendererFactory.getRenderer(detection.renderer);
  const result = await renderer.render(file);

  logger.info("AttachmentEngine: rendered attachment", {
    service: services.UPLOADS,
    operation: "renderAttachment",
    filename: file.originalname,
    renderer: detection.renderer,
    type: detection.type
  });

  return result;
}

export default { renderAttachment };
