export function validatePortfolioId(req, res, next) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing ID parameter" });
  }

  next();
}

export function validatePortfolioUpdate(req, res, next) {
  const { title, link, category } = req.body || {};

  if (!title || !link || !category) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "title, link, and category are required"
    });
  }

  next();
}

export default {
  validatePortfolioId,
  validatePortfolioUpdate
};
