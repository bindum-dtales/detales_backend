import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";
import services from "../constants/services.js";
import * as caseStudiesService from "../services/caseStudies/caseStudies.service.js";
import { sendSuccess } from "../utils/response.js";

export const listCaseStudies = asyncHandler(async (req, res) => {
  const data = await caseStudiesService.getCaseStudies();

  logger.info("Case studies served", {
    service: services.CASE_STUDIES,
    endpoint: req.originalUrl,
    count: data.length
  });

  return sendSuccess(res, { status: 200, message: "Case studies retrieved successfully", data: data || [] });
});

export const getCaseStudy = asyncHandler(async (req, res) => {
  const data = await caseStudiesService.getCaseStudyById(req.params.id);
  return sendSuccess(res, { status: 200, message: "Case study retrieved successfully", data });
});

export const createCaseStudy = asyncHandler(async (req, res) => {
  const data = await caseStudiesService.createCaseStudy(req.body);
  return sendSuccess(res, { status: 201, message: "Case study created successfully", data });
});

export const updateCaseStudy = asyncHandler(async (req, res) => {
  const data = await caseStudiesService.updateCaseStudy(req.params.id, req.body);
  return sendSuccess(res, { status: 200, message: "Case study updated successfully", data });
});

export const deleteCaseStudy = asyncHandler(async (req, res) => {
  await caseStudiesService.deleteCaseStudy(req.params.id);
  return sendSuccess(res, { status: 200, message: "Case study deleted successfully", data: null });
});

export default {
  listCaseStudies,
  getCaseStudy,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy
};
