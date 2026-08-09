/* ═══════════════════════════════════════════════════ */
/* PROVB3 GLOBAL — Main JS                             */
/* ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Mobile navigation ── */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    const spans = navToggle.querySelectorAll('span');

    const setBurger = (open) => {
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(4px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(4px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    };

    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      setBurger(open);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        setBurger(false);
      });
    });
  }

  /* ── Navbar state on scroll ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Scroll reveal ── */
  const revealTargets =
    '.card, .process-step, .pricing-card, .work-card, .pillar, .stat, ' +
    '.book, .testimonial-card, .cta-banner, .split-section > div, .reveal';

  document.addEventListener('DOMContentLoaded', () => {
    const els = document.querySelectorAll(revealTargets);

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('reveal', 'visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.revealIndex || '0', 10) * 70;
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    els.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });

    // Stagger siblings inside each grid
    document
      .querySelectorAll('.card-grid, .work-grid, .shelf, .pillars, .stats-grid, .process-grid, .pricing-grid')
      .forEach((grid) => {
        Array.from(grid.children).forEach((child, i) => {
          child.dataset.revealIndex = String(Math.min(i, 5));
        });
      });
  });

  /* ── Counting stat numbers ── */
  document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach((el) => {
        el.textContent = el.dataset.count + (el.dataset.suffix || '');
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const duration = 1400;
          const start = performance.now();

          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => io.observe(el));
  });

  /* ── Portfolio filtering ── */
  document.addEventListener('DOMContentLoaded', () => {
    const chips = document.querySelectorAll('.filter-chip');
    const items = document.querySelectorAll('[data-category]');
    if (!chips.length || !items.length) return;

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.dataset.filter;
        items.forEach((item) => {
          const match = filter === 'all' || item.dataset.category.includes(filter);
          item.style.display = match ? '' : 'none';
        });
      });
    });
  });

  /* ── Beam-reactive panel edges ──
     The two sweeping beams are CSS animations on html::before / html::after,
     so they stay on the compositor. Rather than re-implement their motion in
     JS (which would drift out of sync), we read their real clocks via the Web
     Animations API and light each panel as a beam passes over it. */
  document.addEventListener('DOMContentLoaded', () => {
    if (reduceMotion || typeof document.getAnimations !== 'function') return;

    const panels = Array.from(
      document.querySelectorAll('.pillar, .card, .work-card, .pricing-card')
    );
    if (!panels.length) return;

    // Falloff outside a panel's own bounds, in px. Wide enough that the edge
    // begins to catch light just before the beam arrives.
    const FALLOFF = 190;

    // Cache document-relative geometry so the loop never calls
    // getBoundingClientRect. Refreshed on resize and after reveals settle.
    let boxes = [];
    const measure = () => {
      const sx = window.scrollX, sy = window.scrollY;
      boxes = panels.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, top: r.top + sy, bottom: r.bottom + sy, left: r.left + sx, right: r.right + sx };
      });
    };
    measure();
    window.addEventListener('resize', measure);
    // Scroll-reveal shifts panels by 26px; re-measure once things settle.
    setTimeout(measure, 1200);
    setInterval(measure, 2000);

    // The beams are CSS animations on pseudo-elements. They may not exist yet
    // at DOMContentLoaded, so keep looking rather than bailing out.
    let fall = null, cross = null;
    const findBeams = () => {
      const running = document.getAnimations();
      fall  = running.find((a) => a.animationName === 'beam-fall')  || null;
      cross = running.find((a) => a.animationName === 'beam-cross') || null;
      return !!(fall || cross);
    };
    findBeams();

    // Beam progress -> viewport position, matching the keyframes:
    // translate runs from -4 to +104 of the viewport axis.
    const positionOf = (anim, axisPx) => {
      if (!anim || anim.currentTime == null) return null;
      const dur = anim.effect.getTiming().duration;
      if (!dur) return null;
      const progress = ((anim.currentTime % dur) + dur) % dur / dur;
      return (-4 + progress * 108) / 100 * axisPx;
    };

    // 1 while the beam is over the panel, easing to 0 across FALLOFF.
    const intensity = (pos, a, b) => {
      if (pos == null) return 0;
      if (pos >= a && pos <= b) return 1;
      const d = pos < a ? a - pos : pos - b;
      if (d >= FALLOFF) return 0;
      const t = 1 - d / FALLOFF;
      return t * t; // ease in, so the glow blooms rather than ramps linearly
    };

    const prev = new WeakMap();

    let retry = 0;
    const tick = () => {
      // Keep retrying until the pseudo-element animations register.
      if (!fall && !cross && ++retry % 20 === 0) findBeams();

      const vh = window.innerHeight, vw = window.innerWidth;
      const beamY = positionOf(fall, vh);
      const beamX = positionOf(cross, vw);
      const sy = window.scrollY, sx = window.scrollX;

      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i];
        // Document coords -> current viewport coords
        const top = b.top - sy, bottom = b.bottom - sy;
        const left = b.left - sx, right = b.right - sx;

        let c = 0, o = 0;
        // Skip anything comfortably off-screen
        if (bottom > -FALLOFF && top < vh + FALLOFF) {
          c = intensity(beamY, top, bottom);   // cyan scan falls
          o = intensity(beamX, left, right);   // orange trace crosses
        }

        const p = prev.get(b.el);
        // Only touch the DOM when the value actually moves
        if (p && Math.abs(p.c - c) < 0.01 && Math.abs(p.o - o) < 0.01) continue;
        prev.set(b.el, { c, o });

        const st = b.el.style;
        st.setProperty('--lit-c', c.toFixed(3));
        st.setProperty('--lit-o', o.toFixed(3));
        st.setProperty('--edge-a', Math.max(c, o).toFixed(3));
        st.setProperty('--edge-rgb', o > c ? '255, 122, 24' : '77, 232, 255');
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Animations restart when the tab is re-shown; re-acquire the handles.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { findBeams(); measure(); }
    });
  });

  /* ── FAQ accordion ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-q').forEach((btn) => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', () => {
        const isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
        answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : '0';
      });
    });
  });
})();
