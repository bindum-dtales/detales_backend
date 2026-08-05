import { extractContent } from "../blogs/blogs.mapper.js";

export function mapPortfolioListItem(row) {
  if (!row) {
    return null;
  }

  const { id, title, capability, subcategory, cover_image_url, link, content, company_name, description, featured } =
    row;

  return {
    id,
    title,
    capability,
    subcategory,
    cover_image_url: cover_image_url ?? null,
    link: link ?? null,
    content: content ?? null,
    company_name,
    description,
    featured
  };
}

export function mapPortfolioList(rows) {
  return Array.isArray(rows) ? rows.map(mapPortfolioListItem) : [];
}

export function mapPortfolioRecord(row) {
  if (!row) {
    return null;
  }

  return { ...row };
}

// Resolves the mutually-exclusive link/content pair for a portfolio write.
// `existing` is only passed on update, so a payload that touches neither
// field falls back to whatever the record already has (untouched update).
export function resolvePortfolioLinkContent(payload, existing) {
  const linkKeyProvided = Boolean(payload) && Object.prototype.hasOwnProperty.call(payload, "link");
  const contentKeyProvided = Boolean(payload) && Object.prototype.hasOwnProperty.call(payload, "content");

  if (existing && !linkKeyProvided && !contentKeyProvided) {
    return { link: existing.link ?? null, content: existing.content ?? null };
  }

  const rawLink = linkKeyProvided ? (payload.link || "").toString().trim() : "";
  const extractedContent = contentKeyProvided ? extractContent(payload.content) : "";
  const hasContent = extractedContent.trim() !== "";

  if (rawLink && hasContent) {
    return { link: rawLink, content: extractedContent };
  }

  if (rawLink) {
    return { link: rawLink, content: null };
  }

  if (hasContent) {
    return { link: null, content: extractedContent };
  }

  return { link: null, content: null };
}

export default {
  mapPortfolioListItem,
  mapPortfolioList,
  mapPortfolioRecord,
  resolvePortfolioLinkContent
};
