/* ==============================
   An Quach — Portfolio JS
   Scroll reveal + navigation + cat companion + tweaks
   ============================== */

(function () {
  'use strict';

  // --- Nav scroll state ---
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Hero loaded animation ---
  const hero = document.querySelector('.hero, .proj-hero');
  if (hero) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => hero.classList.add('loaded'));
    });
  }

  // --- Scroll reveal (Intersection Observer) ---
  const revealEls = document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale, [data-stagger], .step');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          // Animate step number once visible
          if (entry.target.classList.contains('step')) {
            // keep observing so exit doesn't remove — remove later:
            io.unobserve(entry.target);
          } else {
            io.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // --- Cat scroll companion ---
  const cat = document.querySelector('.cat-companion');
  if (cat) {
    let lastY = window.scrollY;
    const onCatScroll = () => {
      const y = window.scrollY;
      if (y > 400) cat.classList.add('show');
      else cat.classList.remove('show');
      // flip direction
      const goingDown = y > lastY;
      cat.style.transform = goingDown ? 'scaleX(1)' : 'scaleX(-1)';
      lastY = y;
    };
    window.addEventListener('scroll', onCatScroll, { passive: true });
  }

  // --- Back-to-top cat button ---
  const catTop = document.querySelector('.cat-top');
  if (catTop) {
    const onTopScroll = () => {
      if (window.scrollY > 600) catTop.classList.add('show');
      else catTop.classList.remove('show');
    };
    window.addEventListener('scroll', onTopScroll, { passive: true });
    catTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Keyboard nav (J/K or arrows jump between section-like anchors) ---
  const sections = Array.from(document.querySelectorAll('[data-jump]'));
  if (sections.length) {
    const jumpTo = (dir) => {
      const y = window.scrollY + 100;
      const idx = sections.findIndex((s, i) => {
        const top = s.getBoundingClientRect().top + window.scrollY;
        const next = sections[i + 1];
        const nextTop = next ? next.getBoundingClientRect().top + window.scrollY : Infinity;
        return y >= top && y < nextTop;
      });
      let target;
      if (dir > 0) target = sections[Math.min(idx + 1, sections.length - 1)];
      else target = sections[Math.max(idx - 1, 0)];
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'j' || e.key === 'ArrowDown' && e.shiftKey) { e.preventDefault(); jumpTo(1); }
      else if (e.key === 'k' || e.key === 'ArrowUp' && e.shiftKey) { e.preventDefault(); jumpTo(-1); }
    });
  }

  // --- Tweaks panel (color palette + display font) ---
  const tweaksPanel = document.querySelector('.tweaks-panel');
  if (tweaksPanel) {
    const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
      "palette": "ivory-burgundy",
      "displayFont": "cormorant"
    }/*EDITMODE-END*/;

    let state = { ...TWEAK_DEFAULTS };
    try {
      const saved = localStorage.getItem('anq-tweaks');
      if (saved) state = { ...state, ...JSON.parse(saved) };
    } catch (e) {}

    const applyPalette = (p) => {
      const root = document.documentElement;
      if (p === 'ivory-burgundy') {
        root.style.setProperty('--ivory', '#f7f2e7');
        root.style.setProperty('--ivory-deep', '#efe6d3');
        root.style.setProperty('--burgundy', '#5a1a1f');
        root.style.setProperty('--burgundy-deep', '#3d1014');
        root.style.setProperty('--gold', '#a87847');
        root.style.setProperty('--gold-soft', '#c89a6b');
      } else if (p === 'cream-oxblood') {
        root.style.setProperty('--ivory', '#f5ede0');
        root.style.setProperty('--ivory-deep', '#e8dcc4');
        root.style.setProperty('--burgundy', '#3a0c12');
        root.style.setProperty('--burgundy-deep', '#24060b');
        root.style.setProperty('--gold', '#9a6a3d');
        root.style.setProperty('--gold-soft', '#c29a6b');
      } else if (p === 'linen-forest') {
        root.style.setProperty('--ivory', '#f4f1e6');
        root.style.setProperty('--ivory-deep', '#e6e0cd');
        root.style.setProperty('--burgundy', '#2c4a3a');
        root.style.setProperty('--burgundy-deep', '#1a2e24');
        root.style.setProperty('--gold', '#a87847');
        root.style.setProperty('--gold-soft', '#c89a6b');
      }
    };
    const applyFont = (f) => {
      const root = document.documentElement;
      if (f === 'cormorant') root.style.setProperty('--font-serif', '"Cormorant Garamond", Georgia, serif');
      else if (f === 'ebgaramond') root.style.setProperty('--font-serif', '"EB Garamond", Georgia, serif');
      else if (f === 'fraunces') root.style.setProperty('--font-serif', '"Fraunces", Georgia, serif');
    };
    const applyAll = () => { applyPalette(state.palette); applyFont(state.displayFont); };

    const paletteSwatches = tweaksPanel.querySelectorAll('[data-palette]');
    paletteSwatches.forEach(sw => {
      sw.addEventListener('click', () => {
        state.palette = sw.dataset.palette;
        paletteSwatches.forEach(x => x.classList.toggle('active', x === sw));
        applyPalette(state.palette);
        save();
      });
      if (sw.dataset.palette === state.palette) sw.classList.add('active');
    });

    const fontSel = tweaksPanel.querySelector('[data-font]');
    if (fontSel) {
      fontSel.value = state.displayFont;
      fontSel.addEventListener('change', () => {
        state.displayFont = fontSel.value;
        applyFont(state.displayFont);
        save();
      });
    }

    function save() {
      try { localStorage.setItem('anq-tweaks', JSON.stringify(state)); } catch (e) {}
      try {
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: state }, '*');
      } catch (e) {}
    }

    applyAll();

    // Tweaks host integration
    window.addEventListener('message', (e) => {
      if (!e.data || !e.data.type) return;
      if (e.data.type === '__activate_edit_mode') tweaksPanel.classList.add('show');
      else if (e.data.type === '__deactivate_edit_mode') tweaksPanel.classList.remove('show');
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
  }

  // --- Smooth anchor scrolling offset (account for fixed nav) ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const t = document.querySelector(id);
        if (t) {
          e.preventDefault();
          const top = t.getBoundingClientRect().top + window.scrollY - 56;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

})();
