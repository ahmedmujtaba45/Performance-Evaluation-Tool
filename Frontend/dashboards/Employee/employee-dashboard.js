/* =======================================================
   EvaluAI – Employee Dashboard (Overview) Scripts
   File    : employee-dashboard.js
   Sections:
     1. Shared UI helpers  (dropdowns, notifications, nav)
     2. Score card counter animation
     3. Progress bar animation
     4. Overview chart  (Chart.js)
     5. Init
======================================================= */

/* -------------------------------------------------------
   1. SHARED UI HELPERS
   (Identical logic in performance-history.js)
------------------------------------------------------- */

function toggleDropdown(dropdownId) {
  const target = document.getElementById(dropdownId);
  if (!target) return;

  const isOpen = target.classList.contains('open');

  document.querySelectorAll('.notif-dropdown.open, .user-dropdown.open')
          .forEach(el => el.classList.remove('open'));

  if (!isOpen) target.classList.add('open');
}

document.addEventListener('click', function (e) {
  if (!e.target.closest('.notif-wrap') && !e.target.closest('#userPillWrap')) {
    document.querySelectorAll('.notif-dropdown.open, .user-dropdown.open')
            .forEach(el => el.classList.remove('open'));
  }
});

function markAllRead() {
  document.querySelectorAll('.notif-dot').forEach(d => d.classList.add('read'));
  const badge = document.getElementById('notifCount');
  if (badge) badge.style.opacity = '0';
}

/**
 * Set the sidebar active item based on the current HTML filename.
 * Each <a class="nav-item"> should have a data-page attribute.
 */
function setNavActive() {
  const page = location.pathname.split('/').pop() || 'employee-dashboard.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

/* -------------------------------------------------------
   2. SCORE CARD COUNTER ANIMATION
------------------------------------------------------- */
function animateCounter(elId, target, decimals, duration) {
  const el = document.getElementById(elId);
  if (!el) return;

  const start = performance.now();

  (function frame(now) {
    const t    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * ease).toFixed(decimals);
    if (t < 1) requestAnimationFrame(frame);
  })(start);
}

/* -------------------------------------------------------
   3. PROGRESS BAR ANIMATION
------------------------------------------------------- */
function animateProgressBars() {
  document.querySelectorAll('.prog-fill[data-width]').forEach(bar => {
    const target = parseFloat(bar.dataset.width);
    setTimeout(() => { bar.style.width = target + '%'; }, 200);
  });
}

/* -------------------------------------------------------
   4. OVERVIEW CHART (compact, 180px)
------------------------------------------------------- */
function buildChart() {
  const canvas = document.getElementById('perfChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, 'rgba(59,130,246,0.15)');
  gradient.addColorStop(1, 'rgba(59,130,246,0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'],
      datasets: [
        {
          label: 'Total Score',
          data: [15.7, 17.2, 18.5, 19.6, 20.8],
          borderColor: '#3b82f6',
          backgroundColor: gradient,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Dept. Average',
          data: [15.7, 16.1, 16.8, 17.5, 18.1],
          borderColor: '#9ca3af',
          backgroundColor: 'transparent',
          pointBackgroundColor: '#9ca3af',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 1.8,
          tension: 0.35,
          fill: false,
          borderDash: [5, 4],
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#f9fafb',
          bodyColor: '#d1d5db',
          cornerRadius: 8,
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} / 25`
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#f3f4f6', drawBorder: false },
          ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: '#9ca3af' }
        },
        y: {
          min: 10, max: 25,
          grid: { color: '#f3f4f6', drawBorder: false },
          ticks: {
            stepSize: 5,
            font: { size: 11, family: "'Inter', sans-serif" },
            color: '#9ca3af'
          }
        }
      }
    }
  });
}

/* -------------------------------------------------------
   5. INIT
------------------------------------------------------- */
window.addEventListener('load', function () {
  setNavActive();
  animateCounter('val-mgr',   16.8, 1,  900);
  animateCounter('val-hr',     4.0, 1,  700);
  animateCounter('val-total', 20.8, 1, 1100);
  animateProgressBars();
  buildChart();
});
