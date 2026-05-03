/* ═══════════════════════════════════════════════════════════
   CEYLON GOLD — Main JS (shared across all pages)
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Scroll Nav ─────────────────────────────────────────
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ─── Scroll Reveal ──────────────────────────────────────
  window.revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('active');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ─── Counter Animations ─────────────────────────────────
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = target / 70;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = Math.floor(current);
        }, 20);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  // ─── Cart Buttons ────────────────────────────────────────
  document.querySelectorAll('#cartBtn').forEach(btn => btn.addEventListener('click', openCart));
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('closeCart')?.addEventListener('click', closeCart);

  // ─── Keyboard Shortcuts ──────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });

  // ─── Active Nav Link ─────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === currentPage || (currentPage === 'index.html' && href === '../index.html'))) {
      a.classList.add('active');
    }
  });

  // ─── Language Selector / Translator ────────────────────────
  const navActions = document.querySelector('.nav-actions');
  if (navActions && !document.querySelector('.lang-selector')) {
    const langSelector = document.createElement('div');
    langSelector.className = 'lang-selector';
    langSelector.innerHTML = `
      <select id="currencySelector" onchange="window.setCurrency(this.value)" style="margin-right:8px; border:none; background:none; font-size:0.7rem; cursor:pointer;">
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
        <option value="PLN">PLN (zł)</option>
        <option value="LKR">LKR (Rs)</option>
      </select>
      <select id="googleLangSelector" onchange="doGTranslate(this.value)" style="border:none; background:none; font-size:0.7rem; cursor:pointer;">
        <option value="en">EN</option>
        <option value="de">DE</option>
        <option value="pl">PL</option>
        <option value="si">සිං</option>
      </select>
      <div id="google_translate_element" style="display:none;"></div>
    `;
    navActions.insertBefore(langSelector, navActions.firstChild);
    
    // Inject Google Translate Scripts
    const gtScript = document.createElement('script');
    gtScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(gtScript);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'en', 
        includedLanguages: 'en,si,ta,de,pl', 
        autoDisplay: false
      }, 'google_translate_element');
    };

    window.doGTranslate = function(lang) {
      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event('change'));
      }
    };
  }

  // ─── Page fade in ────────────────────────────────────────
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease-in-out';
  setTimeout(() => document.body.style.opacity = '1', 50);
});

// ─── Currency Conversion Logic ────────────────────────────
window.currentCurrency = 'USD';
window.exchangeRates = { USD: 1, EUR: 0.92, PLN: 3.98, LKR: 300 };
window.currencySymbols = { USD: '$', EUR: '€', PLN: 'zł', LKR: 'Rs' };

window.setCurrency = function(curr) {
  window.currentCurrency = curr;
  window.dispatchEvent(new Event('currencyChanged'));
};

window.formatPrice = function(usdValue, pricesObj) {
  const sym = window.currencySymbols[window.currentCurrency];
  let converted;
  if (pricesObj && pricesObj[window.currentCurrency] !== undefined && pricesObj[window.currentCurrency] > 0) {
    converted = Number(pricesObj[window.currentCurrency]);
  } else {
    const rate = window.exchangeRates[window.currentCurrency];
    converted = usdValue * rate;
  }
  return sym + converted.toFixed(2);
};

// ─── Settings / Global Logo Overrides ──────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await API.get('/settings');
    if (res.success && res.settings && res.settings.logoUrl) {
      window.globalLogoUrl = res.settings.logoUrl;
      document.querySelectorAll('.logo').forEach(el => {
         el.innerHTML = `<img src="${res.settings.logoUrl}" style="max-height:35px;" alt="Logo" />`;
      });
    }
  } catch(err) {
    // Fail silently
  }
});
