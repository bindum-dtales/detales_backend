import AppError from "../utils/AppError.js";
import httpStatus from "../constants/httpStatus.js";
import errorCodes from "../constants/errorCodes.js";
import services from "../constants/services.js";
import { extractContent } from "../services/blogs/blogs.mapper.js";

const LINK_CONTENT_BOTH_MESSAGE = "Provide either a Project Link or a Document, not both.";
const LINK_CONTENT_NEITHER_MESSAGE = "A Project Link or a Document is required.";

// Shared XOR rule for the link/content pair. `allowNeither` lets update
// requests that don't touch either field pass through here untouched —
// the service resolves the final value against the existing record and
// re-validates with allowNeither left false.
export function validatePortfolioLinkContent({ link, content, allowNeither = false }) {
  const hasLink = typeof link === "string" && link.trim() !== "";
  const hasContent = typeof content === "string" && content.trim() !== "";

  if (hasLink && hasContent) {
    return LINK_CONTENT_BOTH_MESSAGE;
  }

  if (!hasLink && !hasContent && !allowNeither) {
    return LINK_CONTENT_NEITHER_MESSAGE;
  }

  return null;
}

function validateRequiredFields({ title, capability, subcategory }) {
  if (!title || !capability || !subcategory) {
    return "title, capability, and subcategory are required";
  }

  return null;
}

function validateFeaturedType(featured) {
  if (featured !== undefined && typeof featured !== "boolean") {
    return "featured must be a boolean";
  }

  return null;
}

export function validatePortfolioId(req, res, next) {
  const { id } = req.params;

  if (!id) {
    return next(
      new AppError("Missing ID parameter", {
        status: httpStatus.BAD_REQUEST,
        service: services.PORTFOLIO,
        code: errorCodes.VALIDATION_ERROR
      })
    );
  }

  next();
}

export function validatePortfolioCreate(req, res, next) {
  const { title, capability, subcategory, featured, link } = req.body || {};
  const content = extractContent(req.body?.content);

  const requiredFieldsError = validateRequiredFields({ title, capability, subcategory });

  if (requiredFieldsError) {
    return next(
      new AppError("Missing required fields", {
        status: httpStatus.BAD_REQUEST,
        service: services.PORTFOLIO,
        code: errorCodes.VALIDATION_ERROR,
        details: requiredFieldsError
      })
    );
  }

  const featuredTypeError = validateFeaturedType(featured);

  if (featuredTypeError) {
    return next(
      new AppError("Invalid field type", {
        status: httpStatus.BAD_REQUEST,
        service: services.PORTFOLIO,
        code: errorCodes.VALIDATION_ERROR,
        details: featuredTypeError
      })
    );
  }

  const linkContentError = validatePortfolioLinkContent({ link, content });

  if (linkContentError) {
    return next(
      new AppError(linkContentError, {
        status: httpStatus.BAD_REQUEST,
        service: services.PORTFOLIO,
        code: errorCodes.VALIDATION_ERROR
      })
    );
  }

  next();
}

export function validatePortfolioUpdate(req, res, next) {
  const { title, capability, subcategory, featured, link } = req.body || {};
  const content = extractContent(req.body?.content);

  const requiredFieldsError = validateRequiredFields({ title, capability, subcategory });

  if (requiredFieldsError) {
    return next(
      new AppError("Missing required fields", {
        status: httpStatus.BAD_REQUEST,
        service: services.PORTFOLIO,
        code: errorCodes.VALIDATION_ERROR,
        details: requiredFieldsError
      })
    );
  }

  const featuredTypeError = validateFeaturedType(featured);

  if (featuredTypeError) {
    return next(
      new AppError("Invalid field type", {
        status: httpStatus.BAD_REQUEST,
        service: services.PORTFOLIO,
        code: errorCodes.VALIDATION_ERROR,
        details: featuredTypeError
      })
    );
  }

  // Only rejects the "both provided" case here — an update omitting both
  // fields is valid (it isn't touching the link/document) and is resolved
  // against the existing record in the service layer.
  const linkContentError = validatePortfolioLinkContent({ link, content, allowNeither: true });

  if (linkContentError) {
    return next(
      new AppError(linkContentError, {
        status: httpStatus.BAD_REQUEST,
        service: services.PORTFOLIO,
        code: errorCodes.VALIDATION_ERROR
      })
    );
  }

  next();
}

export default {
  validatePortfolioLinkContent,
  validatePortfolioId,
  validatePortfolioCreate,
  validatePortfolioUpdate
};
