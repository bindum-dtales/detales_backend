import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";
import httpStatus from "../../constants/httpStatus.js";
import errorCodes from "../../constants/errorCodes.js";
import services from "../../constants/services.js";
import { retryAsync } from "../../utils/retry.js";
import * as portfolioRepository from "./portfolio.repository.js";
import * as portfolioCache from "./portfolio.cache.js";
import * as portfolioMapper from "./portfolio.mapper.js";
import { supabaseConfig } from "../../config/appConfig.js";

function assertSupabaseConfigured() {
  const supabase = portfolioRepository.getClient();

  if (!supabase) {
    throw new AppError("Supabase not configured", {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      service: services.PORTFOLIO,
      code: errorCodes.SERVICE_UNAVAILABLE
    });
  }
}

async function withRetry(operation, { label, failureMessage }) {
  try {
    const result = await retryAsync(operation, {
      attempts: supabaseConfig.retries,
      delayMs: supabaseConfig.retryDelayMs,
      onRetry: ({ attempt, error }) => {
        logger.warn("Supabase retry", {
          service: services.PORTFOLIO,
          operation: label,
          attempt,
          error: error.message
        });
      }
    });

    return result || [];
  } catch (lastError) {
    logger.error("Supabase operation failed after retries", {
      service: services.PORTFOLIO,
      operation: label,
      error: lastError
    });

    throw new AppError(failureMessage, {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      service: services.PORTFOLIO,
      code: errorCodes.INTERNAL_ERROR,
      details: lastError?.message
    });
  }
}

export async function getPortfolio() {
  const data = await portfolioCache.loadPortfolio();

  logger.info("Portfolio read from cache", { service: services.PORTFOLIO, count: data.length });

  return data;
}

export async function refreshPortfolioCache() {
  assertSupabaseConfigured();

  const rows = await withRetry(() => portfolioRepository.fetchPublishedPortfolio(), {
    label: "fetchPublishedPortfolio",
    failureMessage: "Portfolio refresh failed"
  });

  const mapped = portfolioMapper.mapPortfolioList(rows);
  await portfolioCache.writePortfolio(mapped);

  logger.info("Portfolio cache refreshed", { service: services.PORTFOLIO, count: mapped.length });

  return mapped;
}

export async function createPortfolio(payload) {
  assertSupabaseConfigured();

  const { title, link, category, cover_image_url } = payload || {};

  const record = await withRetry(
    () => portfolioRepository.insertPortfolio({ title, link, category, cover_image_url }),
    { label: "insertPortfolio", failureMessage: "Portfolio create failed" }
  );

  await portfolioCache.clearPortfolio();

  logger.info("Portfolio item created", { service: services.PORTFOLIO, id: record?.id });

  return portfolioMapper.mapPortfolioRecord(record);
}

export async function updatePortfolio(id, payload) {
  assertSupabaseConfigured();

  const existing = await withRetry(() => portfolioRepository.findPortfolioById(id), {
    label: "findPortfolioById",
    failureMessage: "Portfolio update failed"
  });

  if (!existing) {
    throw new AppError("Portfolio item not found", {
      status: httpStatus.BAD_REQUEST,
      service: services.PORTFOLIO,
      code: errorCodes.NOT_FOUND
    });
  }

  const { title, link, category, cover_image_url, published } = payload || {};

  const updatePayload = {
    title,
    link,
    category,
    cover_image_url,
    ...(typeof published === "boolean" ? { published } : {}),
    updated_at: new Date().toISOString()
  };

  const record = await withRetry(() => portfolioRepository.updatePortfolio(id, updatePayload), {
    label: "updatePortfolio",
    failureMessage: "Portfolio update failed"
  });

  await portfolioCache.clearPortfolio();

  logger.info("Portfolio item updated", { service: services.PORTFOLIO, id });

  return portfolioMapper.mapPortfolioRecord(record);
}

export async function deletePortfolio(id) {
  assertSupabaseConfigured();

  const record = await withRetry(() => portfolioRepository.deletePortfolio(id), {
    label: "deletePortfolio",
    failureMessage: "Portfolio delete failed"
  });

  if (!record) {
    throw new AppError("Portfolio item not found", {
      status: httpStatus.NOT_FOUND,
      service: services.PORTFOLIO,
      code: errorCodes.NOT_FOUND
    });
  }

  await portfolioCache.clearPortfolio();

  logger.info("Portfolio item deleted", { service: services.PORTFOLIO, id });

  return portfolioMapper.mapPortfolioRecord(record);
}

export default {
  getPortfolio,
  refreshPortfolioCache,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
};
