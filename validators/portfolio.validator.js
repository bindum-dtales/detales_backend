import AppError from "../utils/AppError.js";
import httpStatus from "../constants/httpStatus.js";
import errorCodes from "../constants/errorCodes.js";
import services from "../constants/services.js";

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

export function validatePortfolioUpdate(req, res, next) {
  const { title, link, capability, subcategory } = req.body || {};

  if (!title || !link || !capability || !subcategory) {
    return next(
      new AppError("Missing required fields", {
        status: httpStatus.BAD_REQUEST,
        service: services.PORTFOLIO,
        code: errorCodes.VALIDATION_ERROR,
        details: "title, link, capability, and subcategory are required"
      })
    );
  }

  next();
}

export default {
  validatePortfolioId,
  validatePortfolioUpdate
};
