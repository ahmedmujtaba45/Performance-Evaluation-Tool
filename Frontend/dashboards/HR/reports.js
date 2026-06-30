/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — HR Dashboard (Reports)                              ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: ReportsController                               ║
  ║    Path: Backend/controllers/ReportsController.cs              ║
  ║    Endpoints: GET /api/reports                                 ║
  ║                GET /api/reports/{id}                           ║
  ║                GET /api/reports/departments/all                ║
  ║                GET /api/reports/department/{departmentId}      ║
  ║                                                                ║
  ║  • Controller: EvaluationsController                           ║
  ║    Path: Backend/controllers/EvaluationsController.cs          ║
  ║    Endpoints: GET /api/evaluations                             ║
  ║                GET /api/evaluations/cycle/{cycleId}            ║
  ║                                                                ║
  ║  • Service: IReportService                                     ║
  ║    Path: Backend/services/IReportService.cs                    ║
  ║    Implementation: Backend/services/ReportService.cs           ║
  ║                                                                ║
  ║  • DTOs:                                                        ║
  ║    - ReportDto: Backend/dtos/report/ReportDto.cs               ║
  ║    - DepartmentReportDto: Backend/dtos/report/DepartmentReportDto.cs
  ║    - EvaluationDetailDto: Backend/dtos/evaluation/EvaluationDetailDto.cs
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ===========================================================
   EvaluAI — HR Dashboard (Reports module)
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------
     Mobile sidebar
  --------------------------------------------------------- */
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const menuToggle = document.getElementById("menuToggle");
  const sidebarClose = document.getElementById("sidebarClose");

  const openSidebar = () => { sidebar.classList.add("is-open"); overlay.classList.add("is-open"); };
  const closeSidebar = () => { sidebar.classList.remove("is-open"); overlay.classList.remove("is-open"); };

  menuToggle?.addEventListener("click", openSidebar);
  sidebarClose?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);

  /* ---------------------------------------------------------
     Sidebar navigation
  --------------------------------------------------------- */
  const navItems = document.querySelectorAll(".nav-item");
  const moduleLabels = {
    "overview": "Overview", "employees": "Employees", "manage-employees": "Manage Employees",
    "scoring": "Scoring", "reports": "Reports", "announcements": "Announcements", "surveys": "Surveys",
  };
  const moduleLinks = {
    "overview": "hr-dashboard.html",
    "manage-employees": "employee-management.html",
    "scoring": "scoring.html",
    "announcements": "announcements.html",
    "surveys": "surveys.html",
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const moduleKey = item.dataset.module;
      if (moduleKey === "reports") { closeSidebar(); return; }
      if (moduleLinks[moduleKey]) { window.location.href = moduleLinks[moduleKey]; return; }
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
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
  }

  /* ---------------------------------------------------------
     Popovers (notifications + user menu)
  --------------------------------------------------------- */
  function setupPopover(btn, popover) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !popover.classList.contains("is-open");
      closeAllPopovers();
      if (willOpen) { popover.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
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

  const notifications = [
    { text: "David Kim's Q1 2026 evaluation was marked Top Performer.", time: "10 min ago" },
    { text: "Engineering Q1 evaluations reached 100% completion.", time: "1 hr ago" },
    { text: "New survey \u201cQ1 Team Pulse\u201d is awaiting 1 review.", time: "3 hr ago" },
    { text: "AI flagged a possible scoring variance in Sales.", time: "Yesterday" },
    { text: "Performance prediction updated for Q2 2026.", time: "Yesterday" },
    { text: "Fahad Siddique submitted self-assessment for Q1.", time: "2 days ago" },
    { text: "Quarterly KPI weights were recalculated.", time: "3 days ago" },
    { text: "Emily Chen's evaluation was approved by HR.", time: "4 days ago" },
  ].map((n) => ({ ...n, read: false }));

  const notifList = document.getElementById("notifList");
  const notifBadge = document.getElementById("notifBadge");
  document.getElementById("markAllRead").addEventListener("click", (e) => {
    e.stopPropagation();
    notifications.forEach((n) => (n.read = true));
    renderNotifications();
  });
  function renderNotifications() {
    notifList.innerHTML = notifications.map((n) => `
      <li class="notif-item ${n.read ? "is-read" : ""}">
        <span class="notif-dot"></span>
        <span><span class="notif-text">${n.text}</span><div class="notif-time">${n.time}</div></span>
      </li>
    `).join("");
    const unread = notifications.filter((n) => !n.read).length;
    notifBadge.style.display = unread > 0 ? "flex" : "none";
    if (unread > 0) notifBadge.textContent = unread;
  }
  renderNotifications();

  /* ---------------------------------------------------------
     Shared data
     Mirrors the totals seeded on the Scoring page (Q1 2026).
  --------------------------------------------------------- */
  const employees = [
    { id: 1, name: "David Kim", jobTitle: "DevOps Engineer", department: "Engineering", managerScore: 18.5, hrScore: 5, total: 23.5, status: "Scored", trend: [21, 21.8, 22.4, 23, 23.5] },
    { id: 2, name: "Emily Chen", jobTitle: "Senior Developer", department: "Engineering", managerScore: 16, hrScore: 4.5, total: 20.5, status: "Scored", trend: [18.5, 19, 19.6, 20, 20.5] },
    { id: 3, name: "Michael Park", jobTitle: "Software Engineer", department: "Engineering", managerScore: 16, hrScore: 5, total: 21, status: "Scored", trend: [19, 19.5, 20.2, 20.6, 21] },
    { id: 4, name: "Fahad Siddique", jobTitle: "Digital Marketing Executive", department: "Marketing", managerScore: 15.5, hrScore: 4, total: 19.5, status: "Scored", trend: [17.5, 18, 18.6, 19, 19.5] },
    { id: 5, name: "Shahmeer", jobTitle: "Accounts Officer", department: "Finance", managerScore: null, hrScore: null, total: null, status: "Not Started", trend: [] },
  ];

  const avatarPalettes = {
    Engineering: "linear-gradient(135deg,#3b6df0,#36c6c0)",
    Marketing: "linear-gradient(135deg,#7c5cff,#c95cff)",
    Finance: "linear-gradient(135deg,#f0962b,#f0c12b)",
  };
  function initials(name) {
    const parts = name.trim().split(/\s+/);
    return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  function fmt(n) {
    if (n == null) return "\u2014";
    return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
  }
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  const quarterLabels = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026"];

  /* ---------------------------------------------------------
     Tabs
  --------------------------------------------------------- */
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = { performance: document.getElementById("panel-performance"), "ai-analytics": document.getElementById("panel-ai-analytics") };

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      Object.entries(tabPanels).forEach(([key, panel]) => { panel.hidden = key !== btn.dataset.tab; });
      if (btn.dataset.tab === "ai-analytics") ensureAiCharts();
    });
  });

  const subtabBtns = document.querySelectorAll(".subtab-btn");
  const subtabPanels = { team: document.getElementById("subpanel-team"), individual: document.getElementById("subpanel-individual") };

  subtabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      subtabBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      Object.entries(subtabPanels).forEach(([key, panel]) => { panel.hidden = key !== btn.dataset.subtab; });
      if (btn.dataset.subtab === "individual") ensureIndividualChart();
    });
  });

  /* ---------------------------------------------------------
     Team Performance charts
  --------------------------------------------------------- */
  const inkMuted = "#9aa1ae";
  const gridColor = "#eef0f5";
  if (window.Chart) Chart.defaults.font.family = "'Inter', sans-serif";

  new Chart(document.getElementById("teamTrendChart"), {
    type: "line",
    data: {
      labels: quarterLabels,
      datasets: [{
        label: "Avg Score",
        data: [18.5, 18.8, 19.6, 20.6, 21.9],
        borderColor: "#161b27", backgroundColor: "#161b27",
        pointBackgroundColor: "#161b27", pointBorderColor: "#161b27",
        borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 5, tension: 0.35,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: "#161b27", padding: 10, cornerRadius: 8 } },
      scales: {
        x: { grid: { display: false }, ticks: { color: inkMuted, font: { size: 11 } } },
        y: { min: 17, max: 24, ticks: { color: inkMuted, font: { size: 11 } }, grid: { color: gridColor } },
      },
    },
  });

  const deptAverages = computeDeptAverages();
  new Chart(document.getElementById("deptAvgChart"), {
    type: "bar",
    data: {
      labels: deptAverages.map((d) => d.department),
      datasets: [{
        data: deptAverages.map((d) => d.average || 0),
        backgroundColor: deptAverages.map((d) => d.average ? "#3b6df0" : "#dfe3ea"),
        borderRadius: 8, maxBarThickness: 56,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#161b27", padding: 10, cornerRadius: 8,
          callbacks: { label: (item) => item.raw ? `${item.raw.toFixed(1)} / 25` : "No evaluations yet" },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: inkMuted, font: { size: 12, weight: "600" } } },
        y: { min: 0, max: 25, ticks: { color: inkMuted, font: { size: 11 } }, grid: { color: gridColor } },
      },
    },
  });

  function computeDeptAverages() {
    const depts = ["Engineering", "Marketing", "Finance"];
    return depts.map((dept) => {
      const scored = employees.filter((e) => e.department === dept && e.total != null);
      const average = scored.length ? scored.reduce((s, e) => s + e.total, 0) / scored.length : null;
      return { department: dept, average };
    });
  }

  const pendingDepts = deptAverages.filter((d) => d.average == null).map((d) => d.department);
  document.getElementById("deptAvgNote").textContent = pendingDepts.length
    ? `${pendingDepts.join(", ")} evaluations are still in progress for Q1 2026.`
    : "All departments have completed Q1 2026 evaluations.";

  /* ---------------------------------------------------------
     Individual Performance
  --------------------------------------------------------- */
  const individualSelect = document.getElementById("individualSelect");
  const individualContent = document.getElementById("individualContent");
  let individualChart = null;
  let individualChartReady = false;

  individualSelect.innerHTML = employees.map((e) => `<option value="${e.id}">${escapeHtml(e.name)} \u2014 ${escapeHtml(e.jobTitle)}</option>`).join("");

  function renderIndividual() {
    const emp = employees.find((e) => e.id === parseInt(individualSelect.value, 10));
    if (!emp) return;

    if (emp.total == null) {
      individualContent.innerHTML = `
        <div class="individual-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>No evaluation history yet for ${escapeHtml(emp.name)} this cycle</p>
        </div>`;
      return;
    }

    individualContent.innerHTML = `
      <div class="individual-header">
        <span class="emp-avatar" style="background:${avatarPalettes[emp.department]}">${initials(emp.name)}</span>
        <div class="individual-header-info">
          <h3>${escapeHtml(emp.name)}</h3>
          <p>${escapeHtml(emp.jobTitle)} \u00b7 ${escapeHtml(emp.department)}</p>
        </div>
      </div>
      <div class="score-strip">
        <div class="score-strip-item"><span>Manager Score</span><strong>${fmt(emp.managerScore)} <em>/ 20</em></strong></div>
        <div class="score-strip-item"><span>HR Score</span><strong>${fmt(emp.hrScore)} <em>/ 5</em></strong></div>
        <div class="score-strip-item"><span>Total Score</span><strong>${fmt(emp.total)} <em>/ 25</em></strong></div>
      </div>
      <div class="chart-box">
        <canvas id="individualTrendChart"></canvas>
      </div>
    `;

    individualChartReady = false;
    if (!document.getElementById("subpanel-individual").hidden) ensureIndividualChart();
  }

  function ensureIndividualChart() {
    const emp = employees.find((e) => e.id === parseInt(individualSelect.value, 10));
    const canvas = document.getElementById("individualTrendChart");
    if (!emp || !canvas || individualChartReady) return;
    individualChartReady = true;

    if (individualChart) individualChart.destroy();
    individualChart = new Chart(canvas, {
      type: "line",
      data: {
        labels: quarterLabels,
        datasets: [{
          label: emp.name,
          data: emp.trend,
          borderColor: "#3b6df0", backgroundColor: "rgba(59,109,240,.08)",
          pointBackgroundColor: "#3b6df0", pointBorderColor: "#3b6df0",
          borderWidth: 2.5, pointRadius: 4, fill: true, tension: 0.35,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: "#161b27", padding: 10, cornerRadius: 8 } },
        scales: {
          x: { grid: { display: false }, ticks: { color: inkMuted, font: { size: 11 } } },
          y: { min: 0, max: 25, ticks: { color: inkMuted, font: { size: 11 } }, grid: { color: gridColor } },
        },
      },
    });
  }

  individualSelect.addEventListener("change", renderIndividual);
  renderIndividual();

  /* ---------------------------------------------------------
     AI Analytics tab (lazy-initialized charts)
  --------------------------------------------------------- */
  let aiChartsReady = false;
  function ensureAiCharts() {
    if (aiChartsReady) return;
    aiChartsReady = true;

    new Chart(document.getElementById("predictionChart"), {
      type: "line",
      data: {
        labels: [...quarterLabels, "Q2 2026"],
        datasets: [
          { label: "Actual", data: [18.5, 18.8, 19.6, 20.6, 21.9, null], borderColor: "#161b27", backgroundColor: "#161b27", pointBackgroundColor: "#161b27", pointBorderColor: "#161b27", borderWidth: 2.5, pointRadius: 4, tension: 0.35 },
          { label: "Predicted", data: [null, null, null, null, 21.9, 22.3], borderColor: "#18a058", backgroundColor: "#18a058", pointBackgroundColor: "#fff", pointBorderColor: "#18a058", pointBorderWidth: 2, borderWidth: 2.5, borderDash: [6, 4], pointRadius: 4, tension: 0.35, spanGaps: true },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: "#161b27", padding: 10, cornerRadius: 8 } },
        scales: {
          x: { grid: { display: false }, ticks: { color: inkMuted, font: { size: 11 } } },
          y: { min: 17, max: 24, ticks: { color: inkMuted, font: { size: 11 } }, grid: { color: gridColor } },
        },
      },
    });

    const clusters = computeClusters();
    new Chart(document.getElementById("clusterChart"), {
      type: "doughnut",
      data: {
        labels: ["High Performer", "Average Performer", "At Risk", "Not Yet Scored"],
        datasets: [{
          data: [clusters.high || 0.0001, clusters.average || 0.0001, clusters.atRisk || 0.0001, clusters.pending || 0.0001],
          backgroundColor: ["#18a058", "#3b6df0", "#ef4444", "#cbd1db"],
          borderWidth: 0, spacing: 3, borderRadius: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "70%",
        plugins: { legend: { display: false }, tooltip: { backgroundColor: "#161b27", padding: 10, cornerRadius: 8 } },
      },
    });

    document.getElementById("clusterHigh").textContent = clusters.high;
    document.getElementById("clusterAvg").textContent = clusters.average;
    document.getElementById("clusterRisk").textContent = clusters.atRisk;
    document.getElementById("clusterPending").textContent = clusters.pending;

    renderFindings(clusters);
  }

  function computeClusters() {
    let high = 0, average = 0, atRisk = 0, pending = 0;
    employees.forEach((e) => {
      if (e.total == null) pending++;
      else if (e.total >= 22) high++;
      else if (e.total >= 18) average++;
      else atRisk++;
    });
    return { high, average, atRisk, pending };
  }

  function renderFindings(clusters) {
    const topPerformer = employees.reduce((best, e) => (e.total != null && (!best || e.total > best.total) ? e : best), null);
    const engAvg = deptAverages.find((d) => d.department === "Engineering").average;
    const findings = [
      `${topPerformer.name} leads the team this quarter with a score of ${fmt(topPerformer.total)}/25, driven by strong technical ownership and reliability KPIs.`,
      `Engineering's average score (${engAvg.toFixed(1)}/25) is trending upward compared to last quarter's company average of 20.6.`,
      `${clusters.high} High Performer${clusters.high === 1 ? "" : "s"} and ${clusters.atRisk} At Risk employee${clusters.atRisk === 1 ? "" : "s"} this cycle \u2014 a healthy distribution for Q1 2026.`,
      `${pendingDepts.length ? pendingDepts.join(" and ") : "No departments"} evaluations for Q1 2026 are still pending \u2014 encourage managers to complete remaining reviews before quarter close.`,
    ];
    document.getElementById("findingsList").innerHTML = findings.map((f) => `
      <li>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${f}</span>
      </li>
    `).join("");
  }

  /* ---------------------------------------------------------
     Generate Report form
  --------------------------------------------------------- */
  const reportType = document.getElementById("reportType");
  const reportEmployee = document.getElementById("reportEmployee");
  const employeeFieldWrap = document.getElementById("employeeFieldWrap");
  const departmentFieldWrap = document.getElementById("departmentFieldWrap");
  const reportDepartment = document.getElementById("reportDepartment");
  const dateFrom = document.getElementById("dateFrom");
  const dateTo = document.getElementById("dateTo");
  const generateForm = document.getElementById("generateForm");
  const generateError = document.getElementById("generateError");

  reportEmployee.innerHTML = employees.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join("");

  reportType.addEventListener("change", () => {
    employeeFieldWrap.hidden = reportType.value !== "individual";
    departmentFieldWrap.hidden = reportType.value !== "department";
    generateError.textContent = "";
  });

  let reportHistory = [
    { id: 1, name: "Company-wide Performance Report \u2014 Q4 2025", scope: "Company-wide", range: "Oct 1, 2025 \u2013 Dec 31, 2025", generatedOn: "Jan 5, 2026", type: "company" },
    { id: 2, name: "Engineering Department Report \u2014 Q4 2025", scope: "Department \u00b7 Engineering", range: "Oct 1, 2025 \u2013 Dec 31, 2025", generatedOn: "Jan 6, 2026", type: "department", department: "Engineering" },
  ];
  let nextReportId = 3;

  function renderHistory() {
    const body = document.getElementById("historyBody");
    if (reportHistory.length === 0) {
      body.innerHTML = `<div class="history-empty">No reports generated yet</div>`;
      return;
    }
    body.innerHTML = reportHistory.map((r) => `
      <div class="history-row">
        <div data-label="Report">
          <div class="history-name">${escapeHtml(r.name)}</div>
          <div class="history-meta">Generated by James Rodriguez</div>
        </div>
        <div data-label="Scope">${escapeHtml(r.scope)}</div>
        <div data-label="Date Range">${escapeHtml(r.range)}</div>
        <div data-label="Generated">${escapeHtml(r.generatedOn)}</div>
        <div data-label="Status"><span class="status-chip">Ready</span></div>
        <div>
          <button class="download-btn" data-id="${r.id}" aria-label="Download ${escapeHtml(r.name)}" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>
    `).join("");
  }
  renderHistory();

  function formatDate(d) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  generateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    generateError.textContent = "";
    [reportEmployee, reportDepartment, dateFrom, dateTo].forEach((el) => el.classList.remove("is-invalid"));

    const type = reportType.value;
    const missingDates = !dateFrom.value || !dateTo.value;
    const missingEmployee = type === "individual" && !reportEmployee.value;
    const missingDept = type === "department" && !reportDepartment.value;

    if (missingEmployee && missingDates) {
      generateError.textContent = "Please select an employee and specify a date range to generate the report";
      reportEmployee.classList.add("is-invalid"); dateFrom.classList.add("is-invalid"); dateTo.classList.add("is-invalid");
      return;
    }
    if (missingDept && missingDates) {
      generateError.textContent = "Please select a department and specify a date range to generate the report";
      reportDepartment.classList.add("is-invalid"); dateFrom.classList.add("is-invalid"); dateTo.classList.add("is-invalid");
      return;
    }
    if (missingDates) {
      generateError.textContent = "Please specify a date range to generate the report";
      dateFrom.classList.add("is-invalid"); dateTo.classList.add("is-invalid");
      return;
    }
    if (new Date(dateFrom.value) > new Date(dateTo.value)) {
      generateError.textContent = "The end date must be after the start date";
      dateFrom.classList.add("is-invalid"); dateTo.classList.add("is-invalid");
      return;
    }

    const range = `${formatDate(dateFrom.value)} \u2013 ${formatDate(dateTo.value)}`;
    let name, scope;
    if (type === "individual") {
      const emp = employees.find((em) => em.id === parseInt(reportEmployee.value, 10));
      name = `${emp.name} \u2014 Individual Performance Report`;
      scope = `Individual \u00b7 ${emp.name}`;
    } else if (type === "department") {
      name = `${reportDepartment.value} Department Report`;
      scope = `Department \u00b7 ${reportDepartment.value}`;
    } else {
      name = "Company-wide Performance Report";
      scope = "Company-wide";
    }

    const record = {
      id: nextReportId++, name, scope, range,
      generatedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type, employeeId: type === "individual" ? parseInt(reportEmployee.value, 10) : null,
      department: type === "department" ? reportDepartment.value : null,
    };
    reportHistory.unshift(record);
    renderHistory();
    showToast(`${name} generated`);
    generateForm.reset();
    employeeFieldWrap.hidden = false;
    departmentFieldWrap.hidden = true;
  });

  /* ---------------------------------------------------------
     CSV export helpers
  --------------------------------------------------------- */
  function downloadCsv(filename, rows) {
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function csvEscape(value) {
    const s = String(value ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function reportRows(record) {
    const header = ["Name", "Job Title", "Department", "Manager Score (/20)", "HR Score (/5)", "Total (/25)", "Status"];
    let scope = employees;
    if (record.type === "individual") scope = employees.filter((e) => e.id === record.employeeId);
    if (record.type === "department") scope = employees.filter((e) => e.department === record.department);
    const rows = scope.map((e) => [e.name, e.jobTitle, e.department, fmt(e.managerScore), fmt(e.hrScore), fmt(e.total), e.status]);
    return [
      [record.name],
      [`Scope: ${record.scope}`],
      [`Date range: ${record.range}`],
      [`Generated: ${record.generatedOn} by James Rodriguez`],
      [],
      header,
      ...rows,
    ];
  }

  document.getElementById("historyBody").addEventListener("click", (e) => {
    const btn = e.target.closest(".download-btn");
    if (!btn) return;
    const record = reportHistory.find((r) => r.id === parseInt(btn.dataset.id, 10));
    if (!record) return;
    downloadCsv(`${record.name.replace(/[^\w\-]+/g, "_")}.csv`, reportRows(record));
    showToast(`Downloaded ${record.name}`);
  });

  /* ---------------------------------------------------------
     Export PDF / Excel (top toolbar)
  --------------------------------------------------------- */
  document.getElementById("exportExcelBtn").addEventListener("click", () => {
    const rows = [
      ["Company-wide Performance Summary"],
      [`Generated: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} by James Rodriguez`],
      [],
      ["Name", "Job Title", "Department", "Manager Score (/20)", "HR Score (/5)", "Total (/25)", "Status"],
      ...employees.map((e) => [e.name, e.jobTitle, e.department, fmt(e.managerScore), fmt(e.hrScore), fmt(e.total), e.status]),
    ];
    downloadCsv("EvaluAI_Performance_Summary.csv", rows);
    showToast("Excel export downloaded");
  });

  document.getElementById("exportPdfBtn").addEventListener("click", () => {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) { showToast("Allow pop-ups to export PDF"); return; }
    const rowsHtml = employees.map((e) => `
      <tr>
        <td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.jobTitle)}</td><td>${escapeHtml(e.department)}</td>
        <td>${fmt(e.managerScore)}</td><td>${fmt(e.hrScore)}</td><td>${fmt(e.total)}</td><td>${escapeHtml(e.status)}</td>
      </tr>`).join("");
    win.document.write(`
      <!DOCTYPE html><html><head><title>EvaluAI Performance Report</title>
      <style>
        body{ font-family:Arial,sans-serif; padding:32px; color:#11151f; }
        h1{ font-size:20px; margin-bottom:4px; } p{ color:#6b7280; font-size:13px; margin-top:0; }
        table{ width:100%; border-collapse:collapse; margin-top:20px; }
        th,td{ text-align:left; padding:9px 10px; border-bottom:1px solid #e7e9f0; font-size:13px; }
        th{ background:#fafbfd; font-size:11px; text-transform:uppercase; color:#6b7280; }
      </style></head><body>
        <h1>EvaluAI \u2014 Company-wide Performance Report</h1>
        <p>Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} by James Rodriguez \u00b7 Q1 2026 cycle</p>
        <table><thead><tr><th>Name</th><th>Job Title</th><th>Department</th><th>Manager</th><th>HR</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${rowsHtml}</tbody></table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
    showToast("Opening print dialog \u2014 choose \u201cSave as PDF\u201d");
  });

});
