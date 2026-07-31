import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as portfolioService from "../services/portfolio/portfolio.service.js";
import { sendLegacyError } from "../utils/errorResponse.js";

export const listPortfolio = asyncHandler(async (req, res) => {
  try {
    const data = await portfolioService.getPortfolio();

    logger.info("Portfolio served", {
      service: services.PORTFOLIO,
      endpoint: req.originalUrl,
      count: data.length
    });

    return res.status(200).json(data || []);
  } catch (err) {
    return sendLegacyError(res, err);
  }
});

export const createPortfolio = asyncHandler(async (req, res) => {
  try {
    const data = await portfolioService.createPortfolio(req.body);
    return res.status(201).json(data);
  } catch (err) {
    return sendLegacyError(res, err);
  }
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  try {
    const data = await portfolioService.updatePortfolio(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Portfolio item updated successfully", data });
  } catch (err) {
    return sendLegacyError(res, err);
  }
});

export const deletePortfolio = asyncHandler(async (req, res) => {
  try {
    const data = await portfolioService.deletePortfolio(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Portfolio item deleted successfully",
      deleted: data
    });
  } catch (err) {
    return sendLegacyError(res, err);
  }
});

export default {
  listPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
};
