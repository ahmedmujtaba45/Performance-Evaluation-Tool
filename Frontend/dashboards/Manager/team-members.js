/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — Manager Dashboard (Team Members)                    ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: EmployeesController                             ║
  ║    Path: Backend/controllers/EmployeesController.cs            ║
  ║    Endpoints: GET /api/employees                               ║
  ║                GET /api/employees/{id}                         ║
  ║                GET /api/employees/department/{department}      ║
  ║                                                                ║
  ║  • Controller: EvaluationsController                           ║
  ║    Path: Backend/controllers/EvaluationsController.cs          ║
  ║    Endpoints: GET /api/evaluations/employee/{employeeId}       ║
  ║                GET /api/evaluations/cycle/{cycleId}            ║
  ║                                                                ║
  ║  • Service: IEmployeeService                                   ║
  ║    Path: Backend/services/IEmployeeService.cs                  ║
  ║    Implementation: Backend/services/EmployeeService.cs         ║
  ║                                                                ║
  ║  • Service: IEvaluationService                                 ║
  ║    Path: Backend/services/IEvaluationService.cs                ║
  ║    Implementation: Backend/services/EvaluationService.cs       ║
  ║                                                                ║
  ║  • DTOs:                                                        ║
  ║    - EmployeeListDto: Backend/dtos/employee/EmployeeListDto.cs ║
  ║    - EmployeeDetailDto: Backend/dtos/employee/EmployeeDetailDto.cs
  ║    - EvaluationDetailDto: Backend/dtos/evaluation/EvaluationDetailDto.cs
  ╚════════════════════════════════════════════════════════════════╝
*/

/* =========================================================
   EvaluAI — Team Members
   Page-specific behaviour: renders the roster from data,
   wires up search / filter / sort, and the profile modal.
   Shell behaviour (sidebar, dropdowns, modal mechanics) is
   handled by shared.js.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  EvaluAIShell.init();
  initTeamMembersPage();
});

/* ---------------------------------------------------------
   Source data
   In a real build this would come from the backend API
   (GET /api/managers/:id/team) — kept as a plain array here
   so the rendering logic below is easy to point at real data.
--------------------------------------------------------- */
const TEAM_MEMBERS = [
  {
    id: "emily-chen",
    name: "Emily Chen",
    title: "Senior Developer",
    department: "Engineering",
    email: "emily.chen@evaluai.com",
    employeeId: "EMP-1042",
    score: { manager: 16.8, hr: 4.0, total: 20.8 },
    kpisCompleted: 5,
    kpisTotal: 5,
    lastEvaluated: "Jan 18, 2026",
    status: "completed",
    category: "average",
    feedback: "Strong technical skills with consistent code quality above team average.",
  },
  {
    id: "michael-park",
    name: "Michael Park",
    title: "Software Engineer",
    department: "Engineering",
    email: "michael.park@evaluai.com",
    employeeId: "EMP-1057",
    score: { manager: 17.0, hr: 4.0, total: 21.0 },
    kpisCompleted: 5,
    kpisTotal: 5,
    lastEvaluated: "Jan 19, 2026",
    status: "completed",
    category: "average",
    feedback: "Excellent learning agility with 100% training completion rate.",
  },
  {
    id: "david-kim",
    name: "David Kim",
    title: "DevOps Engineer",
    department: "Engineering",
    email: "david.kim@evaluai.com",
    employeeId: "EMP-1063",
    score: { manager: 19.0, hr: 4.5, total: 23.5 },
    kpisCompleted: 5,
    kpisTotal: 5,
    lastEvaluated: "Jan 20, 2026",
    status: "completed",
    category: "high",
    feedback: "Exceptional infrastructure management with 99.95% uptime.",
  },
];

const CATEGORY_META = {
  high: { label: "High Performer", pillClass: "pill-green", barColor: "#16A34A" },
  average: { label: "Average Performer", pillClass: "pill-blue", barColor: "#2563EB" },
  risk: { label: "At Risk", pillClass: "pill-red", barColor: "#EF4444" },
};

const STATUS_META = {
  completed: { label: "Evaluation Completed", pillClass: "pill-green" },
  pending: { label: "Evaluation Pending", pillClass: "pill-amber" },
};

/* ---------------------------------------------------------
   Page init
--------------------------------------------------------- */
function initTeamMembersPage() {
  const grid = document.getElementById("memberGrid");
  const emptyState = document.getElementById("emptyState");
  const resultsCount = document.getElementById("resultsCount");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortSelect = document.getElementById("sortSelect");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  function getFilteredMembers() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    let members = TEAM_MEMBERS.filter((m) => {
      const matchesQuery =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.title.toLowerCase().includes(query);
      const matchesCategory = category === "all" || m.category === category;
      return matchesQuery && matchesCategory;
    });

    switch (sortSelect.value) {
      case "score-asc":
        members.sort((a, b) => a.score.total - b.score.total);
        break;
      case "name-asc":
        members.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "score-desc":
      default:
        members.sort((a, b) => b.score.total - a.score.total);
    }

    return members;
  }

  function render() {
    const members = getFilteredMembers();

    resultsCount.textContent = `Showing ${members.length} of ${TEAM_MEMBERS.length} team members`;

    if (members.length === 0) {
      grid.hidden = true;
      emptyState.hidden = false;
      grid.innerHTML = "";
      return;
    }

    grid.hidden = false;
    emptyState.hidden = true;
    grid.innerHTML = members.map(renderMemberCard).join("");
  }

  function renderMemberCard(member) {
    const initials = getInitials(member.name);
    const category = CATEGORY_META[member.category];
    const status = STATUS_META[member.status];
    const scorePercent = Math.round((member.score.total / 25) * 100);

    return `
      <article class="member-card" data-id="${member.id}">
        <div class="member-card-top">
          <div class="member-identity">
            <span class="avatar avatar-lg">${initials}</span>
            <div>
              <h3>${member.name}</h3>
              <p>${member.title}</p>
            </div>
          </div>
          <span class="pill ${category.pillClass}">${category.label}</span>
        </div>

        <div class="member-meta">
          <span class="member-dept">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 11h.01M15 11h.01M9 15h.01M15 15h.01"/></svg>
            ${member.department}
          </span>
          <span class="pill ${status.pillClass}">${status.label}</span>
        </div>

        <div class="member-score">
          <div class="member-score-value">${member.score.total.toFixed(1)}<span>/25</span></div>
          <div class="member-score-bar">
            <div class="member-score-fill" style="width:${scorePercent}%; background:${category.barColor};"></div>
          </div>
        </div>

        <div class="member-stats-row">
          <div>
            <span class="label">KPIs</span>
            <span class="value">${member.kpisCompleted}/${member.kpisTotal}</span>
          </div>
          <div>
            <span class="label">Last evaluated</span>
            <span class="value">${member.lastEvaluated}</span>
          </div>
        </div>

        <div class="member-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-action="view-profile" data-id="${member.id}">View Profile</button>
          <a class="btn btn-primary btn-sm" href="kpi-evaluation.html?employee=${member.id}">Evaluate</a>
        </div>
      </article>
    `;
  }

  // Re-render on every input change
  [searchInput, categoryFilter, sortSelect].forEach((control) => {
    const evt = control.tagName === "SELECT" ? "change" : "input";
    control.addEventListener(evt, render);
  });

  clearFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    sortSelect.value = "score-desc";
    render();
  });

  // Event delegation for "View Profile" buttons (cards are re-rendered dynamically)
  grid.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-action='view-profile']");
    if (!trigger) return;
    openProfileModal(trigger.getAttribute("data-id"));
  });

  render();
  initProfileModal();
}

/* ---------------------------------------------------------
   Profile modal
--------------------------------------------------------- */
function initProfileModal() {
  // Modal open/close mechanics (backdrop click, Escape, close buttons)
  // are already wired up globally by EvaluAIShell.init().
}

function openProfileModal(memberId) {
  const member = TEAM_MEMBERS.find((m) => m.id === memberId);
  const modal = document.getElementById("profileModal");
  if (!member || !modal) return;

  const category = CATEGORY_META[member.category];
  const status = STATUS_META[member.status];

  document.getElementById("modalAvatar").textContent = getInitials(member.name);
  document.getElementById("modalName").textContent = member.name;
  document.getElementById("modalTitle").textContent = `${member.title} · ${member.department}`;
  document.getElementById("modalDept").textContent = member.department;
  document.getElementById("modalEmail").textContent = member.email;
  document.getElementById("modalEmployeeId").textContent = member.employeeId;
  document.getElementById("modalLastEvaluated").textContent = member.lastEvaluated;

  const categoryPill = document.getElementById("modalCategoryPill");
  categoryPill.textContent = category.label;
  categoryPill.className = `pill ${category.pillClass}`;

  const statusPill = document.getElementById("modalStatusPill");
  statusPill.textContent = status.label;
  statusPill.className = `pill ${status.pillClass}`;

  document.getElementById("modalScoreManager").textContent = `${member.score.manager.toFixed(1)} / 20`;
  document.getElementById("modalScoreHr").textContent = `${member.score.hr.toFixed(1)} / 5`;
  document.getElementById("modalScoreTotal").textContent = `${member.score.total.toFixed(1)} / 25`;

  document.getElementById("modalFeedback").textContent = member.feedback;
  document.getElementById("modalEvaluateLink").href = `kpi-evaluation.html?employee=${member.id}`;

  EvaluAIShell.openModal(modal);
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
