// ──────────────────────────────────────────────
// Cart Routes
// ──────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/cart — get cart contents
router.get('/', (req, res) => {
  res.json({
    items: store.getCart(),
    total: store.getCartTotal(),
    count: store.getCartCount()
  });
});

// POST /api/cart — add item to cart
router.post('/', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const item = store.addToCart(productId, quantity || 1);
  if (!item) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.status(201).json({
    item,
    total: store.getCartTotal(),
    count: store.getCartCount()
  });
});

// PUT /api/cart/:productId — update quantity
router.put('/:productId', (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined) {
    return res.status(400).json({ error: 'quantity is required' });
  }

  const item = store.updateCartItem(req.params.productId, quantity);
  if (!item) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  res.json({
    item,
    items: store.getCart(),
    total: store.getCartTotal(),
    count: store.getCartCount()
  });
});

// DELETE /api/cart/:productId — remove item
router.delete('/:productId', (req, res) => {
  const removed = store.removeFromCart(req.params.productId);
  if (!removed) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  res.json({
    removed,
    items: store.getCart(),
    total: store.getCartTotal(),
    count: store.getCartCount()
  });
});

// DELETE /api/cart — clear entire cart
router.delete('/', (req, res) => {
  store.clearCart();
  res.json({ items: [], total: 0, count: 0 });
});

module.exports = router;
