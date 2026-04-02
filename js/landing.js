/* SchedulAI - Landing Page JS */
'use strict';

// ===== Mobile Navigation =====
const navHamburger = document.getElementById('navHamburger');
const navMenu = document.getElementById('navMenu');

if (navHamburger && navMenu) {
  navHamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navHamburger.setAttribute('aria-expanded', isOpen);
    navHamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navHamburger.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
      navHamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on nav link click
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navHamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== Scroll-based nav shadow =====
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.style.boxShadow = '0 2px 20px rgba(79,110,247,0.10)';
    } else {
      nav.style.boxShadow = '0 1px 8px rgba(79,110,247,0.06)';
    }
  }, { passive: true });
}

// ===== Intersection Observer: fade-in animations =====
const fadeEls = document.querySelectorAll('.feature-card, .how-step, .pricing-card, .demo-source');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '0';
      entry.target.style.transform = 'translateY(24px)';
      setTimeout(() => {
        entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, 60 * (Array.from(entry.target.parentElement.children).indexOf(entry.target) % 4));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

// ===== Counter animation for hero stats =====
function animateCounter(el, target, suffix, duration = 1200) {
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = isFloat ? (eased * target).toFixed(1) : Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const stats = entry.target.querySelectorAll('.hero-stat .value');
      const targets = [85, 3, 100];
      const suffixes = ['%', 'x', '%'];
      stats.forEach((el, i) => animateCounter(el, targets[i], suffixes[i]));
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);
