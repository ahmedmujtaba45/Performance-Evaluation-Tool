/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — HR Dashboard (Scoring)                              ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: EvaluationsController                           ║
  ║    Path: Backend/controllers/EvaluationsController.cs          ║
  ║    Endpoints: GET /api/evaluations                             ║
  ║                GET /api/evaluations/employee/{employeeId}      ║
  ║                GET /api/evaluations/cycle/{cycleId}            ║
  ║                POST /api/evaluations                           ║
  ║                PUT /api/evaluations/{id}                       ║
  ║                                                                ║
  ║  • Controller: EmployeesController                             ║
  ║    Path: Backend/controllers/EmployeesController.cs            ║
  ║    Endpoints: GET /api/employees                               ║
  ║                GET /api/employees/{id}                         ║
  ║                                                                ║
  ║  • Service: IEvaluationService                                 ║
  ║    Path: Backend/services/IEvaluationService.cs                ║
  ║    Implementation: Backend/services/EvaluationService.cs       ║
  ║                                                                ║
  ║  • Service: IEmployeeService                                   ║
  ║    Path: Backend/services/IEmployeeService.cs                  ║
  ║    Implementation: Backend/services/EmployeeService.cs         ║
  ║                                                                ║
  ║  • DTOs:                                                        ║
  ║    - EvaluationDetailDto: Backend/dtos/evaluation/EvaluationDetailDto.cs
  ║    - KpiScoreDto: Backend/dtos/evaluation/KpiScoreDto.cs       ║
  ║    - EmployeeDetailDto: Backend/dtos/employee/EmployeeDetailDto.cs
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ===========================================================
   EvaluAI — HR Dashboard (Scoring module)
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
    "overview": "Overview",
    "employees": "Employees",
    "manage-employees": "Manage Employees",
    "scoring": "Scoring",
    "reports": "Reports",
    "announcements": "Announcements",
    "surveys": "Surveys",
  };

  const moduleLinks = {
    "overview": "hr-dashboard.html",
    "manage-employees": "employee-management.html",
    "reports": "reports.html",
    "announcements": "announcements.html",
    "surveys": "surveys.html",
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const moduleKey = item.dataset.module;
      if (moduleKey === "scoring") { closeSidebar(); return; }
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
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
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
        <span>
          <span class="notif-text">${n.text}</span>
          <div class="notif-time">${n.time}</div>
        </span>
      </li>
    `).join("");
    const unread = notifications.filter((n) => !n.read).length;
    notifBadge.style.display = unread > 0 ? "flex" : "none";
    if (unread > 0) notifBadge.textContent = unread;
  }
  renderNotifications();

  /* ---------------------------------------------------------
     KPI rubrics
     Manager section is department-specific (20 marks each,
     drawn from the team's quarterly evaluation forms). HR
     section is the same 5-mark rubric for every department.
  --------------------------------------------------------- */
  const kpiRubrics = {
    Engineering: [
      { id: "e1", title: "Requirement Understanding & Implementation", desc: "Understands business and technical requirements and translates them into working features with minimal rework.", max: 3 },
      { id: "e2", title: "Code Quality & Maintainability", desc: "Writes clean, reliable, maintainable code following coding standards, with proper testing and managed technical debt.", max: 3 },
      { id: "e3", title: "Productivity & Delivery", desc: "Completes assigned tasks efficiently within planned timelines and maintains a steady release cycle.", max: 3 },
      { id: "e4", title: "App Performance & Reliability", desc: "Keeps the application running smoothly — minimizing crashes, optimizing load time, and handling errors gracefully.", max: 3 },
      { id: "e5", title: "Team & Process Efficiency", desc: "Collaborates well within the team: timely code reviews, smooth deployments, and clear documentation.", max: 3 },
      { id: "e6", title: "Technical Ownership & Accountability", desc: "Takes responsibility for assigned modules end-to-end, including debugging and long-term stability.", max: 3 },
      { id: "e7", title: "Learning, Innovation & Technical Growth", desc: "Improves skills, adopts new technologies, and contributes innovative ideas to the team.", max: 2 },
    ],
    Marketing: [
      { id: "m1", title: "Post Engagement", desc: "Total interactions per post (likes, comments, shares). Target: 90 interactions per post.", max: 3 },
      { id: "m2", title: "Average Impressions", desc: "How many people see each post. Target: 7,500 impressions per post.", max: 3 },
      { id: "m3", title: "Follower Growth Contribution", desc: "Contribution to the team's monthly follower growth target of 1,250 followers.", max: 3 },
      { id: "m4", title: "Deliverables per Month & Approval Rate", desc: "Completion of all assigned designs and posts with a \u226595% approval rate.", max: 3 },
      { id: "m5", title: "Shoot Execution", desc: "Successful completion of planned photo/video shoots according to schedule and creative brief.", max: 2 },
      { id: "m6", title: "Timeliness of Deliveries", desc: "100% of tasks, designs, and content delivered on time.", max: 3 },
      { id: "m7", title: "New Initiatives & Contribution", desc: "Participation in new initiatives — at least 2 fresh ideas contributed per quarter.", max: 3 },
    ],
    Finance: [
      { id: "f1", title: "Financial Data Entry Accuracy (QBO)", desc: "Accurate entry of all financial transactions into QuickBooks Online.", max: 3 },
      { id: "f2", title: "Vendor Invoice Documentation & Approval", desc: "Vendor invoices recorded with proper documentation and authorization before posting.", max: 3 },
      { id: "f3", title: "Tax Treatment & GL Account Accuracy", desc: "Correct tax treatment and GL account/class/department tagging for all transactions.", max: 3 },
      { id: "f4", title: "Voucher & Supporting Document Verification", desc: "All vouchers verified against valid supporting documents before posting.", max: 3 },
      { id: "f5", title: "Bank Reconciliation Support", desc: "Updated and complete bank reconciliation support submitted each month.", max: 2 },
      { id: "f6", title: "Financial Reporting & Documentation", desc: "Well-organized monthly document folder and timely assistance with financial reports and AR/AP reporting.", max: 3 },
      { id: "f7", title: "Routine Finance Operations Support", desc: "Completion of routine bank tasks and operational support assigned by Manager Finance.", max: 3 },
    ],
  };

  const hrRubric = [
    { id: "h1", title: "Attendance & Punctuality", desc: "Consistent attendance and punctuality across the quarter.", max: 2 },
    { id: "h2", title: "Professional Conduct & Behavior", desc: "Professionalism in communication and collaboration with colleagues.", max: 2 },
    { id: "h3", title: "Organizational Contribution", desc: "Contribution to wider organizational initiatives beyond core role duties.", max: 1 },
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

  /* ---------------------------------------------------------
     Employee data (in-memory, mirrors Manage Employees)
     Seed scores reflect a mostly-complete Q1 2026 cycle.
  --------------------------------------------------------- */
  let employees = [
    {
      id: 1, name: "David Kim", jobTitle: "DevOps Engineer", department: "Engineering",
      status: "completed", comments: "Strong infrastructure ownership this quarter with exceptional uptime. Ready for more senior technical responsibility.",
      scores: { e1: 3, e2: 3, e3: 2, e4: 3, e5: 2.5, e6: 3, e7: 2 },
      hrScores: { h1: 2, h2: 2, h3: 1 },
    },
    {
      id: 2, name: "Emily Chen", jobTitle: "Senior Developer", department: "Engineering",
      status: "completed", comments: "Consistently high code quality with thorough peer reviews. Could take on more cross-team initiatives next quarter.",
      scores: { e1: 2.5, e2: 3, e3: 2.5, e4: 2, e5: 2, e6: 2.5, e7: 1.5 },
      hrScores: { h1: 2, h2: 1.5, h3: 1 },
    },
    {
      id: 3, name: "Michael Park", jobTitle: "Software Engineer", department: "Engineering",
      status: "completed", comments: "Solid, dependable delivery all quarter. Encourage deeper ownership of production issues going forward.",
      scores: { e1: 2.5, e2: 2.5, e3: 2.5, e4: 2.5, e5: 2, e6: 2.5, e7: 1.5 },
      hrScores: { h1: 2, h2: 2, h3: 1 },
    },
    {
      id: 4, name: "Fahad Siddique", jobTitle: "Digital Marketing Executive", department: "Marketing",
      status: "completed", comments: "Consistently exceeds post engagement and impression targets. New campaign ideas were a highlight this quarter.",
      scores: { m1: 2.5, m2: 2.5, m3: 2, m4: 2.5, m5: 1.5, m6: 2.5, m7: 2 },
      hrScores: { h1: 1.5, h2: 1.5, h3: 1 },
    },
    {
      id: 5, name: "Shahmeer", jobTitle: "Accounts Officer", department: "Finance",
      status: "not-started", comments: "",
      scores: {}, hrScores: {},
    },
  ];

  /* ---------------------------------------------------------
     Score calculation helpers
  --------------------------------------------------------- */
  function managerMax(department) {
    return kpiRubrics[department].reduce((sum, k) => sum + k.max, 0);
  }
  const hrMax = hrRubric.reduce((sum, k) => sum + k.max, 0);

  function managerTotal(emp) {
    return kpiRubrics[emp.department].reduce((sum, k) => sum + (emp.scores[k.id] || 0), 0);
  }
  function hrTotal(emp) {
    return hrRubric.reduce((sum, k) => sum + (emp.hrScores[k.id] || 0), 0);
  }
  function grandTotal(emp) {
    return managerTotal(emp) + hrTotal(emp);
  }
  function fmt(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
  }

  /* ---------------------------------------------------------
     Team list
  --------------------------------------------------------- */
  const teamList = document.getElementById("teamList");
  const teamSearch = document.getElementById("teamSearch");
  const teamCount = document.getElementById("teamCount");
  let activeId = null;

  function renderTeamList() {
    const q = teamSearch.value.trim().toLowerCase();
    const rows = employees.filter((e) =>
      !q || e.name.toLowerCase().includes(q) || e.jobTitle.toLowerCase().includes(q) || e.department.toLowerCase().includes(q)
    );

    teamCount.textContent = employees.length;

    if (rows.length === 0) {
      teamList.innerHTML = `<li class="team-empty">No team members match your search</li>`;
      return;
    }

    teamList.innerHTML = rows.map((e) => {
      const total = grandTotal(e);
      const scoreLabel = e.status === "not-started"
        ? `<span class="team-item-score team-item-score--empty">Not started</span>`
        : `<span class="team-item-score">${fmt(total)}/25</span>`;
      return `
        <li>
          <button class="team-item ${e.id === activeId ? "is-active" : ""}" data-id="${e.id}" type="button">
            <span class="emp-avatar" style="background:${avatarPalettes[e.department]}">${initials(e.name)}</span>
            <span class="team-item-info">
              <div class="team-item-name">${escapeHtml(e.name)}</div>
              <div class="team-item-role">${escapeHtml(e.jobTitle)}</div>
            </span>
            ${scoreLabel}
          </button>
        </li>
      `;
    }).join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  teamSearch.addEventListener("input", renderTeamList);

  teamList.addEventListener("click", (e) => {
    const btn = e.target.closest(".team-item");
    if (!btn) return;
    selectEmployee(parseInt(btn.dataset.id, 10));
  });

  /* ---------------------------------------------------------
     Score panel
  --------------------------------------------------------- */
  const emptyPanel = document.getElementById("emptyPanel");
  const scoreForm = document.getElementById("scoreForm");
  const empAvatar = document.getElementById("empAvatar");
  const empName = document.getElementById("empName");
  const empMeta = document.getElementById("empMeta");
  const statusPill = document.getElementById("statusPill");
  const gauge = document.getElementById("gauge");
  const gaugeTotal = document.getElementById("gaugeTotal");
  const managerSubtotal = document.getElementById("managerSubtotal");
  const hrSubtotal = document.getElementById("hrSubtotal");
  const totalScoreEl = document.getElementById("totalScore");
  const deptKpiNote = document.getElementById("deptKpiNote");
  const managerKpiList = document.getElementById("managerKpiList");
  const hrKpiList = document.getElementById("hrKpiList");
  const evalComments = document.getElementById("evalComments");
  const errorComments = document.getElementById("errorComments");

  const statusText = { "completed": "Scored", "draft": "Draft", "not-started": "Not Started" };

  function selectEmployee(id) {
    activeId = id;
    renderTeamList();
    renderScoreForm();
  }

  function renderScoreForm() {
    const emp = employees.find((e) => e.id === activeId);
    if (!emp) {
      emptyPanel.hidden = false;
      scoreForm.hidden = true;
      return;
    }
    emptyPanel.hidden = true;
    scoreForm.hidden = false;

    empAvatar.style.background = avatarPalettes[emp.department];
    empAvatar.textContent = initials(emp.name);
    empName.textContent = emp.name;
    empMeta.textContent = `${emp.jobTitle} · ${emp.department}`;
    statusPill.textContent = statusText[emp.status];
    statusPill.className = `badge-pill status-pill status-pill--${emp.status}`;

    deptKpiNote.textContent = `${emp.department} team KPIs for the selected evaluation cycle`;

    managerKpiList.innerHTML = kpiRubrics[emp.department].map((k) => kpiRowHtml(k, emp.scores[k.id] || 0, "m")).join("");
    hrKpiList.innerHTML = hrRubric.map((k) => kpiRowHtml(k, emp.hrScores[k.id] || 0, "h")).join("");

    evalComments.value = emp.comments || "";
    errorComments.textContent = "";
    evalComments.classList.remove("is-invalid");

    updateSummary(emp);
  }

  function kpiRowHtml(k, value, prefix) {
    return `
      <div class="kpi-row">
        <div class="kpi-row-head">
          <span class="kpi-title">${escapeHtml(k.title)}</span>
          <span class="kpi-max">/ ${k.max}</span>
        </div>
        <p class="kpi-desc">${escapeHtml(k.desc)}</p>
        <div class="kpi-slider-row">
          <input type="range" min="0" max="${k.max}" step="0.5" value="${value}" data-kpi="${k.id}" data-group="${prefix}" />
          <span class="kpi-slider-value" id="val-${prefix}-${k.id}">${fmt(value)} / ${k.max}</span>
        </div>
      </div>
    `;
  }

  function updateSummary(emp) {
    const mTotal = managerTotal(emp);
    const hTotal = hrTotal(emp);
    const total = mTotal + hTotal;
    const mMax = managerMax(emp.department);

    managerSubtotal.textContent = `${fmt(mTotal)} / ${mMax}`;
    hrSubtotal.textContent = `${fmt(hTotal)} / ${hrMax}`;
    totalScoreEl.textContent = `${fmt(total)} / ${mMax + hrMax}`;
    gaugeTotal.textContent = fmt(total);
    gauge.style.setProperty("--pct", Math.round((total / (mMax + hrMax)) * 100));
  }

  // Slider live updates (event delegation)
  scoreForm.addEventListener("input", (e) => {
    const input = e.target;
    if (input.type !== "range") return;

    const emp = employees.find((ev) => ev.id === activeId);
    if (!emp) return;

    const kpiId = input.dataset.kpi;
    const group = input.dataset.group;
    const value = parseFloat(input.value);
    const max = parseFloat(input.max);

    if (group === "m") emp.scores[kpiId] = value;
    else emp.hrScores[kpiId] = value;

    document.getElementById(`val-${group}-${kpiId}`).textContent = `${fmt(value)} / ${max}`;
    updateSummary(emp);
  });

  /* ---------------------------------------------------------
     Save draft / submit
  --------------------------------------------------------- */
  document.getElementById("saveDraftBtn").addEventListener("click", () => {
    const emp = employees.find((e) => e.id === activeId);
    if (!emp) return;
    emp.comments = evalComments.value.trim();
    if (emp.status !== "completed") emp.status = "draft";
    renderTeamList();
    renderScoreForm();
    showToast(`Draft saved for ${emp.name}`);
  });

  document.getElementById("submitEvalBtn").addEventListener("click", () => {
    const emp = employees.find((e) => e.id === activeId);
    if (!emp) return;

    const comments = evalComments.value.trim();
    if (comments.length < 5) {
      errorComments.textContent = "Add a short comment before submitting this evaluation";
      evalComments.classList.add("is-invalid");
      evalComments.focus();
      return;
    }
    errorComments.textContent = "";
    evalComments.classList.remove("is-invalid");

    emp.comments = comments;
    emp.status = "completed";
    renderTeamList();
    renderScoreForm();
    showToast(`Evaluation submitted for ${emp.name} \u2014 ${fmt(grandTotal(emp))}/25`);
  });

  /* ---------------------------------------------------------
     Cycle selector (only the current cycle is editable here)
  --------------------------------------------------------- */
  const cycleSelect = document.getElementById("cycleSelect");
  cycleSelect.addEventListener("change", () => {
    if (cycleSelect.value !== "Q1 2026") {
      showToast("Past cycles are read-only in this prototype");
      cycleSelect.value = "Q1 2026";
    }
  });

  /* ---------------------------------------------------------
     Initial render
  --------------------------------------------------------- */
  renderTeamList();
  selectEmployee(employees[0].id);

});
