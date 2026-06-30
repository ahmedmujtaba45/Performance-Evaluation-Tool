/* =======================================================
   EvaluAI – Performance History Scripts
   File    : performance-history.js
   Sections:
     1. Shared UI helpers  (dropdowns, notifications, nav)
     2. Quarter filter tabs
     3. Evaluation accordion (expand / collapse)
     4. Trend chart  (Chart.js)
     5. Counter animations
     6. Init
======================================================= */

/* -------------------------------------------------------
   1. SHARED UI HELPERS
   (Identical logic lives in employee-dashboard.js)
------------------------------------------------------- */

/** Toggle a notification or user dropdown open / closed. */
function toggleDropdown(dropdownId) {
  const target = document.getElementById(dropdownId);
  if (!target) return;

  const isOpen = target.classList.contains('open');

  // Close every open dropdown first
  document.querySelectorAll('.notif-dropdown.open, .user-dropdown.open')
          .forEach(el => el.classList.remove('open'));

  if (!isOpen) target.classList.add('open');
}

// Close all dropdowns on outside click
document.addEventListener('click', function (e) {
  if (!e.target.closest('.notif-wrap') && !e.target.closest('#userPillWrap')) {
    document.querySelectorAll('.notif-dropdown.open, .user-dropdown.open')
            .forEach(el => el.classList.remove('open'));
  }
});

/** Fade out unread dots and notification count badge. */
function markAllRead() {
  document.querySelectorAll('.notif-dot').forEach(d => d.classList.add('read'));
  const badge = document.getElementById('notifCount');
  if (badge) badge.style.opacity = '0';
}

/**
 * Set the sidebar active item based on the current HTML filename.
 * Each <a class="nav-item"> needs a data-page attribute.
 */
function setNavActive() {
  const page = location.pathname.split('/').pop() || 'performance-history.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

/* -------------------------------------------------------
   2. QUARTER FILTER TABS
------------------------------------------------------- */

/**
 * Activate a filter tab and show only matching eval cards.
 * @param {HTMLElement} tabEl  – the clicked .ph-tab element
 * @param {string}      value  – 'all' or a quarter string like 'Q1 2026'
 */
function filterQuarter(tabEl, value) {
  // Update active tab
  document.querySelectorAll('.ph-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');

  const items  = document.querySelectorAll('.eval-item');
  let   visible = 0;

  items.forEach(item => {
    const match = value === 'all' || item.dataset.quarter === value;
    item.style.display = match ? '' : 'none';
    if (match) visible++;
  });

  // Show empty state if nothing matched
  const empty = document.getElementById('evalEmpty');
  if (empty) empty.classList.toggle('visible', visible === 0);
}

/* -------------------------------------------------------
   3. EVALUATION ACCORDION
------------------------------------------------------- */

/**
 * Toggle the expand / collapse state of a quarterly card.
 * @param {HTMLElement} headerEl – the clicked .eval-header element
 */
function toggleEval(headerEl) {
  const item = headerEl.closest('.eval-item');
  if (!item) return;

  const wasOpen = item.classList.contains('open');

  // Optional: close all others first (comment out to allow multi-open)
  document.querySelectorAll('.eval-item.open').forEach(el => {
    if (el !== item) el.classList.remove('open');
  });

  item.classList.toggle('open', !wasOpen);
}

/* -------------------------------------------------------
   4. TREND CHART (Chart.js)
   Full-width, taller version with 5-quarter history.
------------------------------------------------------- */
function buildTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Gradient beneath the total-score line
  const grad = ctx.createLinearGradient(0, 0, 0, 220);
  grad.addColorStop(0, 'rgba(59, 130, 246, 0.18)');
  grad.addColorStop(1, 'rgba(59, 130, 246, 0)');

  new Chart(ctx, {
    type: 'line',

    data: {
      labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'],

      datasets: [
        {
          label: 'Total Score',
          data: [15.7, 17.2, 18.5, 19.6, 20.8],
          borderColor: '#3b82f6',
          backgroundColor: grad,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 2.5,
          tension: 0.38,
          fill: true,
          order: 1,
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
          tension: 0.38,
          fill: false,
          borderDash: [5, 4],
          order: 2,
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
          padding: 12,
          callbacks: {
            title: items => items[0].label,
            label: ctx => {
              const suffix = ctx.datasetIndex === 0
                ? ` Total Score: ${ctx.parsed.y} / 25`
                : ` Dept. Avg:   ${ctx.parsed.y} / 25`;
              return suffix;
            }
          }
        },

        // Annotation: draw a dashed "target" reference line at y = 20
        annotation: null
      },

      scales: {
        x: {
          grid:  { color: '#f3f4f6', drawBorder: false },
          ticks: {
            font: { size: 11, family: "'Inter', sans-serif" },
            color: '#9ca3af',
          }
        },
        y: {
          min: 10,
          max: 25,
          grid:  { color: '#f3f4f6', drawBorder: false },
          ticks: {
            stepSize: 5,
            font: { size: 11, family: "'Inter', sans-serif" },
            color: '#9ca3af',
            callback: val => val + ' pts'
          }
        }
      }
    }
  });
}

/* -------------------------------------------------------
   5. COUNTER ANIMATION (stat cards)
   @param {string} id       – element id
   @param {number} target   – final value
   @param {number} decimals – decimal places
   @param {number} duration – ms
------------------------------------------------------- */
function animateCounter(id, target, decimals, duration) {
  const el = document.getElementById(id);
  if (!el) return;

  const start = performance.now();

  (function frame(now) {
    const t    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
    el.textContent = (target * ease).toFixed(decimals);
    if (t < 1) requestAnimationFrame(frame);
  })(start);
}

/* -------------------------------------------------------
   6. INIT
------------------------------------------------------- */
window.addEventListener('load', function () {
  setNavActive();

  // Animate the 4 stat card numbers
  animateCounter('stat-avg',         18.4, 1,  900);
  animateCounter('stat-best',        20.8, 1,  900);
  animateCounter('stat-total-evals',    5, 0,  600);
  animateCounter('stat-improvement',  5.1, 1,  900);

  buildTrendChart();

  // Auto-open the most recent evaluation on load
  const first = document.querySelector('.eval-item');
  if (first) first.classList.add('open');
});
