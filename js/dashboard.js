/* SchedulAI - Dashboard JS */
'use strict';

// ===== Mobile Nav =====
const navHamburger = document.getElementById('navHamburger');
const navMenu = document.getElementById('navMenu');
if (navHamburger && navMenu) {
  navHamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navHamburger.setAttribute('aria-expanded', isOpen);
  });
}

// ===== Taste Profile Data =====
const tasteData = [
  { label: '🍝 이탈리안 요리', pct: 90 },
  { label: '🎲 보드게임', pct: 78 },
  { label: '🎷 재즈/공연 감상', pct: 65 },
  { label: '☕ 분위기 있는 카페', pct: 83 },
  { label: '🌿 자연 & 야외 활동', pct: 55 },
];

function renderTasteList() {
  const el = document.getElementById('tasteList');
  if (!el) return;

  el.innerHTML = tasteData.map(item => `
    <div class="taste-item">
      <div class="taste-row">
        <span class="taste-label">${item.label}</span>
        <span class="taste-pct">${item.pct}%</span>
      </div>
      <div class="taste-bar-bg" role="progressbar" aria-valuenow="${item.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${item.label} 취향 점수 ${item.pct}%">
        <div class="taste-bar-fill" style="width:0%" data-pct="${item.pct}"></div>
      </div>
    </div>
  `).join('');

  // Animate bars after render
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.querySelectorAll('.taste-bar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-pct') + '%';
      });
    }, 300);
  });
}

// ===== KPI Counter Animation =====
function animateKPIs() {
  const kpiValues = document.querySelectorAll('.kpi-value');
  kpiValues.forEach(el => {
    const raw = el.textContent.trim();
    const isFloat = raw.includes('.');
    const hasPct = raw.includes('%');
    const num = parseFloat(raw.replace('%', ''));

    if (isNaN(num)) return;

    const duration = 1000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat
        ? (eased * num).toFixed(1)
        : Math.floor(eased * num);
      el.textContent = current + (hasPct ? '%' : '');
      if (progress < 1) requestAnimationFrame(update);
    }

    el.textContent = '0' + (hasPct ? '%' : '');
    requestAnimationFrame(update);
  });
}

// ===== Calendar navigation (simple demo) =====
const calNavBtns = document.querySelectorAll('.cal-nav-btn');
const calNavTitle = document.querySelector('.cal-nav-title');

const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
let currentMonthIdx = 3; // April

calNavBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    currentMonthIdx = (currentMonthIdx + (i === 0 ? -1 : 1) + 12) % 12;
    if (calNavTitle) {
      calNavTitle.textContent = `2026년 ${months[currentMonthIdx]}`;
    }
  });
});

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  renderTasteList();

  // Animate KPIs on load with slight delay
  setTimeout(animateKPIs, 400);
});
