import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as portfolioService from "../services/portfolio/portfolio.service.js";
import { sendSuccess } from "../utils/response.js";

export const listPortfolio = asyncHandler(async (req, res) => {
  const data = await portfolioService.getPortfolio();

  logger.info("Portfolio served", {
    service: services.PORTFOLIO,
    endpoint: req.originalUrl,
    count: data.length
  });

  return sendSuccess(res, { status: 200, message: "Portfolio items retrieved successfully", data: data || [] });
});

export const createPortfolio = asyncHandler(async (req, res) => {
  const data = await portfolioService.createPortfolio(req.body);
  return sendSuccess(res, { status: 201, message: "Portfolio item created successfully", data });
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  const data = await portfolioService.updatePortfolio(req.params.id, req.body);
  return sendSuccess(res, { status: 200, message: "Portfolio item updated successfully", data });
});

export const deletePortfolio = asyncHandler(async (req, res) => {
  const data = await portfolioService.deletePortfolio(req.params.id);
  return sendSuccess(res, { status: 200, message: "Portfolio item deleted successfully", data });
});

export default {
  listPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
};
