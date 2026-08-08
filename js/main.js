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
