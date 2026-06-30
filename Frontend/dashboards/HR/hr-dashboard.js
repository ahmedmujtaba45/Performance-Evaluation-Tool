/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — HR Dashboard (Overview)                             ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: EmployeesController                             ║
  ║    Path: Backend/controllers/EmployeesController.cs            ║
  ║    Endpoints: GET /api/employees                               ║
  ║                                                                ║
  ║  • Controller: ReportsController                               ║
  ║    Path: Backend/controllers/ReportsController.cs              ║
  ║    Endpoints: GET /api/reports/departments/all                ║
  ║                                                                ║
  ║  • Service: IEmployeeService                                   ║
  ║    Path: Backend/services/IEmployeeService.cs                  ║
  ║    Implementation: Backend/services/EmployeeService.cs         ║
  ║                                                                ║
  ║  • Service: IReportService                                     ║
  ║    Path: Backend/services/IReportService.cs                    ║
  ║    Implementation: Backend/services/ReportService.cs           ║
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ===========================================================
   EvaluAI — HR Dashboard (Overview module)
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------
     Mobile sidebar
  --------------------------------------------------------- */
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const menuToggle = document.getElementById("menuToggle");
  const sidebarClose = document.getElementById("sidebarClose");

  const openSidebar = () => {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-open");
  };
  const closeSidebar = () => {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-open");
  };

  menuToggle?.addEventListener("click", openSidebar);
  sidebarClose?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);

  /* ---------------------------------------------------------
     Sidebar navigation
     Only the Overview module is built right now. Other items
     are part of the same drawer but show a "coming soon" toast
     until their modules are implemented.
  --------------------------------------------------------- */
  const navItems = document.querySelectorAll(".nav-item");
  const pageTitle = document.getElementById("pageTitle");

  const moduleLabels = {
    "overview": "HR Dashboard",
    "employees": "Employees",
    "manage-employees": "Manage Employees",
    "scoring": "Scoring",
    "reports": "Reports",
    "announcements": "Announcements",
    "surveys": "Surveys",
  };

  // Modules that have a real page built. Everything else still shows
  // a "coming soon" toast until it exists.
  const moduleLinks = {
    "manage-employees": "employee-management.html",
    "scoring": "scoring.html",
    "reports": "reports.html",
    "announcements": "announcements.html",
    "surveys": "surveys.html",
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const moduleKey = item.dataset.module;

      if (moduleKey === "overview") {
        navItems.forEach((el) => el.classList.remove("is-active"));
        item.classList.add("is-active");
        pageTitle.textContent = moduleLabels[moduleKey];
        closeSidebar();
        return;
      }

      if (moduleLinks[moduleKey]) {
        window.location.href = moduleLinks[moduleKey];
        return;
      }

      showToast(`${moduleLabels[moduleKey]} module is coming soon`);
      closeSidebar();
    });
  });

  /* ---------------------------------------------------------
     Toast
  --------------------------------------------------------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  /* ---------------------------------------------------------
     Popovers (notifications + user menu)
  --------------------------------------------------------- */
  function setupPopover(btn, popover) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !popover.classList.contains("is-open");
      closeAllPopovers();
      if (willOpen) {
        popover.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  function closeAllPopovers() {
    document.querySelectorAll(".popover.is-open").forEach((p) => p.classList.remove("is-open"));
    document.querySelectorAll('[aria-expanded="true"]').forEach((b) => b.setAttribute("aria-expanded", "false"));
  }

  document.addEventListener("click", closeAllPopovers);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAllPopovers(); });

  const notifBtn = document.getElementById("notifBtn");
  const notifPopover = document.getElementById("notifPopover");
  const userBtn = document.getElementById("userBtn");
  const userPopover = document.getElementById("userPopover");
  setupPopover(notifBtn, notifPopover);
  setupPopover(userBtn, userPopover);
  notifPopover.addEventListener("click", (e) => e.stopPropagation());
  userPopover.addEventListener("click", (e) => e.stopPropagation());

  /* ---------------------------------------------------------
     Notifications list
  --------------------------------------------------------- */
  const notifications = [
    { text: "David Kim's Q1 2026 evaluation was marked Top Performer.", time: "10 min ago", read: false },
    { text: "Engineering Q1 evaluations reached 100% completion.", time: "1 hr ago", read: false },
    { text: "New survey \u201cQ1 Team Pulse\u201d is awaiting 1 review.", time: "3 hr ago", read: false },
    { text: "AI flagged a possible scoring variance in Sales.", time: "Yesterday", read: false },
    { text: "Performance prediction updated for Q2 2026.", time: "Yesterday", read: false },
    { text: "Fahad Siddique submitted self-assessment for Q1.", time: "2 days ago", read: false },
    { text: "Quarterly KPI weights were recalculated.", time: "3 days ago", read: false },
    { text: "Emily Chen's evaluation was approved by HR.", time: "4 days ago", read: false },
  ];

  const notifList = document.getElementById("notifList");
  const notifBadge = document.getElementById("notifBadge");
  const markAllReadBtn = document.getElementById("markAllRead");

  function renderNotifications() {
    notifList.innerHTML = notifications.map((n) => `
      <li class="notif-item ${n.read ? "is-read" : ""}">
        <span class="notif-dot"></span>
        <span>
          <span class="notif-text">${n.text}</span>
          <div class="notif-time">${n.time}</div>
        </span>
      </li>
    `).join("");

    const unread = notifications.filter((n) => !n.read).length;
    if (unread > 0) {
      notifBadge.textContent = unread;
      notifBadge.style.display = "flex";
    } else {
      notifBadge.style.display = "none";
    }
  }

  markAllReadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notifications.forEach((n) => (n.read = true));
    renderNotifications();
  });

  renderNotifications();

  /* ---------------------------------------------------------
     Stat card count-up animation
  --------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count]");
  counters.forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals ? value.toFixed(decimals) : Math.round(value);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = decimals ? target.toFixed(decimals) : target;
    }
    requestAnimationFrame(tick);
  });

  /* ---------------------------------------------------------
     Charts
  --------------------------------------------------------- */
  if (window.Chart) {
    const inkMuted = "#9aa1ae";
    const gridColor = "#eef0f5";

    Chart.defaults.font.family = "'Inter', sans-serif";

    /* --- Performance prediction (line) --- */
    const predictionCtx = document.getElementById("predictionChart");
    new Chart(predictionCtx, {
      type: "line",
      data: {
        labels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026"],
        datasets: [
          {
            label: "Actual",
            data: [18.5, 18.8, 19.6, 20.6, 21.9, null],
            borderColor: "#161b27",
            backgroundColor: "#161b27",
            pointBackgroundColor: "#161b27",
            pointBorderColor: "#161b27",
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 5,
            tension: 0.35,
            spanGaps: false,
          },
          {
            label: "Predicted",
            data: [null, null, null, null, 21.9, 22.3],
            borderColor: "#18a058",
            backgroundColor: "#18a058",
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#18a058",
            pointBorderWidth: 2,
            borderWidth: 2.5,
            borderDash: [6, 4],
            pointRadius: 4,
            pointHoverRadius: 5,
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
            backgroundColor: "#161b27",
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12, weight: "600" },
            bodyFont: { size: 12 },
            callbacks: {
              label: (item) => `${item.dataset.label}: ${item.formattedValue} pts`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: inkMuted, font: { size: 11 } },
          },
          y: {
            min: 17,
            max: 24,
            ticks: { color: inkMuted, font: { size: 11 }, stepSize: 2 },
            grid: { color: gridColor },
          },
        },
      },
    });

    /* --- Clustering (donut) --- */
    const clusterCtx = document.getElementById("clusterChart");
    new Chart(clusterCtx, {
      type: "doughnut",
      data: {
        labels: ["High Performer", "Average Performer", "At Risk"],
        datasets: [
          {
            data: [3, 2, 0.0001],
            backgroundColor: ["#18a058", "#3b6df0", "#ef4444"],
            borderWidth: 0,
            spacing: 3,
            borderRadius: 6,
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
            backgroundColor: "#161b27",
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` ${item.label}: ${item.label === "At Risk" ? 0 : item.formattedValue}`,
            },
          },
        },
      },
    });
  }

});
