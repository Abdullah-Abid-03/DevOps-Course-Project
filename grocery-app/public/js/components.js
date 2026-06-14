// ══════════════════════════════════════════════
// FreshCart — UI Component Renderers
// ══════════════════════════════════════════════

const UI = {
  // ── Product Card ──────────────────────────
  productCard(product, cartQty = 0) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.id = 'product-' + product.id;
    card.innerHTML = `
      <div class="card-visual">
        ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
        <span>${product.emoji}</span>
      </div>
      <div class="card-body">
        <div class="card-category">${product.category}</div>
        <div class="card-name">${product.name}</div>
        <p class="card-desc">${product.description}</p>
        <div class="card-footer">
          <div class="card-price">$${product.price.toFixed(2)} <span class="card-unit">/ ${product.unit}</span></div>
          <div class="card-action" id="action-${product.id}">
            ${cartQty > 0 ? UI.qtyStepper(product.id, cartQty) : UI.addButton(product.id)}
          </div>
        </div>
      </div>
    `;
    return card;
  },

  addButton(productId) {
    return `<button class="add-btn" data-add="${productId}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add
    </button>`;
  },

  qtyStepper(productId, qty) {
    return `<div class="qty-stepper">
      <button data-dec="${productId}">−</button>
      <span class="qty-val">${qty}</span>
      <button data-inc="${productId}">+</button>
    </div>`;
  },

  // ── Category Pills ────────────────────────
  categoryPills(categories, active) {
    let html = `<button class="cat-pill ${active === 'all' ? 'active' : ''}" data-category="all">All Items</button>`;
    categories.forEach(cat => {
      html += `<button class="cat-pill ${active === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>`;
    });
    return html;
  },

  // ── Cart Item ─────────────────────────────
  cartItem(item) {
    return `<div class="cart-item" id="cart-item-${item.productId}">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-stepper">
          <button data-cart-dec="${item.productId}">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button data-cart-inc="${item.productId}">+</button>
        </div>
        <button class="cart-item-remove" data-cart-remove="${item.productId}" aria-label="Remove">✕</button>
      </div>
    </div>`;
  },

  cartEmpty() {
    return `<div class="cart-empty">
      <span class="cart-empty-emoji">🛒</span>
      <p>Your cart is empty</p>
    </div>`;
  },

  // ── Checkout Summary ──────────────────────
  checkoutSummary(items, total, delivery) {
    let html = '';
    items.forEach(item => {
      html += `<div class="checkout-item">
        <span>${item.emoji} ${item.name} × ${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>`;
    });
    html += `<div class="checkout-item checkout-item-total">
      <span>Total (incl. delivery)</span>
      <span>$${(total + delivery).toFixed(2)}</span>
    </div>`;
    return html;
  },

  // ── Order Confirmation ────────────────────
  orderConfirmation(order, emailSent = false) {
    return `
      <div class="confirm-row"><span class="label">Order ID</span><span class="value">${order.id}</span></div>
      <div class="confirm-row"><span class="label">Items</span><span class="value">${order.items.length} items</span></div>
      <div class="confirm-row"><span class="label">Subtotal</span><span class="value">$${order.subtotal.toFixed(2)}</span></div>
      <div class="confirm-row"><span class="label">Delivery</span><span class="value">${order.deliveryFee === 0 ? 'FREE' : '$' + order.deliveryFee.toFixed(2)}</span></div>
      <div class="confirm-row"><span class="label">Total</span><span class="value" style="color:var(--primary);font-size:1.05rem">$${order.total.toFixed(2)}</span></div>
      <div class="confirm-row"><span class="label">Status</span><span class="value" style="color:var(--success)">✓ Confirmed</span></div>
      <div class="confirm-row"><span class="label">Receipt</span><span class="value" style="color:${emailSent ? 'var(--success)' : 'var(--text-muted)'}">📧 ${emailSent ? 'Sent to ' + order.customer.email : 'Email not configured'}</span></div>
    `;
  },

  // ── Orders List ───────────────────────────
  orderCard(order) {
    const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const itemNames = order.items.map(i => `${i.emoji} ${i.name}`).join(', ');
    return `<div class="order-card">
      <div class="order-card-header">
        <span class="order-id">${order.id}</span>
        <span class="order-status">${order.status}</span>
      </div>
      <div class="order-items-list">${itemNames}</div>
      <div class="order-card-footer">
        <span class="order-total">$${order.total.toFixed(2)}</span>
        <span class="order-date">${date}</span>
      </div>
    </div>`;
  },

  ordersEmpty() {
    return `<div class="orders-empty">
      <span class="empty-emoji">📦</span>
      <p>No orders yet</p>
    </div>`;
  },

  // ── Toast ─────────────────────────────────
  toast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    el.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toastOut 0.3s ease forwards';
      el.addEventListener('animationend', () => el.remove());
    }, 2800);
  }
};
