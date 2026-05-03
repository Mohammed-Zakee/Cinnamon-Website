/* ═══════════════════════════════════════════════════════════
   CEYLON GOLD — Cart System
   ═══════════════════════════════════════════════════════════ */

const Cart = {
  items: JSON.parse(localStorage.getItem('cg_cart') || '[]'),

  save() { localStorage.setItem('cg_cart', JSON.stringify(this.items)); },

  getItems() {
    return this.items;
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  },

  add(product, qty = 1) {
    const existing = this.items.find(i => i._id === product._id);
    if (existing) {
      existing.qty = (existing.qty || 0) + qty;
      existing.quantity = existing.qty; // Keep for compatibility
    } else {
      this.items.push({ ...product, qty, quantity: qty });
    }
    this.save();
    this.render();
    this.updateCount();
    showToast(`${product.name} added to cart 🛒`, 'success');
  },

  remove(id) {
    this.items = this.items.filter(i => i._id !== id);
    this.save();
    this.render();
    this.updateCount();
  },

  updateQty(id, qty) {
    const item = this.items.find(i => i._id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      item.quantity = item.qty;
      this.save();
      this.render();
      this.updateCount();
    }
  },

  clear() {
    this.items = [];
    this.save();
    this.render();
    this.updateCount();
  },

  updateCount() {
    const count = this.getCount();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 300);
    });
  },

  render() {
    const itemsEl = document.getElementById('cartItems');
    const footerEl = document.getElementById('cartFooter');
    if (!itemsEl) return;

    if (this.items.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <div class="empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <p style="font-size:.82rem;margin-top:.4rem;color:var(--text-muted);">Discover our premium collection</p>
        </div>`;
      if (footerEl) footerEl.innerHTML = '';
      return;
    }

    itemsEl.innerHTML = this.items.map(item => `
      <div class="cart-item" id="cart-item-${item._id}">
        ${item.imageUrl ? `<img src="${item.imageUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;background:var(--dark);" />` : `<span class="cart-item-emoji">${item.emoji || '🌿'}</span>`}
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${window.formatPrice ? window.formatPrice(item.price * item.qty) : '$' + (item.price * item.qty).toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="Cart.updateQty('${item._id}', ${item.qty - 1})">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="Cart.updateQty('${item._id}', ${item.qty + 1})">+</button>
          <button class="remove-btn" onclick="Cart.remove('${item._id}')" title="Remove">✕</button>
        </div>
      </div>
    `).join('');

    if (footerEl) {
      const subtotal = this.getTotal();
      const shipping = subtotal >= 50 ? 0 : 8.99;
      const total = subtotal + shipping;
      footerEl.innerHTML = `
        <div class="cart-summary-details">
          <div class="cart-subtotal"><span>Subtotal</span><span>${window.formatPrice ? window.formatPrice(subtotal) : '$' + subtotal.toFixed(2)}</span></div>
          <div class="cart-shipping"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:#2ecc71">FREE</span>' : (window.formatPrice ? window.formatPrice(shipping) : '$' + shipping.toFixed(2))}</span></div>
          ${subtotal < 50 ? `<div class="shipping-hint">Add ${window.formatPrice ? window.formatPrice(50 - subtotal) : '$' + (50 - subtotal).toFixed(2)} more for free shipping</div>` : ''}
          <div class="cart-total-row"><strong>Total</strong><span class="cart-total-price">${window.formatPrice ? window.formatPrice(total) : '$' + total.toFixed(2)}</span></div>
        </div>
        <div class="cart-actions">
          <button class="checkout-btn" onclick="proceedToCheckout()">Secure Checkout →</button>
          <button class="continue-btn" onclick="closeCart()">← Continue Shopping</button>
        </div>
      `;
    }
  },

  open() {
    this.render();
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    document.getElementById('cartSidebar')?.classList.remove('remove-btn'); // Error fix: class remove wrong
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }
};

function openCart() { Cart.open(); }
function closeCart() { Cart.close(); }

function proceedToCheckout() {
  if (Cart.items.length === 0) return showToast('Your cart is empty', 'error');
  const isInsidePages = window.location.pathname.includes('/pages/');
  const checkoutPath = isInsidePages ? 'checkout.html' : 'pages/checkout.html';
  window.location.href = checkoutPath;
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateCount();
  // Ensure cart triggers are attached
  document.querySelectorAll('#cartBtn').forEach(btn => {
    btn.onclick = (e) => { e.preventDefault(); openCart(); };
  });
});

// Toast notification system
let toastTimer;
function showToast(msg, type = 'default') {
  const toast = document.getElementById('toast');
  if (!toast) {
    const t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  const toastEl = document.getElementById('toast');
  clearTimeout(toastTimer);
  toastEl.textContent = msg; 
  toastEl.className = `toast show ${type}`;
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}
