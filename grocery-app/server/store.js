// ──────────────────────────────────────────────
// FreshCart — In-Memory Data Store
// ──────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

// Load seed products
const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Cart: array of { productId, name, price, quantity, unit, emoji }
let cart = [];

// Orders: array of order objects
let orders = [];

module.exports = {
  // ── Products ──────────────────────────────
  getAllProducts() {
    return products;
  },

  getProductsByCategory(category) {
    return products.filter(p => p.category === category);
  },

  getProductById(id) {
    return products.find(p => p.id === id) || null;
  },

  getCategories() {
    return [...new Set(products.map(p => p.category))];
  },

  searchProducts(query) {
    const q = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  },

  // ── Cart ───────────────────────────────────
  getCart() {
    return cart;
  },

  getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  addToCart(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product) return null;

    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      unit: product.unit,
      emoji: product.emoji
    };
    cart.push(cartItem);
    return cartItem;
  },

  updateCartItem(productId, quantity) {
    const item = cart.find(i => i.productId === productId);
    if (!item) return null;
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    item.quantity = quantity;
    return item;
  },

  removeFromCart(productId) {
    const index = cart.findIndex(i => i.productId === productId);
    if (index === -1) return null;
    const removed = cart.splice(index, 1)[0];
    return removed;
  },

  clearCart() {
    cart = [];
    return true;
  },

  // ── Orders ─────────────────────────────────
  getOrders() {
    return orders;
  },

  getOrderById(id) {
    return orders.find(o => o.id === id) || null;
  },

  createOrder(customer) {
    if (cart.length === 0) return null;

    const order = {
      id: 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      items: [...cart],
      subtotal: this.getCartTotal(),
      deliveryFee: this.getCartTotal() >= 35 ? 0 : 4.99,
      total: this.getCartTotal() + (this.getCartTotal() >= 35 ? 0 : 4.99),
      customer,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    orders.unshift(order);
    cart = []; // clear cart after order
    return order;
  }
};
