/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — Manager Dashboard (Reports & Analytics)             ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: EvaluationsController                           ║
  ║    Path: Backend/controllers/EvaluationsController.cs          ║
  ║    Endpoints: GET /api/evaluations                             ║
  ║                GET /api/evaluations/cycle/{cycleId}            ║
  ║                GET /api/evaluations/employee/{employeeId}      ║
  ║                                                                ║
  ║  • Controller: ReportsController                               ║
  ║    Path: Backend/controllers/ReportsController.cs              ║
  ║    Endpoints: GET /api/reports/department/{departmentId}       ║
  ║                                                                ║
  ║  • Service: IEvaluationService                                 ║
  ║    Path: Backend/services/IEvaluationService.cs                ║
  ║    Implementation: Backend/services/EvaluationService.cs       ║
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

/* =========================================================
   EvaluAI — Reports & Analytics
   Page-specific behaviour: top-level tabs, the Team/Individual
   segmented toggle, chart rendering, individual report
   generation with validation, and PDF/CSV export.
   Shell behaviour (sidebar, dropdowns, toasts) is handled by
   shared.js.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  EvaluAIShell.init();
  initReportsPage();
});

/* ---------------------------------------------------------
   Source data
   Mirrors the figures already shown on the Dashboard, Team
   Members, and KPI Evaluation pages so every report ties back
   to the same underlying records.
--------------------------------------------------------- */
const QUARTER_LABELS = ["Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026"];

const TEAM_TREND = {
  labels: [...QUARTER_LABELS, "Q2 2026"],
  actual: [18.5, 19.6, 20.6, 21.8, null],
  predicted: [null, null, null, 21.8, 23.6],
};

const KPIS = [
  { id: "code-quality", title: "Code Quality & Reviews", weight: 25, target: 95 },
  { id: "project-delivery", title: "Project Delivery", weight: 30, target: 90 },
  { id: "team-collaboration", title: "Team Collaboration", weight: 20, target: 90 },
  { id: "technical-growth", title: "Technical Growth & Innovation", weight: 15, target: 85 },
  { id: "system-reliability", title: "System Reliability & Ownership", weight: 10, target: 99 },
];

const TEAM_MEMBERS = [
  {
    id: "emily-chen",
    name: "Emily Chen",
    title: "Senior Developer",
    category: "Average Performer",
    categoryPill: "pill-blue",
    managerScore: 16.8,
    hrScore: 4.0,
    total: 20.8,
    kpiScores: {
      "code-quality": 4.5,
      "project-delivery": 4.0,
      "team-collaboration": 4.0,
      "technical-growth": 4.5,
      "system-reliability": 4.0,
    },
    history: { actual: [17.6, 18.4, 19.5, 20.8], predicted: 21.9 },
    feedback: "Strong technical skills with consistent code quality above team average.",
  },
  {
    id: "michael-park",
    name: "Michael Park",
    title: "Software Engineer",
    category: "Average Performer",
    categoryPill: "pill-blue",
    managerScore: 17.0,
    hrScore: 4.0,
    total: 21.0,
    kpiScores: {
      "code-quality": 4.0,
      "project-delivery": 4.5,
      "team-collaboration": 4.5,
      "technical-growth": 4.0,
      "system-reliability": 4.0,
    },
    history: { actual: [17.9, 18.8, 19.9, 21.0], predicted: 22.2 },
    feedback: "Excellent learning agility with 100% training completion rate.",
  },
  {
    id: "david-kim",
    name: "David Kim",
    title: "DevOps Engineer",
    category: "High Performer",
    categoryPill: "pill-green",
    managerScore: 19.0,
    hrScore: 4.5,
    total: 23.5,
    kpiScores: {
      "code-quality": 5.0,
      "project-delivery": 4.5,
      "team-collaboration": 4.5,
      "technical-growth": 5.0,
      "system-reliability": 5.0,
    },
    history: { actual: [19.8, 20.9, 22.1, 23.5], predicted: 24.3 },
    feedback: "Exceptional infrastructure management with 99.95% uptime.",
  },
];

/* ---------------------------------------------------------
   Module state
--------------------------------------------------------- */
let aiPredictionChart = null;
let aiClusterChart = null;
let indivTrendChart = null;
let aiChartsRendered = false;

/* ---------------------------------------------------------
   Page init
--------------------------------------------------------- */
function initReportsPage() {
  initTopTabs();
  initScopeToggle();
  initExportButtons();

  renderTeamTrendChart();
  renderTeamSummaryTable();

  document.getElementById("generateReportBtn").addEventListener("click", generateIndividualReport);
}

function getMember(id) {
  return TEAM_MEMBERS.find((m) => m.id === id);
}

/* ---------------------------------------------------------
   Top-level tabs: Performance Reports / AI Analytics Reports
--------------------------------------------------------- */
function initTopTabs() {
  document.querySelectorAll("#tabBtnPerformance, #tabBtnAi").forEach((btn) => {
    btn.addEventListener("click", () => switchTopTab(btn.getAttribute("data-tab")));
  });
}

function switchTopTab(tabName) {
  document.querySelectorAll("#tabBtnPerformance, #tabBtnAi").forEach((btn) => {
    const isActive = btn.getAttribute("data-tab") === tabName;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  document.getElementById("tabPanelPerformance").hidden = tabName !== "performance";
  document.getElementById("tabPanelAi").hidden = tabName !== "ai";

  if (tabName === "ai" && !aiChartsRendered) {
    renderAiPredictionChart();
    renderAiClusterChart();
    renderBiasDetection();
    renderKpiOptimization();
    aiChartsRendered = true;
  }
}

/* ---------------------------------------------------------
   Segmented toggle: Team Performance / Individual Performance
--------------------------------------------------------- */
function initScopeToggle() {
  document.getElementById("segBtnTeam").addEventListener("click", () => switchScope("team"));
  document.getElementById("segBtnIndividual").addEventListener("click", () => switchScope("individual"));
}

function switchScope(scope) {
  const isTeam = scope === "team";

  document.getElementById("segBtnTeam").classList.toggle("is-active", isTeam);
  document.getElementById("segBtnTeam").setAttribute("aria-selected", String(isTeam));
  document.getElementById("segBtnIndividual").classList.toggle("is-active", !isTeam);
  document.getElementById("segBtnIndividual").setAttribute("aria-selected", String(!isTeam));

  document.getElementById("viewTeam").hidden = !isTeam;
  document.getElementById("viewIndividual").hidden = isTeam;
}

/* ---------------------------------------------------------
   Team Performance view
--------------------------------------------------------- */
function renderTeamTrendChart() {
  const canvas = document.getElementById("teamTrendChart");
  if (!canvas || typeof Chart === "undefined") return;

  new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: TEAM_TREND.labels,
      datasets: [
        {
          label: "Actual",
          data: TEAM_TREND.actual,
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
          data: TEAM_TREND.predicted,
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
    options: baseLineChartOptions(),
  });
}

function renderTeamSummaryTable() {
  const tbody = document.getElementById("teamSummaryBody");
  tbody.innerHTML = TEAM_MEMBERS.map(
    (m) => `
      <tr>
        <td>${m.name}</td>
        <td>${m.title}</td>
        <td>${m.managerScore.toFixed(1)} / 20</td>
        <td>${m.hrScore.toFixed(1)} / 5</td>
        <td>${m.total.toFixed(1)} / 25</td>
        <td><span class="pill ${m.categoryPill}">${m.category}</span></td>
      </tr>
    `
  ).join("");
}

/* ---------------------------------------------------------
   Individual Performance view
--------------------------------------------------------- */
function generateIndividualReport() {
  const employeeId = document.getElementById("indivEmployeeSelect").value;
  const fromValue = document.getElementById("indivFromSelect").value;
  const toValue = document.getElementById("indivToSelect").value;
  const errorEl = document.getElementById("indivFormError");
  const resultsEl = document.getElementById("individualResults");

  const isValid = employeeId !== "" && fromValue !== "" && toValue !== "";

  if (!isValid) {
    errorEl.hidden = false;
    resultsEl.hidden = true;
    return;
  }

  errorEl.hidden = true;

  const member = getMember(employeeId);
  let fromIdx = parseInt(fromValue, 10);
  let toIdx = parseInt(toValue, 10);
  if (fromIdx > toIdx) [fromIdx, toIdx] = [toIdx, fromIdx];

  renderIndividualTrendChart(member, fromIdx, toIdx);
  renderIndividualKpiTable(member);

  document.getElementById("indivFeedback").textContent = member.feedback;

  resultsEl.hidden = false;
}

function renderIndividualTrendChart(member, fromIdx, toIdx) {
  const canvas = document.getElementById("indivTrendChart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = QUARTER_LABELS.slice(fromIdx, toIdx + 1);
  const actualSlice = member.history.actual.slice(fromIdx, toIdx + 1);

  // Only show the predicted next quarter if the selected range runs
  // through the most recent completed quarter (Q1 2026).
  const includesPredicted = toIdx === QUARTER_LABELS.length - 1;
  const finalLabels = includesPredicted ? [...labels, "Q2 2026"] : labels;
  const actualData = includesPredicted ? [...actualSlice, null] : actualSlice;
  const predictedData = includesPredicted
    ? [...actualSlice.map(() => null).slice(0, -1), actualSlice[actualSlice.length - 1], member.history.predicted]
    : null;

  document.getElementById("indivChartHeading").textContent = `Performance Trend — ${member.name}`;
  document.getElementById("indivChartSub").textContent =
    `${labels[0]} – ${labels[labels.length - 1]} · Total score out of 25${includesPredicted ? " (includes AI-predicted Q2 2026)" : ""}`;

  if (indivTrendChart) indivTrendChart.destroy();

  const datasets = [
    {
      label: "Total score",
      data: actualData,
      borderColor: "#2563EB",
      backgroundColor: "#2563EB",
      pointBackgroundColor: "#2563EB",
      pointRadius: 4,
      pointHoverRadius: 5,
      borderWidth: 2,
      tension: 0.35,
      spanGaps: false,
    },
  ];

  if (includesPredicted) {
    datasets.push({
      label: "Predicted",
      data: predictedData,
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
    });
  }

  indivTrendChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: { labels: finalLabels, datasets },
    options: baseLineChartOptions(),
  });
}

function renderIndividualKpiTable(member) {
  const tbody = document.getElementById("indivKpiBody");
  tbody.innerHTML = KPIS.map((kpi) => {
    const score = member.kpiScores[kpi.id];
    return `
      <tr>
        <td>${kpi.title}</td>
        <td>${kpi.weight}%</td>
        <td>${score.toFixed(1)} / 5</td>
        <td>${kpi.target}%</td>
      </tr>
    `;
  }).join("");
}

/* ---------------------------------------------------------
   AI Analytics Reports tab
--------------------------------------------------------- */
function renderAiPredictionChart() {
  const canvas = document.getElementById("aiPredictionChart");
  if (!canvas || typeof Chart === "undefined") return;

  if (aiPredictionChart) aiPredictionChart.destroy();

  aiPredictionChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: TEAM_TREND.labels,
      datasets: [
        {
          label: "Actual",
          data: TEAM_TREND.actual,
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
          data: TEAM_TREND.predicted,
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
    options: baseLineChartOptions(),
  });
}

function renderAiClusterChart() {
  const canvas = document.getElementById("aiClusterChart");
  if (!canvas || typeof Chart === "undefined") return;

  if (aiClusterChart) aiClusterChart.destroy();

  const counts = { High: 0, Average: 0, Risk: 0 };
  TEAM_MEMBERS.forEach((m) => {
    if (m.category === "High Performer") counts.High += 1;
    else if (m.category === "Average Performer") counts.Average += 1;
    else counts.Risk += 1;
  });

  aiClusterChart = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["High Performer", "Average Performer", "At Risk"],
      datasets: [
        {
          data: [counts.High, counts.Average, counts.Risk],
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

/* ---------------------------------------------------------
   Bias detection — genuinely computed from this quarter's
   manager scores, not a hardcoded figure.
--------------------------------------------------------- */
function renderBiasDetection() {
  const scores = TEAM_MEMBERS.map((m) => m.managerScore);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  const flagged = stdDev > 2.5; // generous threshold out of a 20-point scale

  document.getElementById("biasText").textContent = flagged
    ? `Manager scores show a standard deviation of ${stdDev.toFixed(2)} points (out of 20) this cycle — wider than usual. Consider a calibration review across evaluators.`
    : `Manager scores across your team have a standard deviation of ${stdDev.toFixed(2)} points (out of 20), within a healthy range. No individual evaluator pattern is flagged for review this cycle.`;
}

/* ---------------------------------------------------------
   KPI optimization — finds the KPI with the widest score
   spread across the team, genuinely computed each time.
--------------------------------------------------------- */
function renderKpiOptimization() {
  let widest = { kpi: null, stdDev: -1 };

  KPIS.forEach((kpi) => {
    const scores = TEAM_MEMBERS.map((m) => m.kpiScores[kpi.id]);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > widest.stdDev) widest = { kpi, stdDev };
  });

  document.getElementById("optimizationText").textContent =
    `${widest.kpi.title} shows the widest score spread across your team this cycle (standard deviation ≈ ${widest.stdDev.toFixed(2)}, on a 1–5 scale). Consider reviewing its scoring rubric, or splitting it into clearer sub-criteria, for more consistent evaluation.`;
}

/* ---------------------------------------------------------
   Shared chart options
--------------------------------------------------------- */
function baseLineChartOptions() {
  return {
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
  };
}

/* ---------------------------------------------------------
   Export: PDF (browser print) and Excel (CSV download)
--------------------------------------------------------- */
function initExportButtons() {
  document.getElementById("exportPdfBtn").addEventListener("click", () => {
    EvaluAIShell.showToast("Opening print dialog — choose “Save as PDF” as the destination.");
    window.print();
  });

  document.getElementById("exportExcelBtn").addEventListener("click", handleExportExcel);
}

function handleExportExcel() {
  const performanceTabActive = !document.getElementById("tabPanelPerformance").hidden;

  if (!performanceTabActive) {
    EvaluAIShell.showToast("Switch to Performance Reports to export a spreadsheet.");
    return;
  }

  const teamScopeActive = !document.getElementById("viewTeam").hidden;

  if (teamScopeActive) {
    const rows = [["Employee", "Role", "Manager Score (/20)", "HR Score (/5)", "Total (/25)", "Category"]];
    TEAM_MEMBERS.forEach((m) => {
      rows.push([m.name, m.title, m.managerScore.toFixed(1), m.hrScore.toFixed(1), m.total.toFixed(1), m.category]);
    });
    downloadCsv("EvaluAI_Team_Report_Q1_2026.csv", rows);
    EvaluAIShell.showToast("Team report downloaded as CSV", "success");
    return;
  }

  // Individual scope
  const resultsVisible = !document.getElementById("individualResults").hidden;
  if (!resultsVisible) {
    document.getElementById("indivFormError").hidden = false;
    return;
  }

  const employeeId = document.getElementById("indivEmployeeSelect").value;
  const member = getMember(employeeId);
  const rows = [["KPI", "Weight", "Score (1-5)", "Target"]];
  KPIS.forEach((kpi) => {
    rows.push([kpi.title, `${kpi.weight}%`, member.kpiScores[kpi.id].toFixed(1), `${kpi.target}%`]);
  });

  downloadCsv(`EvaluAI_${member.name.replace(/\s+/g, "_")}_Report_Q1_2026.csv`, rows);
  EvaluAIShell.showToast(`${member.name}'s report downloaded as CSV`, "success");
}

function downloadCsv(filename, rows) {
  const csvContent = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
