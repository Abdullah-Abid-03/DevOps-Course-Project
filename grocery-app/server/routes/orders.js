// ──────────────────────────────────────────────
// Order Routes
// ──────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const store = require('../store');
const { sendOrderConfirmation } = require('../email');

// GET /api/orders — get all orders
router.get('/', (req, res) => {
  res.json({ orders: store.getOrders() });
});

// GET /api/orders/:id — get single order
router.get('/:id', (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

// POST /api/orders — place an order
router.post('/', async (req, res) => {
  const { name, email, phone, address } = req.body;

  // Validate required fields
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name is required (min 2 characters)');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
  if (!phone || phone.trim().length < 7) errors.push('Valid phone number is required');
  if (!address || address.trim().length < 5) errors.push('Delivery address is required (min 5 characters)');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const customer = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    address: address.trim()
  };

  const order = store.createOrder(customer);
  if (!order) {
    return res.status(400).json({ error: 'Cart is empty. Add items before placing an order.' });
  }

  // Send confirmation email (don't block response on failure)
  const emailResult = await sendOrderConfirmation(order);

  res.status(201).json({ order, emailSent: emailResult.sent });
});

module.exports = router;
