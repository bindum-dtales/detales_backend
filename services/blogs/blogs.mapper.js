export function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildExcerpt(html, maxLen = 200) {
  const text = stripHtml(html);
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

export function extractContent(bodyContent) {
  if (typeof bodyContent === "string") {
    return bodyContent;
  }

  if (bodyContent && typeof bodyContent === "object" && typeof bodyContent.html === "string") {
    return bodyContent.html;
  }

  return "";
}

export function normalizeBlog(row) {
  const cover_image_url = row?.cover_image_url ?? null;
  const content = row?.content ?? "";
  const excerpt = buildExcerpt(content, 200);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover_image_url,
    excerpt,
    content,
    published: row.published,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export function normalizeBlogList(rows) {
  return Array.isArray(rows) ? rows.map(normalizeBlog) : [];
}

export default {
  stripHtml,
  buildExcerpt,
  extractContent,
  normalizeBlog,
  normalizeBlogList
};
