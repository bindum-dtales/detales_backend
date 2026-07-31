import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as caseStudiesService from "../services/caseStudies/caseStudies.service.js";

function sendLegacyError(res, err) {
  return res.status(err.status || 500).json({ error: err.message });
}

export const listCaseStudies = asyncHandler(async (req, res) => {
  try {
    const data = await caseStudiesService.getCaseStudies();

    logger.info("Case studies served", {
      service: services.CASE_STUDIES,
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

export const getCaseStudy = asyncHandler(async (req, res) => {
  try {
    const data = await caseStudiesService.getCaseStudyById(req.params.id);
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export const createCaseStudy = asyncHandler(async (req, res) => {
  try {
    const data = await caseStudiesService.createCaseStudy(req.body);
    return res.status(201).json(data);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export const updateCaseStudy = asyncHandler(async (req, res) => {
  try {
    const data = await caseStudiesService.updateCaseStudy(req.params.id, req.body);
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export const deleteCaseStudy = asyncHandler(async (req, res) => {
  try {
    await caseStudiesService.deleteCaseStudy(req.params.id);
    return res.status(200).json({ success: true, message: "Case study deleted successfully" });
  } catch (err) {
    if (err instanceof AppError) {
      return sendLegacyError(res, err);
    }
    return res.status(500).json({ error: err.message });
  }
});

export default {
  listCaseStudies,
  getCaseStudy,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy
};
