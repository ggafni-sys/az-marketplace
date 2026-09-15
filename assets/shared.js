/* ==========================================================================
   AZALEA MARKETPLACE — Shared JS
   ==========================================================================
   In-memory cart store (Claude.ai artifacts/sandbox don't persist localStorage,
   but a normal browser will keep it across pages within the session via the
   sessionStorage fallback).
*/

(function () {
  const CART_KEY = 'azalea_cart';
  const SAVED_KEY = 'azalea_saved';

  function getStore() {
    try { return window.sessionStorage; } catch (_) { return null; }
  }

  function read(key) {
    const s = getStore();
    if (!s) return [];
    try { return JSON.parse(s.getItem(key) || '[]'); } catch (_) { return []; }
  }
  function write(key, val) {
    const s = getStore();
    if (s) s.setItem(key, JSON.stringify(val));
  }

  const Cart = {
    all() { return read(CART_KEY); },
    count() { return this.all().reduce((n, it) => n + (it.qty || 1), 0); },
    subtotal() { return this.all().reduce((sum, it) => sum + (it.price * (it.qty || 1)), 0); },
    add(item) {
      const cart = this.all();
      const existing = cart.find(c => c.id === item.id);
      if (existing) { existing.qty = (existing.qty || 1) + (item.qty || 1); }
      else { cart.push({ qty: 1, ...item }); }
      write(CART_KEY, cart);
      this.refreshBadge(true);
      return cart;
    },
    setQty(id, qty) {
      const cart = this.all().map(it => it.id === id ? { ...it, qty: Math.max(1, qty) } : it);
      write(CART_KEY, cart);
      this.refreshBadge();
    },
    remove(id) {
      const cart = this.all().filter(it => it.id !== id);
      write(CART_KEY, cart);
      this.refreshBadge(true);
    },
    clear() { write(CART_KEY, []); this.refreshBadge(true); },
    refreshBadge(bump) {
      document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = this.count();
        if (bump) {
          el.classList.remove('bump');
          void el.offsetWidth; // restart animation
          el.classList.add('bump');
        }
      });
    }
  };

  const Saved = {
    all() { return read(SAVED_KEY); },
    count() { return this.all().length; },
    has(id) { return this.all().some(it => it.id === id); },
    toggle(item) {
      let saved = this.all();
      if (this.has(item.id)) saved = saved.filter(it => it.id !== item.id);
      else saved.push(item);
      write(SAVED_KEY, saved);
      this.refreshBadge(true);
      return this.has(item.id);
    },
    refreshBadge(bump) {
      document.querySelectorAll('[data-saved-count]').forEach(el => {
        el.textContent = this.count();
        if (bump) {
          el.classList.remove('bump');
          void el.offsetWidth;
          el.classList.add('bump');
        }
      });
    }
  };

  /* ============================ Toasts ============================ */
  function ensureToastWrap() {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    return wrap;
  }
  function toast(message, kind) {
    const wrap = ensureToastWrap();
    const t = document.createElement('div');
    t.className = 'toast toast-' + (kind || 'success');
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
    };
    t.innerHTML = (icons[kind] || icons.success) + '<span>' + message + '</span>';
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2600);
  }

  /* ============================ Scroll reveal ============================ */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ============================ Number counter ============================ */
  function initCounters() {
    const els = document.querySelectorAll('[data-count-to]');
    if (!els.length) return;
    const animate = (el) => {
      const target = parseFloat(el.dataset.countTo);
      const decimals = parseInt(el.dataset.countDecimals || '0', 10);
      const prefix = el.dataset.countPrefix || '';
      const suffix = el.dataset.countSuffix || '';
      const duration = parseInt(el.dataset.countDuration || '1100', 10);
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = target * eased;
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(animate); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(e => io.observe(e));
  }

  /* ============================ Init ============================ */
  function init() {
    Cart.refreshBadge();
    Saved.refreshBadge();
    initReveal();
    initCounters();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* ============================ Public API ============================ */
  window.Azalea = { Cart, Saved, toast };
})();
