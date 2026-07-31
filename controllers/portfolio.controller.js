import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as portfolioService from "../services/portfolio/portfolio.service.js";

function sendLegacyError(res, err) {
  const body = { error: err.message };

  if (err.details !== undefined) {
    body.details = err.details;
  }

  return res.status(err.status || 500).json(body);
}

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
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export const createPortfolio = asyncHandler(async (req, res) => {
  try {
    const data = await portfolioService.createPortfolio(req.body);
    return res.status(201).json(data);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: "Portfolio create failed", details: err.message });
  }
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  try {
    const data = await portfolioService.updatePortfolio(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Portfolio item updated successfully", data });
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: "Portfolio update failed", details: err.message });
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
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: "Portfolio delete failed", details: err.message });
  }
});

export default {
  listPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
};
