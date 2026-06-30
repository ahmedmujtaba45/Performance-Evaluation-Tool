/* =========================================================
   EvaluAI — KPI Evaluation
   Page-specific behaviour: employee picker, weighted KPI
   scoring form, tab switching, and the AI insights chart.
   Shell behaviour (sidebar, dropdowns, modal mechanics, toasts)
   is handled by shared.js.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  EvaluAIShell.init();
  initKpiEvaluationPage();
});

/* ---------------------------------------------------------
   Source data
   In a real build, KPIS would come from GET /api/departments/:id/kpis
   and each member's scores from GET /api/evaluations?employee=&cycle=.
   Kept as plain arrays here so the logic below is easy to point
   at real data later.
--------------------------------------------------------- */
const KPIS = [
  {
    id: "code-quality",
    title: "Code Quality & Reviews",
    weight: 25,
    target: 95,
    description: "Maintain high code quality standards and conduct thorough peer reviews.",
  },
  {
    id: "project-delivery",
    title: "Project Delivery",
    weight: 30,
    target: 90,
    description: "Deliver projects on time with minimal bugs and rework.",
  },
  {
    id: "team-collaboration",
    title: "Team Collaboration",
    weight: 20,
    target: 90,
    description: "Collaborate effectively with the team, share knowledge, and support process improvements.",
  },
  {
    id: "technical-growth",
    title: "Technical Growth & Innovation",
    weight: 15,
    target: 85,
    description: "Demonstrate continuous learning, adopt new tools or technologies, and contribute innovative ideas.",
  },
  {
    id: "system-reliability",
    title: "System Reliability & Ownership",
    weight: 10,
    target: 99,
    description: "Take ownership of production stability and ensure systems run reliably with minimal downtime.",
  },
];

const TEAM_MEMBERS = [
  {
    id: "emily-chen",
    name: "Emily Chen",
    title: "Senior Developer",
    department: "Engineering",
    email: "emily.chen@evaluai.com",
    employeeId: "EMP-1042",
    status: "completed",
    lastEvaluated: "Jan 18, 2026",
    hrScore: 4.0,
    kpiScores: {
      "code-quality": 4.5,
      "project-delivery": 4.0,
      "team-collaboration": 4.0,
      "technical-growth": 4.5,
      "system-reliability": 4.0,
    },
    comments: {
      "code-quality": "Clean, consistent code with very few revision comments in review.",
      "project-delivery": "Delivered all sprint commitments on schedule this quarter.",
      "team-collaboration": "Reliable reviewer, helps unblock teammates quickly.",
      "technical-growth": "Completed two internal workshops on testing practices.",
      "system-reliability": "No major incidents linked to her modules.",
    },
    feedback: "Strong technical skills with consistent code quality above team average.",
  },
  {
    id: "michael-park",
    name: "Michael Park",
    title: "Software Engineer",
    department: "Engineering",
    email: "michael.park@evaluai.com",
    employeeId: "EMP-1057",
    status: "completed",
    lastEvaluated: "Jan 19, 2026",
    hrScore: 4.0,
    kpiScores: {
      "code-quality": 4.0,
      "project-delivery": 4.5,
      "team-collaboration": 4.5,
      "technical-growth": 4.0,
      "system-reliability": 4.0,
    },
    comments: {
      "code-quality": "Good quality overall, a few rework cycles on edge cases.",
      "project-delivery": "Consistently meets delivery timelines with minimal slippage.",
      "team-collaboration": "Active in stand-ups and pairs well with junior engineers.",
      "technical-growth": "Completed all assigned training modules this quarter.",
      "system-reliability": "Handled on-call rotation without major escalations.",
    },
    feedback: "Excellent learning agility with 100% training completion rate.",
  },
  {
    id: "david-kim",
    name: "David Kim",
    title: "DevOps Engineer",
    department: "Engineering",
    email: "david.kim@evaluai.com",
    employeeId: "EMP-1063",
    status: "completed",
    lastEvaluated: "Jan 20, 2026",
    hrScore: 4.5,
    kpiScores: {
      "code-quality": 5.0,
      "project-delivery": 4.5,
      "team-collaboration": 4.5,
      "technical-growth": 5.0,
      "system-reliability": 5.0,
    },
    comments: {
      "code-quality": "Infrastructure-as-code changes are clean and well documented.",
      "project-delivery": "Delivered the platform migration ahead of schedule.",
      "team-collaboration": "Proactively shares runbooks and mentors the team on tooling.",
      "technical-growth": "Introduced a new monitoring stack adopted team-wide.",
      "system-reliability": "Maintained 99.95% uptime with fast incident response.",
    },
    feedback: "Exceptional infrastructure management with 99.95% uptime.",
  },
];

const STATUS_META = {
  completed: { label: "Evaluation Completed", pillClass: "pill-green" },
  pending: { label: "Evaluation Pending", pillClass: "pill-amber" },
};

/* ---------------------------------------------------------
   Module state
--------------------------------------------------------- */
let selectedEmployeeId = null;
let kpiBreakdownChart = null;

/* ---------------------------------------------------------
   Page init
--------------------------------------------------------- */
function initKpiEvaluationPage() {
  selectedEmployeeId = getEmployeeIdFromUrl() || TEAM_MEMBERS[0].id;

  renderEmployeeList();
  selectEmployee(selectedEmployeeId);
  initTabs();
  initFormActions();
}

function getEmployeeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("employee");
  return TEAM_MEMBERS.some((m) => m.id === requested) ? requested : null;
}

function getMember(id) {
  return TEAM_MEMBERS.find((m) => m.id === id);
}

/* ---------------------------------------------------------
   Score calculation
   Manager score (out of 20) = weighted average of the five
   1–5 KPI scores, scaled by 4 (since 5 × 4 = 20).
--------------------------------------------------------- */
function computeManagerScore(kpiScores) {
  const weightedAverage = KPIS.reduce((sum, kpi) => {
    return sum + (kpiScores[kpi.id] || 0) * (kpi.weight / 100);
  }, 0);
  return weightedAverage * 4;
}

/* ---------------------------------------------------------
   Employee picker
--------------------------------------------------------- */
function renderEmployeeList() {
  const list = document.getElementById("employeeList");

  list.innerHTML = TEAM_MEMBERS.map((member) => {
    const total = computeManagerScore(member.kpiScores) + member.hrScore;
    return `
      <li>
        <button class="employee-row" type="button" data-employee-id="${member.id}">
          <span class="avatar">${getInitials(member.name)}</span>
          <span class="employee-row-text">
            <p>${member.name}</p>
            <p>${member.title}</p>
          </span>
          <span class="employee-row-score">${total.toFixed(1)}</span>
        </button>
      </li>
    `;
  }).join("");

  list.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-employee-id]");
    if (!trigger) return;
    selectEmployee(trigger.getAttribute("data-employee-id"));
  });
}

function updateEmployeeListSelection() {
  document.querySelectorAll(".employee-row").forEach((row) => {
    row.classList.toggle("is-selected", row.getAttribute("data-employee-id") === selectedEmployeeId);
  });
}

function updateEmployeeRowScore(memberId) {
  const member = getMember(memberId);
  const row = document.querySelector(`.employee-row[data-employee-id="${memberId}"]`);
  if (!row || !member) return;
  const total = computeManagerScore(member.kpiScores) + member.hrScore;
  row.querySelector(".employee-row-score").textContent = total.toFixed(1);
}

/* ---------------------------------------------------------
   Select an employee — re-renders header + all three tabs
--------------------------------------------------------- */
function selectEmployee(id) {
  selectedEmployeeId = id;
  updateEmployeeListSelection();

  const member = getMember(id);
  renderEvaluationHeader(member);
  renderOverviewTab(member);
  renderEvaluationTab(member);
  renderInsightsFeedback(member);

  // Only redraw the chart if the Insights tab is currently visible —
  // Chart.js needs the canvas to have real layout dimensions.
  const insightsPanel = document.getElementById("tabPanelInsights");
  if (insightsPanel && !insightsPanel.hidden) {
    renderKpiBreakdownChart(member);
  }
}

function renderEvaluationHeader(member) {
  document.getElementById("empAvatar").textContent = getInitials(member.name);
  document.getElementById("empName").textContent = member.name;
  document.getElementById("empTitle").textContent = `${member.title} · ${member.department}`;

  const status = STATUS_META[member.status];
  const statusPill = document.getElementById("empStatusPill");
  statusPill.textContent = status.label;
  statusPill.className = `pill ${status.pillClass}`;
}

/* ---------------------------------------------------------
   Overview tab
--------------------------------------------------------- */
function renderOverviewTab(member) {
  document.getElementById("ovDept").textContent = member.department;
  document.getElementById("ovEmail").textContent = member.email;
  document.getElementById("ovEmployeeId").textContent = member.employeeId;
  document.getElementById("ovKpiCount").textContent = `${KPIS.length} KPIs`;
  document.getElementById("ovLastEvaluated").textContent = member.lastEvaluated;
}

/* ---------------------------------------------------------
   Evaluation tab — KPI cards with live-updating sliders
--------------------------------------------------------- */
function renderEvaluationTab(member) {
  const kpiList = document.getElementById("kpiList");

  kpiList.innerHTML = KPIS.map((kpi) => {
    const score = member.kpiScores[kpi.id];
    const comment = member.comments[kpi.id] || "";

    return `
      <div class="kpi-card" data-kpi-id="${kpi.id}">
        <div class="kpi-card-head">
          <div>
            <h5>${kpi.title}</h5>
            <p>${kpi.description}</p>
          </div>
          <div class="kpi-card-tags">
            <span class="pill pill-blue">Weight ${kpi.weight}%</span>
            <span class="pill pill-neutral">Target ${kpi.target}%</span>
          </div>
        </div>

        <div class="kpi-score-row">
          <span>Manager Score (1–5)</span>
          <span class="kpi-score-value" data-score-display>${score.toFixed(1)}</span>
        </div>
        <input
          type="range" class="kpi-slider" min="1" max="5" step="0.5"
          value="${score}" data-kpi-slider
          aria-label="${kpi.title} score, 1 to 5" />
        <div class="kpi-slider-scale"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>

        <textarea
          class="field-textarea kpi-comment" data-kpi-comment
          placeholder="Add your evaluation comments…">${comment}</textarea>
      </div>
    `;
  }).join("");

  // Live score readout + running summary as each slider moves
  kpiList.querySelectorAll("[data-kpi-slider]").forEach((slider) => {
    slider.addEventListener("input", () => {
      const card = slider.closest(".kpi-card");
      card.querySelector("[data-score-display]").textContent = parseFloat(slider.value).toFixed(1);
      updateLiveSummary(member);
    });
  });

  updateLiveSummary(member);
}

function readScoresFromForm() {
  const scores = {};
  document.querySelectorAll("#kpiList .kpi-card").forEach((card) => {
    const kpiId = card.getAttribute("data-kpi-id");
    const slider = card.querySelector("[data-kpi-slider]");
    scores[kpiId] = parseFloat(slider.value);
  });
  return scores;
}

function readCommentsFromForm() {
  const comments = {};
  document.querySelectorAll("#kpiList .kpi-card").forEach((card) => {
    const kpiId = card.getAttribute("data-kpi-id");
    const textarea = card.querySelector("[data-kpi-comment]");
    comments[kpiId] = textarea.value.trim();
  });
  return comments;
}

function updateLiveSummary(member) {
  const liveScores = readScoresFromForm();
  const managerScore = computeManagerScore(liveScores);
  const total = managerScore + member.hrScore;

  document.getElementById("summaryManagerScore").textContent = `${managerScore.toFixed(1)} / 20`;
  document.getElementById("summaryHrScore").textContent = `${member.hrScore.toFixed(1)} / 5`;
  document.getElementById("summaryTotalScore").textContent = `${total.toFixed(1)} / 25`;
  document.getElementById("summaryWeightNote").textContent =
    "Manager score is the weighted average of the KPI scores above, scaled to 20 points. HR evaluation (5 points) is recorded separately by HR.";
}

/* ---------------------------------------------------------
   Insights tab
--------------------------------------------------------- */
function renderInsightsFeedback(member) {
  document.getElementById("insightFeedback").textContent = member.feedback;

  const list = document.getElementById("insightSuggestions");
  list.innerHTML = buildSuggestions(member)
    .map(
      (text) => `
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11"/></svg>
          <p>${text}</p>
        </li>
      `
    )
    .join("");
}

function buildSuggestions(member) {
  const entries = KPIS.map((kpi) => ({ kpi, score: member.kpiScores[kpi.id] }));
  const strongest = entries.reduce((a, b) => (b.score > a.score ? b : a));
  const weakest = entries.reduce((a, b) => (b.score < a.score ? b : a));
  const heaviestWeighted = entries.reduce((a, b) => (b.kpi.weight > a.kpi.weight ? b : a));
  const firstName = member.name.split(" ")[0];

  const suggestions = [
    `${firstName} is performing strongest on ${strongest.kpi.title.toLowerCase()} (${strongest.score.toFixed(1)}/5) — worth highlighting in written feedback.`,
  ];

  if (weakest.kpi.id !== strongest.kpi.id) {
    suggestions.push(
      `${weakest.kpi.title} is the lowest-scoring area (${weakest.score.toFixed(1)}/5) — a reasonable focus area for next quarter's goals.`
    );
  }

  if (heaviestWeighted.kpi.id !== strongest.kpi.id && heaviestWeighted.kpi.id !== weakest.kpi.id) {
    suggestions.push(
      `${heaviestWeighted.kpi.title} carries the highest weight (${heaviestWeighted.kpi.weight}%) — currently scoring ${heaviestWeighted.score.toFixed(1)}/5, so small changes here move the total score the most.`
    );
  }

  return suggestions;
}

function renderKpiBreakdownChart(member) {
  const canvas = document.getElementById("kpiBreakdownChart");
  if (!canvas || typeof Chart === "undefined") return;

  if (kpiBreakdownChart) {
    kpiBreakdownChart.destroy();
  }

  const scores = KPIS.map((kpi) => member.kpiScores[kpi.id]);
  const colors = scores.map((score) => {
    if (score >= 4.5) return "#16A34A";
    if (score >= 3.5) return "#2563EB";
    return "#D97706";
  });

  kpiBreakdownChart = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: KPIS.map((kpi) => kpi.title),
      datasets: [
        {
          data: scores,
          backgroundColor: colors,
          borderRadius: 6,
          maxBarThickness: 22,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#101828",
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: "Inter", size: 12 },
          bodyFont: { family: "Inter", size: 12 },
          callbacks: {
            label: (ctx) => `${ctx.formattedValue} / 5`,
          },
        },
      },
      scales: {
        x: {
          min: 0,
          max: 5,
          grid: { color: "#F0F1F4" },
          ticks: { color: "#98A2B3", font: { family: "Inter", size: 10.5 }, stepSize: 1 },
        },
        y: {
          grid: { display: false },
          ticks: { color: "#475467", font: { family: "Inter", size: 11 } },
        },
      },
    },
  });
}

/* ---------------------------------------------------------
   Tabs
--------------------------------------------------------- */
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
  });

  document.querySelectorAll("[data-go-tab]").forEach((el) => {
    el.addEventListener("click", () => switchTab(el.getAttribute("data-go-tab")));
  });
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const isActive = btn.getAttribute("data-tab") === tabName;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const isMatch = panel.id === `tabPanel${capitalize(tabName)}`;
    panel.hidden = !isMatch;
  });

  if (tabName === "insights") {
    renderKpiBreakdownChart(getMember(selectedEmployeeId));
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ---------------------------------------------------------
   Form actions
--------------------------------------------------------- */
function initFormActions() {
  document.getElementById("saveDraftBtn").addEventListener("click", () => {
    const member = getMember(selectedEmployeeId);
    member.kpiScores = readScoresFromForm();
    member.comments = readCommentsFromForm();
    updateEmployeeRowScore(member.id);
    EvaluAIShell.showToast(`Draft saved for ${member.name}`);
  });

  document.getElementById("submitEvalBtn").addEventListener("click", () => {
    const member = getMember(selectedEmployeeId);
    member.kpiScores = readScoresFromForm();
    member.comments = readCommentsFromForm();
    member.status = "completed";
    member.lastEvaluated = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    updateEmployeeRowScore(member.id);
    renderEvaluationHeader(member);
    renderOverviewTab(member);
    renderInsightsFeedback(member);

    EvaluAIShell.showToast(`Evaluation submitted for ${member.name}`, "success");
  });
}

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
function getInitials(fullName) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
