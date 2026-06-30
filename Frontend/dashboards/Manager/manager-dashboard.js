/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — Manager Dashboard (Overview)                        ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: EmployeesController                             ║
  ║    Path: Backend/controllers/EmployeesController.cs            ║
  ║    Endpoints: GET /api/employees                               ║
  ║                GET /api/employees/department/{department}      ║
  ║                                                                ║
  ║  • Controller: EvaluationsController                           ║
  ║    Path: Backend/controllers/EvaluationsController.cs          ║
  ║    Endpoints: GET /api/evaluations                             ║
  ║                GET /api/evaluations/cycle/{cycleId}            ║
  ║                                                                ║
  ║  • Service: IEmployeeService                                   ║
  ║    Path: Backend/services/IEmployeeService.cs                  ║
  ║    Implementation: Backend/services/EmployeeService.cs         ║
  ║                                                                ║
  ║  • Service: IEvaluationService                                 ║
  ║    Path: Backend/services/IEvaluationService.cs                ║
  ║    Implementation: Backend/services/EvaluationService.cs       ║
  ╚════════════════════════════════════════════════════════════════╝
*/

/* =========================================================
   EvaluAI — Manager Dashboard
   Behaviour: navigation, dropdowns, stat animation, charts
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initSidebarToggle();
  initDropdowns();
  animateStatValues();
  initPredictionChart();
  initClusterChart();
});

/* ---------------------------------------------------------
   Mobile sidebar toggle
--------------------------------------------------------- */
function initSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const toggle = document.getElementById("sidebarToggle");
  if (!sidebar || !backdrop || !toggle) return;

  const closeSidebar = () => {
    sidebar.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("is-open");
    backdrop.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  backdrop.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  // Close the drawer automatically if the viewport grows back to desktop size
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeSidebar();
  });
}

/* ---------------------------------------------------------
   Notification + account dropdowns
--------------------------------------------------------- */
function initDropdowns() {
  const dropdowns = [
    { trigger: "notifBtn", wrapperSelector: "#notifBtn" },
    { trigger: "userTrigger", wrapperSelector: "#userTrigger" },
  ];

  dropdowns.forEach(({ trigger }) => {
    const triggerEl = document.getElementById(trigger);
    if (!triggerEl) return;
    const wrapper = triggerEl.closest(".dropdown");

    triggerEl.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = wrapper.getAttribute("data-open") === "true";
      closeAllDropdowns();
      if (!isOpen) {
        wrapper.setAttribute("data-open", "true");
        triggerEl.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", closeAllDropdowns);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllDropdowns();
  });
}

function closeAllDropdowns() {
  document.querySelectorAll(".dropdown[data-open='true']").forEach((wrapper) => {
    wrapper.setAttribute("data-open", "false");
    const trigger = wrapper.querySelector("button");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });
}

/* ---------------------------------------------------------
   Animated stat counters (respects prefers-reduced-motion)
--------------------------------------------------------- */
function animateStatValues() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counters = document.querySelectorAll("[data-count-to]");

  counters.forEach((el) => {
    const target = parseFloat(el.getAttribute("data-count-to"));
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);

    if (prefersReducedMotion || Number.isNaN(target)) {
      el.textContent = target.toFixed(decimals);
      return;
    }

    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}

/* ---------------------------------------------------------
   Performance Prediction chart (Actual vs Predicted)
--------------------------------------------------------- */
function initPredictionChart() {
  const canvas = document.getElementById("predictionChart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = ["Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026"];
  const actual = [18.5, 19.6, 20.6, 21.8, null];
  const predicted = [null, null, null, 21.8, 23.6];

  new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Actual",
          data: actual,
          borderColor: "#101828",
          backgroundColor: "#101828",
          pointBackgroundColor: "#101828",
          pointRadius: 4,
          pointHoverRadius: 5,
          borderWidth: 2,
          tension: 0.35,
          spanGaps: false,
        },
        {
          label: "Predicted",
          data: predicted,
          borderColor: "#16A34A",
          backgroundColor: "#16A34A",
          pointBackgroundColor: "#fff",
          pointBorderColor: "#16A34A",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 5,
          borderWidth: 2,
          borderDash: [6, 4],
          tension: 0.35,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#101828",
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: "Inter", size: 12 },
          bodyFont: { family: "Inter", size: 12 },
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue} pts`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#98A2B3", font: { family: "Inter", size: 10.5 } },
        },
        y: {
          suggestedMin: 15,
          suggestedMax: 26,
          grid: { color: "#F0F1F4" },
          ticks: { color: "#98A2B3", font: { family: "Inter", size: 10.5 }, stepSize: 3 },
        },
      },
    },
  });
}

/* ---------------------------------------------------------
   Team Clustering donut chart
--------------------------------------------------------- */
function initClusterChart() {
  const canvas = document.getElementById("clusterChart");
  if (!canvas || typeof Chart === "undefined") return;

  new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["High Performer", "Average Performer", "At Risk"],
      datasets: [
        {
          data: [1, 2, 0],
          backgroundColor: ["#16A34A", "#2563EB", "#EF4444"],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#101828",
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: "Inter", size: 12 },
          bodyFont: { family: "Inter", size: 12 },
        },
      },
    },
  });
}
