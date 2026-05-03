/* ═══════════════════════════════════════════════════════════
   CEYLON GOLD — API Client
   ═══════════════════════════════════════════════════════════ */

const API_BASE = '/api';

// Static fallback product data (used when DB is offline)
const STATIC_PRODUCTS = [
  { _id: 'alba', name: 'Alba', slug: 'alba', grade: 'Extra Exquisite', category: 'quill', description: "The crown jewel — paper-thin quills with a delicate sweet aroma and the world's lowest coumarin content.", price: 42.00, unit: '100g', emoji: '🌿', imageUrl: '/assets/images/hero_cinnamon.png', colorFrom: '#8B3A0F', colorTo: '#3D1A05', badge: 'FINEST', featured: true, rating: 4.9 },
  { _id: 'c5-special', name: 'C5 Special', slug: 'c5-special', grade: 'Special', category: 'quill', description: 'Premium handcrafted 5-layer quills with rich warm spice notes, perfect for gourmet cooking and aromatic teas.', price: 28.00, unit: '100g', emoji: '🫙', imageUrl: '/assets/images/hero_cinnamon.png', colorFrom: '#C1440E', colorTo: '#6B2308', featured: true, rating: 4.8 },
  { _id: 'c5', name: 'C5', slug: 'c5', grade: 'Superior', category: 'quill', description: 'Versatile, high-quality cinnamon with a balanced flavor profile — ideal for everyday culinary and wellness use.', price: 22.00, unit: '100g', emoji: '🌰', imageUrl: '/assets/images/hero_cinnamon.png', colorFrom: '#A0330A', colorTo: '#4D1A05', rating: 4.7 },
  { _id: 'c4', name: 'C4', slug: 'c4', grade: 'Premium', category: 'quill', description: 'Robust 4-layer quills with strong classic Ceylon character. Loved by professional chefs and spice enthusiasts.', price: 18.00, unit: '100g', emoji: '🍵', imageUrl: '/assets/images/hero_cinnamon.png', colorFrom: '#7A2A08', colorTo: '#3D1200', rating: 4.6 },
  { _id: 'bark-oil', name: 'Cinnamon Bark Oil', slug: 'cinnamon-bark-oil', grade: 'Pure Essential Oil', category: 'oil', description: 'Steam-distilled pure essential oil with intensely warm spicy scent. Prized in aromatherapy and cosmetics.', price: 65.00, unit: '10ml', emoji: '💧', imageUrl: '/assets/images/cinnamon_oil.png', colorFrom: '#C9A84C', colorTo: '#3D1B05', badge: 'RARE', featured: true, rating: 4.9 },
  { _id: 'quillings', name: 'Cinnamon Quillings', slug: 'cinnamon-quillings', grade: 'Quillings', category: 'pieces', description: "Small, curled off-cuts from premium quill production — intensely flavored and perfect for infusions, teas, and cooking.", price: 14.00, unit: '100g', emoji: '🪵', imageUrl: '/assets/images/cinnamon_powder.png', colorFrom: '#B06020', colorTo: '#5A2A08', rating: 4.5 }
];

const API = {
  async request(method, endpoint, body = null) {
    const token = localStorage.getItem('cg_token');
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(API_BASE + endpoint, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      throw err;
    }
  },
  get: (ep) => API.request('GET', ep),
  post: (ep, body) => API.request('POST', ep, body),
  put: (ep, body) => API.request('PUT', ep, body),
  patch: (ep, body) => API.request('PATCH', ep, body),
  delete: (ep) => API.request('DELETE', ep),
};

// Render a product card HTML string
function renderProductCard(p) {
  const badge = p.badge ? `<span class="card-badge${p.badge === 'RARE' ? ' rare' : ''}">${p.badge}</span>` : '';
  return `
  <article class="product-card reveal" data-id="${p._id}" data-slug="${p.slug || p._id}" onclick="navigateToProduct('${p.slug || p._id}')">
    ${badge}
    <div class="card-img">
      <div class="card-img-bg" style="background:radial-gradient(circle, ${p.colorFrom}, ${p.colorTo})"></div>
      ${ p.imageUrl ? `<img src="${p.imageUrl}" style="position:relative;z-index:2;max-width:80%;max-height:80%;object-fit:contain" alt="${p.name}"/>` : (window.globalLogoUrl ? `<img src="${window.globalLogoUrl}" style="position:relative;z-index:2;max-width:80%;max-height:80%;object-fit:contain" alt="Logo"/>` : `<span class="card-emoji">${p.emoji || '🌿'}</span>`) }
    </div>
    <div class="card-body">
      <div class="card-grade">${p.grade}</div>
      <div class="card-name">${p.name}</div>
      <p class="card-desc">${p.description}</p>
      <div class="card-foot">
        <div class="card-price">${window.formatPrice ? window.formatPrice(p.price, p.prices) : '$' + p.price.toFixed(2)}<small>per ${p.unit}</small></div>
        <button class="card-add" onclick="event.stopPropagation(); addToCartFromCard('${p._id}', '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.unit}', '${p.emoji || '🌿'}', '${p.imageUrl || ''}', '${encodeURIComponent(JSON.stringify(p.prices || null))}')" title="Add to cart">+</button>
      </div>
    </div>
  </article>`;
}

function attachCartListeners(container) {
  // Re-observe any newly added cards for scroll reveal
  if (window.revealObserver) {
    container.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }
}

function navigateToProduct(slug) {
  const base = window.location.pathname.includes('/pages/') ? '' : 'pages/';
  window.location.href = `${base}product.html?id=${slug}`;
}

function addToCartFromCard(id, name, price, unit, emoji, imageUrl, pricesStr) {
  let prices = null;
  if (pricesStr && pricesStr !== 'null') {
    prices = JSON.parse(decodeURIComponent(pricesStr));
  }
  Cart.add({ _id: id, name, price, prices, unit, emoji, imageUrl });
}

// Global currency update listener
window.addEventListener('currencyChanged', () => {
    if (typeof loadFeatured === 'function') loadFeatured();
    if (typeof loadProducts === 'function') {
        const params = new URLSearchParams(window.location.search);
        loadProducts(params.get('cat')); 
    }
    if (typeof loadProduct === 'function') loadProduct();
    if (typeof renderSummary === 'function') renderSummary();
    if (typeof Cart !== 'undefined') Cart.render();
});
