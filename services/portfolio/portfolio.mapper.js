export function mapPortfolioListItem(row) {
  if (!row) {
    return null;
  }

  const { id, title, capability, subcategory, cover_image_url, link } = row;

  return { id, title, capability, subcategory, cover_image_url: cover_image_url ?? null, link };
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

export default {
  mapPortfolioListItem,
  mapPortfolioList,
  mapPortfolioRecord
};
