import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";
import httpStatus from "../../constants/httpStatus.js";
import errorCodes from "../../constants/errorCodes.js";
import services from "../../constants/services.js";
import { retryAsync } from "../../utils/retry.js";
import * as caseStudiesRepository from "./caseStudies.repository.js";
import * as caseStudiesCache from "./caseStudies.cache.js";
import * as caseStudiesMapper from "./caseStudies.mapper.js";
import { validateCaseStudyFields } from "../../validators/caseStudies.validator.js";
import { supabaseConfig } from "../../config/appConfig.js";

function assertSupabaseConfigured() {
  const supabase = caseStudiesRepository.getClient();

  if (!supabase) {
    throw new AppError("Supabase not configured", {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      service: services.CASE_STUDIES,
      code: errorCodes.SERVICE_UNAVAILABLE
    });
  }
}

async function withRetry(operation, { label }) {
  return retryAsync(operation, {
    attempts: supabaseConfig.retries,
    delayMs: supabaseConfig.retryDelayMs,
    onRetry: ({ attempt, error }) => {
      logger.warn("Supabase retry", {
        service: services.CASE_STUDIES,
        operation: label,
        attempt,
        error: error.message
      });
    }
  });
}

function toGenericFailure(error) {
  return new AppError(error.message, {
    status: httpStatus.INTERNAL_SERVER_ERROR,
    service: services.CASE_STUDIES,
    code: errorCodes.INTERNAL_ERROR
  });
}

export async function getCaseStudies() {
  const data = await caseStudiesCache.loadCaseStudies();

  logger.info("Case studies read from cache", { service: services.CASE_STUDIES, count: data.length });

  return data;
}

export async function getCaseStudyById(id) {
  const cachedData = await caseStudiesCache.loadCaseStudies();

  if (Array.isArray(cachedData)) {
    const cachedItem = cachedData.find((item) => String(item.id) === String(id));
    if (cachedItem) {
      return cachedItem;
    }
  }

  const reloadedData = await caseStudiesCache.loadCaseStudies();
  const reloadedItem = Array.isArray(reloadedData)
    ? reloadedData.find((item) => String(item.id) === String(id))
    : null;

  if (reloadedItem) {
    return reloadedItem;
  }

  throw new AppError("Case study not found", {
    status: httpStatus.NOT_FOUND,
    service: services.CASE_STUDIES,
    code: errorCodes.NOT_FOUND
  });
}

export async function refreshCaseStudiesCache() {
  assertSupabaseConfigured();

  let rows;
  try {
    rows = await withRetry(() => caseStudiesRepository.fetchPublishedCaseStudies(), {
      label: "fetchPublishedCaseStudies"
    });
  } catch (error) {
    throw toGenericFailure(error);
  }

  const mapped = caseStudiesMapper.normalizeCaseStudyList(rows || []);
  await caseStudiesCache.writeCaseStudies(mapped);

  logger.info("Case studies cache refreshed", { service: services.CASE_STUDIES, count: mapped.length });

  return mapped;
}

export async function createCaseStudy(payload) {
  assertSupabaseConfigured();

  const title = ((payload && payload.title) || "").toString().trim();
  const content = caseStudiesMapper.extractContent(payload && payload.content);
  const cover_image_url = (payload && payload.cover_image_url) ?? null;
  const company_name = (payload && payload.company_name) ? payload.company_name.toString().trim() : null;
  const published = (payload && payload.published) === true;

  const validationError = validateCaseStudyFields({ title, content, company_name, published });

  if (validationError) {
    throw new AppError(validationError, {
      status: httpStatus.BAD_REQUEST,
      service: services.CASE_STUDIES,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  const excerpt = caseStudiesMapper.buildExcerpt(content);

  let record;
  try {
    record = await withRetry(
      () => caseStudiesRepository.insertCaseStudy({ title, excerpt, content, cover_image_url, company_name, published }),
      { label: "insertCaseStudy" }
    );
  } catch (error) {
    throw toGenericFailure(error);
  }

  await caseStudiesCache.clearCaseStudies();

  logger.info("Case study created", { service: services.CASE_STUDIES, id: record?.id });

  return caseStudiesMapper.normalizeCaseStudy(record);
}

export async function updateCaseStudy(id, payload) {
  assertSupabaseConfigured();

  let current;
  try {
    current = await withRetry(() => caseStudiesRepository.findCaseStudyById(id), { label: "findCaseStudyById" });
  } catch (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Case study not found", {
        status: httpStatus.NOT_FOUND,
        service: services.CASE_STUDIES,
        code: errorCodes.NOT_FOUND
      });
    }
    throw toGenericFailure(error);
  }

  const title = (((payload && payload.title) ?? current.title) || "").toString().trim();
  const contentRaw = caseStudiesMapper.extractContent(payload && payload.content);
  const content = contentRaw !== "" ? contentRaw : current.content || "";
  const cover_image_url =
    payload && payload.cover_image_url !== undefined ? payload.cover_image_url : current.cover_image_url ?? null;
  const company_name =
    payload && payload.company_name !== undefined
      ? (payload.company_name ? payload.company_name.toString().trim() : null)
      : current.company_name ?? null;
  const published =
    payload && typeof payload.published === "boolean" ? payload.published : current.published === true;

  const validationError = validateCaseStudyFields({ title, content, company_name, published });

  if (validationError) {
    throw new AppError(validationError, {
      status: httpStatus.BAD_REQUEST,
      service: services.CASE_STUDIES,
      code: errorCodes.VALIDATION_ERROR
    });
  }

  const excerpt = caseStudiesMapper.buildExcerpt(content);

  let record;
  try {
    record = await withRetry(
      () =>
        caseStudiesRepository.updateCaseStudy(id, {
          title,
          excerpt,
          content,
          cover_image_url,
          company_name,
          published,
          updated_at: new Date().toISOString()
        }),
      { label: "updateCaseStudy" }
    );
  } catch (error) {
    throw toGenericFailure(error);
  }

  await caseStudiesCache.clearCaseStudies();

  logger.info("Case study updated", { service: services.CASE_STUDIES, id });

  return caseStudiesMapper.normalizeCaseStudy(record);
}

export async function deleteCaseStudy(id) {
  assertSupabaseConfigured();

  let record;
  try {
    record = await withRetry(() => caseStudiesRepository.deleteCaseStudy(id), { label: "deleteCaseStudy" });
  } catch (error) {
    throw toGenericFailure(error);
  }

  if (!record || record.length === 0) {
    throw new AppError("Case study not found", {
      status: httpStatus.NOT_FOUND,
      service: services.CASE_STUDIES,
      code: errorCodes.NOT_FOUND
    });
  }

  await caseStudiesCache.clearCaseStudies();

  logger.info("Case study deleted", { service: services.CASE_STUDIES, id });
}

export default {
  getCaseStudies,
  getCaseStudyById,
  refreshCaseStudiesCache,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy
};
