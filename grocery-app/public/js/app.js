// ══════════════════════════════════════════════
// FreshCart — Main App Controller
// ══════════════════════════════════════════════
(function () {
  'use strict';

  // ── State ─────────────────────────────────
  let products = [];
  let categories = [];
  let cartItems = [];
  let cartCount = 0;
  let cartTotal = 0;
  let activeCategory = 'all';
  let searchQuery = '';
  let selectedRecipe = null;

  const recipes = [
    {
      id: 'r001',
      name: 'Classic Cake',
      emoji: '🍰',
      description: 'A simple cake recipe with eggs, milk, flour, butter, and vanilla.',
      ingredients: [
        { productId: 'p007', name: 'Free-Range Eggs', qty: 1 },
        { productId: 'p006', name: 'Whole Milk', qty: 1 },
        { productId: 'p025', name: 'All-Purpose Flour', qty: 1 },
        { productId: 'p026', name: 'Granulated Sugar', qty: 1 },
        { productId: 'p027', name: 'Unsalted Butter', qty: 1 },
        { productId: 'p028', name: 'Vanilla Extract', qty: 1 }
      ]
    },
    {
      id: 'r002',
      name: 'Yogurt Honey Parfait',
      emoji: '🍯',
      description: 'A healthy parfait with Greek yogurt, honey, and fresh berries.',
      ingredients: [
        { productId: 'p008', name: 'Greek Yogurt', qty: 1 },
        { productId: 'p022', name: 'Honey', qty: 1 },
        { productId: 'p002', name: 'Fresh Strawberries', qty: 1 },
        { productId: 'p012', name: 'Blueberry Muffins', qty: 1 }
      ]
    },
    {
      id: 'r003',
      name: 'Spinach Salad',
      emoji: '🥗',
      description: 'A refreshing salad with spinach, avocado, bell pepper, and olive oil.',
      ingredients: [
        { productId: 'p004', name: 'Baby Spinach', qty: 1 },
        { productId: 'p003', name: 'Avocados', qty: 1 },
        { productId: 'p005', name: 'Red Bell Peppers', qty: 1 },
        { productId: 'p023', name: 'Extra Virgin Olive Oil', qty: 1 }
      ]
    }
  ];

  // ── DOM refs ──────────────────────────────
  const $ = id => document.getElementById(id);
  const grid          = $('products-grid');
  const catScroll     = document.querySelector('.categories-scroll');
  const sectionTitle  = $('section-title');
  const productCount  = $('product-count');
  const emptyProducts = $('empty-products');
  const cartBadge     = $('cart-badge');
  const deployDate    = $('deploy-date');
  const drawerOverlay = $('drawer-overlay');
  const cartDrawer    = $('cart-drawer');
  const drawerBody    = $('drawer-body');
  const drawerFooter  = $('drawer-footer');
  const searchInput   = $('search-input');
  const searchClear   = $('search-clear');
  const recipesGrid   = $('recipes-grid');
  const recipeDetails = $('recipe-details');
  const recipeName    = $('recipe-name');
  const recipeDesc    = $('recipe-desc');
  const ingredientsList = $('ingredients-list');
  const recipeDetailsClose = $('recipe-details-close');
  const recipeAddAllBtn = $('recipe-add-all');

  // ── Init ──────────────────────────────────
  async function init() {
    await loadProducts();
    await refreshCart();
    renderDeploymentBanner();
    renderRecipes();
    bindEvents();
  }

  // ── Data Loading ──────────────────────────
  async function loadProducts() {
    try {
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;

      const data = await API.getProducts(params);
      products = data.products;
      if (data.categories) categories = data.categories;

      renderCategories();
      renderProducts();
    } catch (e) {
      UI.toast('Failed to load products', 'error');
    }
  }

  async function refreshCart() {
    try {
      const data = await API.getCart();
      cartItems = data.items;
      cartTotal = data.total;
      cartCount = data.count;
      updateCartBadge();
    } catch (e) { /* silent */ }
  }

  // ── Rendering ─────────────────────────────
  function renderCategories() {
    catScroll.innerHTML = UI.categoryPills(categories, activeCategory);
  }

  function renderRecipes() {
    if (!recipesGrid) return;
    recipesGrid.innerHTML = recipes.map(recipe => `
      <div class="recipe-card">
        <div class="recipe-card-top">
          <div class="recipe-emoji">${recipe.emoji}</div>
          <div>
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
          </div>
        </div>
        <div class="recipe-footer">
          <button class="recipe-view-btn" data-view-recipe="${recipe.id}">View ingredients</button>
          <button class="recipe-add-all-btn" data-add-recipe="${recipe.id}">Add all</button>
        </div>
      </div>
    `).join('');
  }

  function renderRecipeDetails(recipe) {
    if (!recipeDetails || !ingredientsList || !recipeName || !recipeDesc) return;
    selectedRecipe = recipe;
    recipeName.textContent = recipe.name;
    recipeDesc.textContent = recipe.description;

    const cartMap = cartItems.reduce((map, item) => {
      map[item.productId] = item.quantity;
      return map;
    }, {});

    ingredientsList.innerHTML = recipe.ingredients.map(ingredient => {
      const inCart = cartMap[ingredient.productId] || 0;
      return `
        <li class="ingredient-row">
          <div>
            <span class="ingredient-name">${ingredient.name}</span>
            <span class="ingredient-qty">x${ingredient.qty}</span>
          </div>
          <button class="ingredient-add-btn" data-add-ingredient="${ingredient.productId}">
            ${inCart ? `Add again (${inCart} in cart)` : 'Add'}
          </button>
        </li>
      `;
    }).join('');

    recipeDetails.classList.remove('hidden');
  }

  async function addRecipeIngredient(productId) {
    try {
      await API.addToCart(productId, 1);
      const data = await API.getCart();
      cartItems = data.items;
      cartTotal = data.total;
      cartCount = data.count;
      updateCartBadge();
      renderRecipeDetails(selectedRecipe);
      UI.toast('Ingredient added to cart', 'success');
    } catch (e) {
      UI.toast('Failed to add ingredient', 'error');
    }
  }

  async function addAllRecipeIngredients(recipe) {
    try {
      for (const ingredient of recipe.ingredients) {
        await API.addToCart(ingredient.productId, ingredient.qty);
      }
      const data = await API.getCart();
      cartItems = data.items;
      cartTotal = data.total;
      cartCount = data.count;
      updateCartBadge();
      renderRecipeDetails(recipe);
      UI.toast('All recipe ingredients added to cart', 'success');
    } catch (e) {
      UI.toast('Failed to add recipe ingredients', 'error');
    }
  }

  function closeRecipeDetails() {
    if (recipeDetails) {
      recipeDetails.classList.add('hidden');
    }
  }

  function renderProducts() {
    // Build a quick lookup of cart quantities
    const qtyMap = {};
    cartItems.forEach(i => { qtyMap[i.productId] = i.quantity; });

    grid.innerHTML = '';
    const filtered = searchQuery
      ? products
      : (activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory));

    if (filtered.length === 0) {
      grid.classList.add('hidden');
      emptyProducts.classList.remove('hidden');
    } else {
      grid.classList.remove('hidden');
      emptyProducts.classList.add('hidden');
      filtered.forEach(p => grid.appendChild(UI.productCard(p, qtyMap[p.id] || 0)));
    }

    sectionTitle.textContent = activeCategory === 'all' ? 'All Products' : activeCategory;
    productCount.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;
  }

  function renderDeploymentBanner() {
    if (!deployDate) return;
    const now = new Date();
    deployDate.textContent = now.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  }

  function renderCart() {
    if (cartItems.length === 0) {
      drawerBody.innerHTML = UI.cartEmpty();
      drawerFooter.classList.add('hidden');
      return;
    }

    drawerBody.innerHTML = cartItems.map(i => UI.cartItem(i)).join('');
    drawerFooter.classList.remove('hidden');

    const delivery = cartTotal >= 35 ? 0 : 4.99;
    $('cart-subtotal').textContent = '$' + cartTotal.toFixed(2);
    $('cart-delivery').textContent = delivery === 0 ? 'FREE 🎉' : '$' + delivery.toFixed(2);
    $('cart-total').textContent = '$' + (cartTotal + delivery).toFixed(2);

    const hint = $('free-delivery-hint');
    if (cartTotal < 35) {
      hint.classList.remove('hidden');
      $('free-delivery-remaining').textContent = (35 - cartTotal).toFixed(2);
    } else {
      hint.classList.add('hidden');
    }
  }

  function updateCartBadge() {
    if (cartCount > 0) {
      cartBadge.textContent = cartCount;
      cartBadge.classList.remove('hidden');
    } else {
      cartBadge.classList.add('hidden');
    }
  }

  function updateProductCardAction(productId, qty) {
    const actionEl = $('action-' + productId);
    if (actionEl) {
      actionEl.innerHTML = qty > 0 ? UI.qtyStepper(productId, qty) : UI.addButton(productId);
    }
  }

  // ── Cart Actions ──────────────────────────
  async function addToCart(productId) {
    try {
      const data = await API.addToCart(productId, 1);
      cartItems = (await API.getCart()).items;
      cartTotal = data.total;
      cartCount = data.count;
      updateCartBadge();
      updateProductCardAction(productId, data.item.quantity);
      UI.toast(`Added to cart!`, 'success');
    } catch (e) {
      UI.toast('Failed to add item', 'error');
    }
  }

  async function changeQty(productId, delta) {
    const item = cartItems.find(i => i.productId === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    try {
      if (newQty <= 0) {
        const data = await API.removeFromCart(productId);
        cartItems = data.items; cartTotal = data.total; cartCount = data.count;
      } else {
        const data = await API.updateCartItem(productId, newQty);
        cartItems = data.items; cartTotal = data.total; cartCount = data.count;
      }
      updateCartBadge();
      updateProductCardAction(productId, newQty > 0 ? newQty : 0);
      renderCart();
    } catch (e) {
      UI.toast('Failed to update item', 'error');
    }
  }

  async function removeFromCart(productId) {
    try {
      const data = await API.removeFromCart(productId);
      cartItems = data.items; cartTotal = data.total; cartCount = data.count;
      updateCartBadge();
      updateProductCardAction(productId, 0);
      renderCart();
    } catch (e) {
      UI.toast('Failed to remove item', 'error');
    }
  }

  // ── Drawer ────────────────────────────────
  function openCart() {
    renderCart();
    drawerOverlay.classList.remove('hidden');
    cartDrawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    drawerOverlay.classList.add('hidden');
    cartDrawer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ── Checkout ──────────────────────────────
  function openCheckout() {
    closeCart();
    const delivery = cartTotal >= 35 ? 0 : 4.99;
    $('checkout-order-summary').innerHTML = UI.checkoutSummary(cartItems, cartTotal, delivery);
    $('checkout-form').reset();
    document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    document.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
    $('checkout-form-view').classList.remove('hidden');
    $('order-confirm-view').classList.add('hidden');
    $('checkout-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    $('checkout-modal').classList.add('hidden');
    document.body.style.overflow = '';
  }

  async function submitOrder(e) {
    e.preventDefault();

    // Validate
    const name = $('cust-name').value.trim();
    const email = $('cust-email').value.trim();
    const phone = $('cust-phone').value.trim();
    const address = $('cust-address').value.trim();
    let valid = true;

    function setErr(field, msg) {
      $('error-' + field).textContent = msg;
      $('cust-' + field).classList.toggle('invalid', !!msg);
      if (msg) valid = false;
    }

    setErr('name', name.length < 2 ? 'Name is required' : '');
    setErr('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Valid email required');
    setErr('phone', phone.length >= 7 ? '' : 'Valid phone required');
    setErr('address', address.length >= 5 ? '' : 'Address required (min 5 chars)');

    if (!valid) return;

    const btn = $('place-order-btn');
    const loader = $('order-loader');
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Placing Order...';
    loader.classList.remove('hidden');

    try {
      const data = await API.placeOrder({ name, email, phone, address });
      const order = data.order;

      // Show confirmation
      $('confirm-details').innerHTML = UI.orderConfirmation(order, data.emailSent);
      $('checkout-form-view').classList.add('hidden');
      $('order-confirm-view').classList.remove('hidden');

      // Reset cart state
      cartItems = []; cartTotal = 0; cartCount = 0;
      updateCartBadge();
      renderProducts();
      UI.toast('Order placed successfully!', 'success');
      if (data.emailSent) {
        setTimeout(() => UI.toast(`📧 Confirmation email sent to ${email}`, 'success'), 600);
      }
    } catch (e) {
      const msg = e.errors ? e.errors.join(', ') : (e.error || 'Order failed');
      UI.toast(msg, 'error');
    } finally {
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Place Order';
      loader.classList.add('hidden');
    }
  }

  // ── Orders Modal ──────────────────────────
  async function openOrders() {
    try {
      const { orders } = await API.getOrders();
      $('orders-list').innerHTML = orders.length
        ? orders.map(o => UI.orderCard(o)).join('')
        : UI.ordersEmpty();
    } catch (e) {
      $('orders-list').innerHTML = UI.ordersEmpty();
    }
    $('orders-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeOrders() {
    $('orders-modal').classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ── Event Binding ─────────────────────────
  function bindEvents() {
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 20);
    });

    // Hero CTA
    $('hero-cta').addEventListener('click', () => {
      $('categories-bar').scrollIntoView({ behavior: 'smooth' });
    });
    $('logo-link').addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Search
    let searchTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchQuery = searchInput.value.trim();
      searchClear.classList.toggle('hidden', !searchQuery);
      searchTimer = setTimeout(() => loadProducts(), 300);
    });
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClear.classList.add('hidden');
      loadProducts();
    });

    // Category pills
    catScroll.addEventListener('click', e => {
      const pill = e.target.closest('.cat-pill');
      if (!pill) return;
      activeCategory = pill.dataset.category;
      searchInput.value = '';
      searchQuery = '';
      searchClear.classList.add('hidden');
      loadProducts();
    });

    // Recipe section actions
    if (recipesGrid) {
      recipesGrid.addEventListener('click', e => {
        const viewBtn = e.target.closest('[data-view-recipe]');
        if (viewBtn) {
          const recipeId = viewBtn.dataset.viewRecipe;
          const recipe = recipes.find(r => r.id === recipeId);
          if (recipe) renderRecipeDetails(recipe);
          return;
        }

        const addAllBtn = e.target.closest('[data-add-recipe]');
        if (addAllBtn) {
          const recipeId = addAllBtn.dataset.addRecipe;
          const recipe = recipes.find(r => r.id === recipeId);
          if (recipe) addAllRecipeIngredients(recipe);
          return;
        }
      });
    }

    if (recipeDetailsClose) {
      recipeDetailsClose.addEventListener('click', closeRecipeDetails);
    }

    if (recipeAddAllBtn) {
      recipeAddAllBtn.addEventListener('click', () => {
        if (selectedRecipe) addAllRecipeIngredients(selectedRecipe);
      });
    }

    if (recipeDetails) {
      recipeDetails.addEventListener('click', e => {
        const ingredientBtn = e.target.closest('[data-add-ingredient]');
        if (ingredientBtn) {
          addRecipeIngredient(ingredientBtn.dataset.addIngredient);
        }
      });
    }

    // Product grid actions (delegation)
    grid.addEventListener('click', e => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn) return addToCart(addBtn.dataset.add);

      const incBtn = e.target.closest('[data-inc]');
      if (incBtn) return changeQty(incBtn.dataset.inc, 1);

      const decBtn = e.target.closest('[data-dec]');
      if (decBtn) return changeQty(decBtn.dataset.dec, -1);
    });

    // Cart drawer
    $('cart-btn').addEventListener('click', openCart);
    $('drawer-close').addEventListener('click', closeCart);
    drawerOverlay.addEventListener('click', closeCart);

    // Cart drawer actions (delegation)
    drawerBody.addEventListener('click', e => {
      const inc = e.target.closest('[data-cart-inc]');
      if (inc) return changeQty(inc.dataset.cartInc, 1);

      const dec = e.target.closest('[data-cart-dec]');
      if (dec) return changeQty(dec.dataset.cartDec, -1);

      const rem = e.target.closest('[data-cart-remove]');
      if (rem) return removeFromCart(rem.dataset.cartRemove);
    });

    // Checkout
    $('checkout-btn').addEventListener('click', openCheckout);
    $('modal-back').addEventListener('click', () => { closeCheckout(); openCart(); });
    $('modal-close').addEventListener('click', closeCheckout);
    $('checkout-form').addEventListener('submit', submitOrder);
    $('continue-shopping-btn').addEventListener('click', () => {
      closeCheckout();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Orders
    $('orders-btn').addEventListener('click', openOrders);
    $('orders-modal-close').addEventListener('click', closeOrders);

    // Close modals on overlay click
    $('checkout-modal').addEventListener('click', e => {
      if (e.target === $('checkout-modal')) closeCheckout();
    });
    $('orders-modal').addEventListener('click', e => {
      if (e.target === $('orders-modal')) closeOrders();
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeCart(); closeCheckout(); closeOrders(); closeRecipeDetails();
      }
    });
  }

  // ── Boot ──────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
