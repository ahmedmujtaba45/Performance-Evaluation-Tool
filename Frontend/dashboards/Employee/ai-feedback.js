/* =======================================================
   EvaluAI – AI Feedback Scripts
   File    : ai-feedback.js
   Sections:
     1. Shared UI helpers  (dropdowns, notifications, nav)
     2. AI Summary typing animation
     3. Confidence bar + counter animations
     4. KPI Feedback accordion
     5. Recommendation checkbox toggle
     6. Radar chart  (Chart.js)
     7. Score Prediction chart  (Chart.js)
     8. Expand / collapse inner score bars
     9. Init
======================================================= */

/* -------------------------------------------------------
   1. SHARED UI HELPERS
------------------------------------------------------- */
function toggleDropdown(id) {
  const target = document.getElementById(id);
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

function setNavActive() {
  const page = location.pathname.split('/').pop() || 'ai-feedback.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

/* -------------------------------------------------------
   2. AI SUMMARY TYPING ANIMATION
   Renders text one character at a time with a blinking
   cursor, then removes the cursor when done.
   @param {string} elId   – id of target element
   @param {string} text   – full text to type
   @param {number} speed  – ms per character (default 18)
   @param {number} delay  – ms before typing starts
------------------------------------------------------- */
function typeText(elId, text, speed = 18, delay = 400) {
  const el = document.getElementById(elId);
  if (!el) return;

  el.textContent = '';
  el.classList.add('typing');

  setTimeout(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i++];
      } else {
        clearInterval(interval);
        el.classList.remove('typing');
      }
    }, speed);
  }, delay);
}

/* -------------------------------------------------------
   3. CONFIDENCE BAR + GENERIC COUNTER ANIMATION
------------------------------------------------------- */
function animateBar(elId, targetPct, duration = 1400, delay = 600) {
  const el = document.getElementById(elId);
  if (!el) return;
  setTimeout(() => { el.style.width = targetPct + '%'; }, delay);
}

function animateCounter(elId, target, decimals, duration, delay = 0) {
  const el = document.getElementById(elId);
  if (!el) return;

  setTimeout(() => {
    const start = performance.now();
    (function frame(now) {
      const t    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * ease).toFixed(decimals);
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }, delay);
}

/* -------------------------------------------------------
   4. KPI FEEDBACK ACCORDION
------------------------------------------------------- */
function toggleKpiFb(headerEl) {
  const item   = headerEl.closest('.kpi-fb-item');
  const wasOpen = item.classList.contains('open');

  // Collapse all first
  document.querySelectorAll('.kpi-fb-item.open').forEach(el => {
    el.classList.remove('open');
  });

  if (!wasOpen) {
    item.classList.add('open');
    // Animate the mini score bars inside the newly opened body
    item.querySelectorAll('.kpi-fbs-fill[data-w]').forEach(bar => {
      bar.style.width = '0';
      requestAnimationFrame(() => {
        bar.style.width = bar.dataset.w + '%';
      });
    });
  }
}

/* -------------------------------------------------------
   5. RECOMMENDATION CHECKBOX TOGGLE
------------------------------------------------------- */
function toggleRec(checkEl) {
  checkEl.classList.toggle('checked');
  const item = checkEl.closest('.rec-item');
  if (item) item.classList.toggle('done');
}

/* -------------------------------------------------------
   6. RADAR CHART (Chart.js)
   Shows 5 KPI scores vs target for Q1 2026.
------------------------------------------------------- */
function buildRadarChart() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'radar',

    data: {
      labels: ['Code Quality', 'Sprint Velocity', 'Documentation', 'Bug Resolution', 'Collaboration'],
      datasets: [
        {
          label: 'Q1 2026',
          data: [4.25, 4.10, 3.90, 3.75, 4.65],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.12)',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          borderWidth: 2.2,
        },
        {
          label: 'Target',
          data: [4.5, 4.5, 4.5, 4.5, 4.5],
          borderColor: '#9ca3af',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [4, 3],
          pointRadius: 0,
          pointHoverRadius: 0,
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#f9fafb',
          bodyColor: '#d1d5db',
          cornerRadius: 8,
          padding: 10,
        }
      },

      scales: {
        r: {
          min: 2,
          max: 5,
          ticks: {
            stepSize: 1,
            font: { size: 10, family: "'Inter', sans-serif" },
            color: '#9ca3af',
            backdropColor: 'transparent',
          },
          grid:        { color: '#e5e7eb' },
          angleLines:  { color: '#e5e7eb' },
          pointLabels: {
            font: { size: 11, family: "'Inter', sans-serif" },
            color: '#6b7280',
          }
        }
      }
    }
  });
}

/* -------------------------------------------------------
   7. SCORE PREDICTION CHART (Chart.js)
   Historical (solid) + predicted (dashed) line.
------------------------------------------------------- */
function buildPredChart() {
  const canvas = document.getElementById('predChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'line',

    data: {
      labels: ['Q1 \'25', 'Q2 \'25', 'Q3 \'25', 'Q4 \'25', 'Q1 \'26', 'Q2 \'26', 'Q3 \'26'],

      datasets: [
        {
          label: 'Actual',
          data: [15.7, 17.2, 18.5, 19.6, 20.8, null, null],
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointRadius: [3, 3, 3, 3, 4, 0, 0],
          borderWidth: 2,
          tension: 0.3,
          spanGaps: false,
        },
        {
          label: 'Predicted',
          data: [null, null, null, null, 20.8, 22.1, 23.2],
          borderColor: '#9ca3af',
          backgroundColor: 'transparent',
          borderDash: [5, 4],
          pointBackgroundColor: '#9ca3af',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointRadius: [0, 0, 0, 0, 0, 4, 4],
          borderWidth: 1.8,
          tension: 0.3,
          spanGaps: false,
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
          cornerRadius: 7,
          padding: 8,
          callbacks: {
            label: ctx => ctx.parsed.y !== null
              ? ` ${ctx.dataset.label}: ${ctx.parsed.y} pts`
              : ''
          }
        }
      },

      scales: {
        x: {
          grid:  { color: '#f3f4f6', drawBorder: false },
          ticks: { font: { size: 9, family: "'Inter', sans-serif" }, color: '#9ca3af' }
        },
        y: {
          min: 14, max: 25,
          grid:  { color: '#f3f4f6', drawBorder: false },
          ticks: { stepSize: 4, font: { size: 9, family: "'Inter', sans-serif" }, color: '#9ca3af' }
        }
      }
    }
  });
}

/* -------------------------------------------------------
   8. INIT
------------------------------------------------------- */
window.addEventListener('load', function () {
  setNavActive();

  /* AI typing animation */
  const SUMMARY = 'Emily shows consistent and measurable improvement across all evaluation ' +
    'metrics for Q1 2026, achieving a personal best total score of 20.8 out of 25 — a ' +
    '5.1-point increase since Q1 2025. Team Collaboration remains her standout strength ' +
    'at a near-perfect 4.65 average, while Code Review completeness represents the ' +
    'clearest high-impact opportunity heading into Q2. Sustaining the current growth ' +
    'trajectory is projected to achieve an Exceeds Target rating within two quarters.';

  typeText('aiTypingText', SUMMARY, 14, 300);

  /* Confidence bar (banner) */
  animateBar('aiConfBar', 94, 1400, 800);

  /* Prediction confidence bar */
  animateBar('predConfBar', 87, 1200, 500);

  /* Charts */
  buildRadarChart();
  buildPredChart();

  /* Auto-open first KPI feedback item */
  const firstKpi = document.querySelector('.kpi-fb-item');
  if (firstKpi) {
    firstKpi.classList.add('open');
    firstKpi.querySelectorAll('.kpi-fbs-fill[data-w]').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 400);
    });
  }
});
