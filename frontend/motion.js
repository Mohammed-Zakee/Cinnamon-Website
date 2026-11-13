/* Lightweight native motion. Content remains visible when motion is unavailable. */
(() => {
  if (!Element.prototype.animate || !window.matchMedia) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const active = new Set();
  const observed = new WeakSet();
  const interactive = new WeakSet();
  let enabled = !preference.matches;
  let revealObserver;
  let scrollFrame = 0;

  function play(element, frames, options = {}) {
    if (!enabled || !element) return;
    const animation = element.animate(frames, {
      duration: 650,
      easing: 'cubic-bezier(.2,.75,.25,1)',
      ...options
    });
    active.add(animation);
    const release = () => active.delete(animation);
    animation.addEventListener('finish', release, { once: true });
    animation.addEventListener('cancel', release, { once: true });
    return animation;
  }

  function reveal(element, delay = 0) {
    play(element, [
      { opacity: 0, transform: 'translate3d(0,24px,0)' },
      { opacity: 1, transform: 'translate3d(0,0,0)' }
    ], { duration: 740, delay, fill: 'backwards' });
  }

  function bindCard(card) {
    if (interactive.has(card)) return;
    interactive.add(card);
    let frame = 0;
    let point;
    card.addEventListener('pointermove', event => {
      if (!enabled || !finePointer.matches || event.pointerType === 'touch') return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!card.isConnected || !enabled) return;
        const box = card.getBoundingClientRect();
        if (!box.width || !box.height) return;
        const x = Math.min(1, Math.max(0, (point.x - box.left) / box.width));
        const y = Math.min(1, Math.max(0, (point.y - box.top) / box.height));
        card.style.setProperty('--tilt-x', `${(0.5 - y) * 3}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 3}deg`);
        card.style.setProperty('--glow-x', `${x * 100}%`);
        card.style.setProperty('--glow-y', `${y * 100}%`);
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  }

  function watchContent() {
    document.querySelectorAll('.product').forEach(bindCard);
    if (!enabled || !revealObserver) return;
    document.querySelectorAll([
      '.section-heading', '.product', '.story-photo', '.story-copy',
      '.ritual-visual', '.ritual-content', '.faq>div',
      '.order-steps article', '.closing>p', '.closing>h2', '.closing>.button'
    ].join(',')).forEach(element => {
      if (observed.has(element)) return;
      observed.add(element);
      revealObserver.observe(element);
    });
  }

  function updateScroll() {
    scrollFrame = 0;
    if (!enabled) return;
    const distance = Math.max(1, root.scrollHeight - innerHeight);
    root.style.setProperty('--reading-progress', String(Math.max(0, Math.min(1, scrollY / distance))));
    document.querySelector('header')?.classList.toggle('motion-scrolled', scrollY > 32);
  }

  function queueScroll() {
    if (enabled && !scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }

  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        if (!entry.target.isConnected || !entry.target.parentElement) return;
        const staggered = entry.target.matches('.product,.order-steps article');
        const index = staggered ? [...entry.target.parentElement.children].indexOf(entry.target) : 0;
        reveal(entry.target, Math.min(index, 3) * 85);
      });
    }, { threshold: 0.09, rootMargin: '0px 0px -24px 0px' });
  }

  function setMotion() {
    enabled = !preference.matches;
    root.classList.toggle('motion-enabled', enabled);
    if (!enabled) {
      active.forEach(animation => animation.cancel());
      active.clear();
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      root.style.removeProperty('--reading-progress');
      document.querySelector('header')?.classList.remove('motion-scrolled');
    } else {
      watchContent();
      updateScroll();
    }
  }

  preference.addEventListener('change', setMotion);
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll, { passive: true });
  setMotion();

  if (enabled) {
    document.querySelectorAll('.hero-copy>*').forEach((element, index) => {
      play(element, [
        { opacity: 0, transform: 'translate3d(0,20px,0)' },
        { opacity: 1, transform: 'translate3d(0,0,0)' }
      ], { duration: 900, delay: 80 + index * 100, fill: 'backwards' });
    });
    play(document.querySelector('.hero-image'), [
      { opacity: 0, transform: 'translateY(28px) rotate(3deg) scale(.97)' },
      { opacity: 1, transform: 'translateY(0) rotate(1.4deg) scale(1)' }
    ], { duration: 1150, delay: 100, fill: 'backwards' });
  }

  const hero = document.querySelector('.hero-image');
  if (hero) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        root.classList.toggle('hero-visible', entries[0].isIntersecting);
      }, { threshold: 0 }).observe(hero);
    }
    let heroFrame = 0;
    let point;
    hero.addEventListener('pointermove', event => {
      if (!enabled || !finePointer.matches || event.pointerType === 'touch') return;
      point = { x: event.clientX, y: event.clientY };
      if (heroFrame) return;
      heroFrame = requestAnimationFrame(() => {
        heroFrame = 0;
        const box = hero.getBoundingClientRect();
        hero.style.setProperty('--photo-x', `${((point.x - box.left) / box.width - .5) * -12}px`);
        hero.style.setProperty('--photo-y', `${((point.y - box.top) / box.height - .5) * -12}px`);
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      cancelAnimationFrame(heroFrame);
      heroFrame = 0;
      hero.style.setProperty('--photo-x', '0px');
      hero.style.setProperty('--photo-y', '0px');
    });
  }

  const products = document.getElementById('products');
  if (products) new MutationObserver(watchContent).observe(products, { childList: true });

  const count = document.getElementById('count');
  if (count) {
    let previous = Number(count.textContent);
    new MutationObserver(() => {
      const next = Number(count.textContent);
      if (next > previous) {
        document.querySelectorAll('#count,#mobileCount').forEach(badge => play(badge, [
          { transform: 'scale(1)' },
          { transform: 'scale(1.38)', offset: .4 },
          { transform: 'scale(1)' }
        ], { duration: 440, easing: 'cubic-bezier(.2,.8,.2,1)' }));
      }
      previous = next;
    }).observe(count, { childList: true, characterData: true, subtree: true });
  }

  document.querySelectorAll('dialog').forEach(dialog => {
    new MutationObserver(() => {
      if (!dialog.open) return;
      play(dialog, [
        { opacity: 0, transform: 'translateY(30px) scale(.98)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], { duration: 380 });
      dialog.querySelectorAll('.cart-row,.detail-copy>*').forEach((element, index) => {
        reveal(element, Math.min(index, 5) * 40);
      });
    }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
})();
