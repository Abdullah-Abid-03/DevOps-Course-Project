// ──────────────────────────────────────────────
// Product Routes
// ──────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/products — list all or filter by category/search
router.get('/', (req, res) => {
  const { category, search } = req.query;

  if (search) {
    return res.json({ products: store.searchProducts(search) });
  }
  if (category) {
    return res.json({ products: store.getProductsByCategory(category) });
  }

  res.json({
    products: store.getAllProducts(),
    categories: store.getCategories()
  });
});

// GET /api/products/:id — single product
router.get('/:id', (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

module.exports = router;
