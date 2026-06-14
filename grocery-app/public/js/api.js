// ══════════════════════════════════════════════
// FreshCart — API Client
// ══════════════════════════════════════════════
const API = {
  base: '/api',

  async get(path) {
    const res = await fetch(this.base + path);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  async put(path, body) {
    const res = await fetch(this.base + path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  async del(path) {
    const res = await fetch(this.base + path, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // Products
  getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get('/products' + (qs ? '?' + qs : ''));
  },

  // Cart
  getCart()                    { return this.get('/cart'); },
  addToCart(productId, qty)    { return this.post('/cart', { productId, quantity: qty }); },
  updateCartItem(pid, qty)     { return this.put('/cart/' + pid, { quantity: qty }); },
  removeFromCart(pid)           { return this.del('/cart/' + pid); },
  clearCart()                   { return this.del('/cart'); },

  // Orders
  getOrders()                  { return this.get('/orders'); },
  placeOrder(customer)         { return this.post('/orders', customer); }
};
