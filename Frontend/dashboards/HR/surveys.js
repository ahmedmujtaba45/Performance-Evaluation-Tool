/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — HR Dashboard (Surveys)                              ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS (Future):                                 ║
  ║  • Controller: SurveysController (TBD)                         ║
  ║    Planned Endpoints:                                          ║
  ║      GET /api/surveys                                          ║
  ║      GET /api/surveys/{id}                                     ║
  ║      POST /api/surveys                                         ║
  ║      PUT /api/surveys/{id}                                     ║
  ║      DELETE /api/surveys/{id}                                  ║
  ║      GET /api/surveys/{id}/responses                           ║
  ║      POST /api/surveys/{id}/responses                          ║
  ║                                                                ║
  ║  • DTO Models (TBD):                                            ║
  ║    - SurveyDto                                                 ║
  ║    - CreateSurveyDto                                           ║
  ║    - SurveyResponseDto                                         ║
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ===========================================================
   EvaluAI — HR Dashboard (Surveys module)
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
    "reports": "reports.html",
    "announcements": "announcements.html",
  };
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const moduleKey = item.dataset.module;
      if (moduleKey === "surveys") { closeSidebar(); return; }
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
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeAllPopovers(); closeAllModals(); } });

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
     Helpers
  --------------------------------------------------------- */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }
  function slug(status) { return status.replace(/\s+/g, "-"); }
  function formatDate(iso) {
    if (!iso) return null;
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  const audienceSize = { "All Employees": 5, "Engineering": 3, "Marketing": 1, "Finance": 1 };

  /* ---------------------------------------------------------
     Survey data (in-memory, Q1 2026 cycle)
  --------------------------------------------------------- */
  let surveys = [
    {
      id: 1, title: "Q1 Team Pulse",
      description: "A quick quarterly check-in on workload, recognition, and team health.",
      audience: "All Employees", status: "Active", dueDate: "2026-01-17", createdOn: "2026-01-03",
      responseCount: 3, totalPossible: 5,
      questions: [
        { id: "q1-1", text: "How satisfied are you with your current workload?", type: "rating", result: { average: 3.7 } },
        { id: "q1-2", text: "Do you feel recognized for your contributions?", type: "yesno", result: { yes: 2, no: 1 } },
        { id: "q1-3", text: "Which area needs the most improvement?", type: "mc",
          options: ["Communication", "Workload Balance", "Tools & Resources", "Recognition"],
          result: { counts: { "Communication": 1, "Workload Balance": 1, "Tools & Resources": 0, "Recognition": 1 } } },
        { id: "q1-4", text: "Any additional comments?", type: "text",
          result: { responses: ["Would love more cross-team visibility into what other departments are working on.", "Things have felt more balanced this quarter, thanks!"] } },
      ],
    },
    {
      id: 2, title: "Engineering Process Feedback",
      description: "Checking in on the new sprint retrospective format.",
      audience: "Engineering", status: "Active", dueDate: "2026-02-01", createdOn: "2026-01-10",
      responseCount: 2, totalPossible: 3,
      questions: [
        { id: "q2-1", text: "How effective is our new sprint retrospective process?", type: "rating", result: { average: 4.0 } },
        { id: "q2-2", text: "Should we continue the Friday retro time slot?", type: "yesno", result: { yes: 2, no: 0 } },
        { id: "q2-3", text: "What's one thing we should change?", type: "text", result: { responses: ["Maybe rotate who facilitates each week."] } },
      ],
    },
    {
      id: 3, title: "Annual Wellness & Benefits Survey",
      description: "Gathering input to shape this year's wellness and benefits offerings.",
      audience: "All Employees", status: "Active", dueDate: "2026-03-01", createdOn: "2025-12-15",
      responseCount: 2, totalPossible: 5,
      questions: [
        { id: "q3-1", text: "How would you rate your work-life balance?", type: "rating", result: { average: 3.5 } },
        { id: "q3-2", text: "Are you satisfied with current health benefits?", type: "yesno", result: { yes: 1, no: 1 } },
        { id: "q3-3", text: "Which wellness benefit would you value most?", type: "mc",
          options: ["Gym membership", "Mental health support", "Flexible hours", "Wellness stipend"],
          result: { counts: { "Gym membership": 0, "Mental health support": 1, "Flexible hours": 1, "Wellness stipend": 0 } } },
        { id: "q3-4", text: "Other suggestions?", type: "text", result: { responses: ["Would appreciate a quiet room for breaks."] } },
      ],
    },
    {
      id: 4, title: "Manager Effectiveness Survey",
      description: "Annual feedback on leadership and management across the org.",
      audience: "All Employees", status: "Pending Review", dueDate: "2026-01-10", createdOn: "2025-12-20",
      responseCount: 5, totalPossible: 5,
      questions: [
        { id: "q4-1", text: "My manager provides clear expectations.", type: "rating", result: { average: 4.4 } },
        { id: "q4-2", text: "I receive regular, constructive feedback.", type: "rating", result: { average: 4.0 } },
        { id: "q4-3", text: "Would you recommend your manager's leadership style to a peer?", type: "yesno", result: { yes: 4, no: 1 } },
        { id: "q4-4", text: "Which leadership quality matters most to you?", type: "mc",
          options: ["Communication", "Trust & autonomy", "Technical mentorship", "Recognition"],
          result: { counts: { "Communication": 2, "Trust & autonomy": 2, "Technical mentorship": 1, "Recognition": 0 } } },
        { id: "q4-5", text: "Anything you'd like leadership to know?", type: "text", result: { responses: ["Appreciate the open-door policy.", "Would love more 1:1 time."] } },
      ],
    },
    {
      id: 5, title: "New Hire Onboarding Experience",
      description: "A short pulse for anyone who joined in the last quarter.",
      audience: "All Employees", status: "Active", dueDate: "2026-02-15", createdOn: "2026-01-18",
      responseCount: 1, totalPossible: 5,
      questions: [
        { id: "q5-1", text: "How would you rate your onboarding experience overall?", type: "rating", result: { average: 5.0 } },
        { id: "q5-2", text: "Did you have the tools and access you needed on day one?", type: "yesno", result: { yes: 1, no: 0 } },
        { id: "q5-3", text: "What could improve the onboarding process?", type: "mc",
          options: ["More documentation", "Earlier tool access", "Clearer first week plan", "More 1:1 time"],
          result: { counts: { "More documentation": 0, "Earlier tool access": 1, "Clearer first week plan": 0, "More 1:1 time": 0 } } },
        { id: "q5-4", text: "Anything else to share?", type: "text", result: { responses: ["Everyone was really welcoming!"] } },
      ],
    },
    {
      id: 6, title: "Office Holiday Party Interest",
      description: "Helping us plan headcount and activities for the holiday party.",
      audience: "All Employees", status: "Closed", dueDate: "2025-12-20", createdOn: "2025-12-01",
      responseCount: 5, totalPossible: 5,
      questions: [
        { id: "q6-1", text: "Will you attend the holiday party?", type: "yesno", result: { yes: 5, no: 0 } },
        { id: "q6-2", text: "Preferred activity?", type: "mc",
          options: ["Dinner", "Games", "Karaoke", "Just hang out"],
          result: { counts: { "Dinner": 2, "Games": 1, "Karaoke": 1, "Just hang out": 1 } } },
      ],
    },
    {
      id: 7, title: "Q2 Career Development Interest",
      description: "Scoping interest in formal career development tracks for next quarter.",
      audience: "Engineering", status: "Draft", dueDate: null, createdOn: "2026-01-19",
      responseCount: 0, totalPossible: 3,
      questions: [
        { id: "q7-1", text: "How interested are you in formal career development planning this year?", type: "rating", result: { average: null } },
        { id: "q7-2", text: "Which growth area interests you most?", type: "mc",
          options: ["Technical certifications", "Leadership track", "Cross-team rotation", "Mentorship program"],
          result: { counts: {} } },
        { id: "q7-3", text: "What's one skill you'd like to develop?", type: "text", result: { responses: [] } },
      ],
    },
  ];
  let nextSurveyId = 8;

  /* ---------------------------------------------------------
     Stats
  --------------------------------------------------------- */
  function renderStats() {
    const live = surveys.filter((s) => s.status === "Active" || s.status === "Pending Review");
    const pending = surveys.filter((s) => s.status === "Pending Review");
    const avgRate = live.length
      ? Math.round(live.reduce((sum, s) => sum + (s.responseCount / s.totalPossible) * 100, 0) / live.length)
      : 0;
    const totalResponses = surveys.reduce((sum, s) => sum + s.responseCount, 0);

    document.getElementById("statActive").textContent = live.length;
    document.getElementById("statActiveSub").textContent = `${pending.length} pending review`;
    document.getElementById("statPending").textContent = pending.length;
    document.getElementById("statResponseRate").textContent = `${avgRate}%`;
    document.getElementById("statResponses").textContent = totalResponses;
  }

  /* ---------------------------------------------------------
     List rendering
  --------------------------------------------------------- */
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const audienceFilter = document.getElementById("audienceFilter");
  const resultCount = document.getElementById("resultCount");
  const surveyList = document.getElementById("surveyList");
  const emptyState = document.getElementById("emptyState");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    return surveys.filter((s) => {
      const matchesQuery = !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      const matchesStatus = statusFilter.value === "all" || s.status === statusFilter.value;
      const matchesAudience = audienceFilter.value === "all" || s.audience === audienceFilter.value;
      return matchesQuery && matchesStatus && matchesAudience;
    }).sort((a, b) => (b.createdOn || "").localeCompare(a.createdOn || ""));
  }

  function renderList() {
    renderStats();
    const rows = getFiltered();
    resultCount.textContent = `Showing ${rows.length} of ${surveys.length} survey${surveys.length === 1 ? "" : "s"}`;

    if (rows.length === 0) {
      surveyList.innerHTML = "";
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    surveyList.innerHTML = rows.map((s) => {
      const pct = s.totalPossible ? Math.round((s.responseCount / s.totalPossible) * 100) : 0;
      const dateLabel = s.status === "Active" || s.status === "Draft"
        ? (s.dueDate ? `Closes ${formatDate(s.dueDate)}` : "No due date set")
        : `Closed ${formatDate(s.dueDate)}`;

      const responseBlock = s.status === "Draft"
        ? `<p class="survey-card-desc" style="margin-bottom:14px;font-style:italic;">Draft \u2014 publish to start collecting responses.</p>`
        : `
          <div class="response-row">
            <span class="response-label">Responses</span>
            <div class="progress-track"><div class="progress-fill ${pct === 100 ? "progress-fill--complete" : ""}" style="width:${pct}%"></div></div>
            <span class="response-pct">${s.responseCount}/${s.totalPossible}</span>
          </div>`;

      const resultsBtn = s.status === "Draft"
        ? `<button class="action-btn" data-action="publish" data-id="${s.id}" type="button">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
             Publish
           </button>`
        : `<button class="action-btn" data-action="results" data-id="${s.id}" type="button">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/></svg>
             Results
           </button>`;

      const statusActionBtn = (() => {
        if (s.status === "Active") return `<button class="action-btn" data-action="close" data-id="${s.id}" type="button">Close Survey</button>`;
        if (s.status === "Pending Review") return `<button class="action-btn" data-action="review" data-id="${s.id}" type="button">Mark Reviewed</button>`;
        if (s.status === "Closed") return `<button class="action-btn" data-action="reopen" data-id="${s.id}" type="button">Reopen</button>`;
        return "";
      })();

      return `
        <article class="survey-card" data-id="${s.id}">
          <div class="survey-top">
            <div class="survey-top-left">
              <span class="status-chip status-chip--${slug(s.status)}">${s.status}</span>
              <span class="audience-tag">To: <strong>${escapeHtml(s.audience)}</strong></span>
            </div>
            <span class="survey-date">${dateLabel}</span>
          </div>

          <h4>${escapeHtml(s.title)}</h4>
          <p class="survey-card-desc">${escapeHtml(s.description)}</p>

          ${responseBlock}

          <div class="survey-bottom">
            <div class="survey-meta">
              <span class="survey-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                ${s.questions.length} question${s.questions.length === 1 ? "" : "s"}
              </span>
              <span class="survey-meta-item">Created ${formatDate(s.createdOn)}</span>
            </div>
            <div class="survey-actions">
              ${resultsBtn}
              ${statusActionBtn}
              <button class="action-icon-btn" data-action="edit" data-id="${s.id}" aria-label="Edit ${escapeHtml(s.title)}" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-icon-btn action-icon-btn--delete" data-action="delete" data-id="${s.id}" aria-label="Delete ${escapeHtml(s.title)}" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  searchInput.addEventListener("input", renderList);
  statusFilter.addEventListener("change", renderList);
  audienceFilter.addEventListener("change", renderList);
  clearFiltersBtn.addEventListener("click", () => {
    searchInput.value = ""; statusFilter.value = "all"; audienceFilter.value = "all";
    renderList();
  });

  /* ---------------------------------------------------------
     Row action delegation
  --------------------------------------------------------- */
  surveyList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    const survey = surveys.find((s) => s.id === id);
    if (!survey) return;

    const action = btn.dataset.action;
    if (action === "results") openResultsModal(survey);
    if (action === "edit") openSurveyModal("edit", survey);
    if (action === "delete") openDeleteModal(survey);
    if (action === "close") { survey.status = "Pending Review"; renderList(); showToast(`"${survey.title}" closed \u2014 awaiting your review`); }
    if (action === "review") { survey.status = "Closed"; renderList(); showToast(`"${survey.title}" marked reviewed`); }
    if (action === "reopen") { survey.status = "Active"; renderList(); showToast(`"${survey.title}" reopened`); }
    if (action === "publish") {
      if (!survey.dueDate) { openSurveyModal("edit", survey); showToast("Set a due date before publishing"); return; }
      survey.status = "Active";
      renderList();
      showToast(`"${survey.title}" published`);
    }
  });

  /* ---------------------------------------------------------
     Survey modal (create / edit)
  --------------------------------------------------------- */
  const surveyModalBackdrop = document.getElementById("surveyModalBackdrop");
  const surveyModalTitle = document.getElementById("surveyModalTitle");
  const surveyForm = document.getElementById("surveyForm");
  const fieldTitle = document.getElementById("fieldTitle");
  const fieldDescription = document.getElementById("fieldDescription");
  const fieldAudience = document.getElementById("fieldAudience");
  const fieldDueDate = document.getElementById("fieldDueDate");
  const questionList = document.getElementById("questionList");
  const errorTitle = document.getElementById("errorTitle");
  const errorDueDate = document.getElementById("errorDueDate");
  const errorQuestions = document.getElementById("errorQuestions");

  let editingId = null;

  const questionTypeLabel = { rating: "Rating (1\u20135)", yesno: "Yes / No", mc: "Multiple Choice", text: "Open Text" };

  function questionRowHtml(q) {
    const qid = q?.id || `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const text = q?.text || "";
    const type = q?.type || "rating";
    const options = q?.options ? q.options.join(", ") : "";
    return `
      <div class="question-row" data-qid="${qid}">
        <div class="question-row-top">
          <input type="text" class="q-text" placeholder="e.g., How satisfied are you with...?" value="${escapeHtml(text)}" />
          <select class="question-type-select q-type">
            ${Object.entries(questionTypeLabel).map(([val, label]) => `<option value="${val}" ${val === type ? "selected" : ""}>${label}</option>`).join("")}
          </select>
          <button type="button" class="question-remove-btn" aria-label="Remove question">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="question-options-row" ${type === "mc" ? "" : "hidden"}>
          <input type="text" class="q-options" placeholder="Option A, Option B, Option C" value="${escapeHtml(options)}" />
          <p class="question-options-hint">Comma-separated list of choices</p>
        </div>
      </div>
    `;
  }

  function addQuestionRow(q) {
    questionList.insertAdjacentHTML("beforeend", questionRowHtml(q));
  }

  document.getElementById("addQuestionBtn").addEventListener("click", () => addQuestionRow());

  questionList.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".question-remove-btn");
    if (removeBtn) { removeBtn.closest(".question-row").remove(); return; }
  });

  questionList.addEventListener("change", (e) => {
    if (!e.target.classList.contains("q-type")) return;
    const row = e.target.closest(".question-row");
    const optionsRow = row.querySelector(".question-options-row");
    optionsRow.hidden = e.target.value !== "mc";
  });

  function emptyResultFor(type) {
    if (type === "rating") return { average: null };
    if (type === "yesno") return { yes: 0, no: 0 };
    if (type === "mc") return { counts: {} };
    return { responses: [] };
  }

  function openSurveyModal(mode, survey) {
    editingId = survey ? survey.id : null;
    surveyModalTitle.textContent = mode === "edit" ? "Edit Survey" : "New Survey";

    fieldTitle.value = survey?.title || "";
    fieldDescription.value = survey?.description || "";
    fieldAudience.value = survey?.audience || "All Employees";
    fieldDueDate.value = survey?.dueDate || "";

    questionList.innerHTML = "";
    if (survey?.questions?.length) {
      survey.questions.forEach((q) => addQuestionRow(q));
    } else {
      addQuestionRow(); addQuestionRow();
    }

    clearErrors();
    surveyModalBackdrop.classList.add("is-open");
    setTimeout(() => fieldTitle.focus(), 50);
  }

  function closeSurveyModal() {
    surveyModalBackdrop.classList.remove("is-open");
    editingId = null;
  }

  function clearErrors() {
    errorTitle.textContent = ""; errorDueDate.textContent = ""; errorQuestions.textContent = "";
    fieldTitle.classList.remove("is-invalid"); fieldDueDate.classList.remove("is-invalid");
  }

  document.getElementById("surveyModalClose").addEventListener("click", closeSurveyModal);
  document.getElementById("surveyCancelBtn").addEventListener("click", closeSurveyModal);
  surveyModalBackdrop.addEventListener("click", (e) => { if (e.target === surveyModalBackdrop) closeSurveyModal(); });

  function collectQuestions() {
    const original = editingId ? surveys.find((s) => s.id === editingId) : null;
    const rows = [...questionList.querySelectorAll(".question-row")];
    return rows.map((row) => {
      const qid = row.dataset.qid;
      const text = row.querySelector(".q-text").value.trim();
      const type = row.querySelector(".q-type").value;
      const optionsRaw = row.querySelector(".q-options")?.value || "";
      const options = type === "mc" ? optionsRaw.split(",").map((o) => o.trim()).filter(Boolean) : undefined;

      const existing = original?.questions.find((q) => q.id === qid);
      const result = existing && existing.type === type ? existing.result : emptyResultFor(type);

      const question = { id: qid.startsWith("new-") ? `q${Date.now()}-${Math.floor(Math.random() * 1000)}` : qid, text, type, result };
      if (options) question.options = options;
      return question;
    }).filter((q) => q.text.length > 0);
  }

  function saveSurvey(targetStatus) {
    clearErrors();
    const title = fieldTitle.value.trim();
    const dueDate = fieldDueDate.value;
    let hasError = false;

    if (title.length < 3) { errorTitle.textContent = "Give the survey a short, clear title"; fieldTitle.classList.add("is-invalid"); hasError = true; }
    if (targetStatus === "Active" && !dueDate) { errorDueDate.textContent = "Set a closing date to publish this survey"; fieldDueDate.classList.add("is-invalid"); hasError = true; }

    const questions = collectQuestions();
    if (questions.length === 0) { errorQuestions.textContent = "Add at least one question"; hasError = true; }

    if (hasError) return;

    const audience = fieldAudience.value;

    if (editingId) {
      const survey = surveys.find((s) => s.id === editingId);
      survey.title = title;
      survey.description = fieldDescription.value.trim();
      survey.audience = audience;
      survey.dueDate = dueDate || null;
      survey.questions = questions;
      survey.totalPossible = audienceSize[audience] || survey.totalPossible;
      if (targetStatus === "Active" && survey.status === "Draft") survey.status = "Active";
      renderList();
      closeSurveyModal();
      showToast(`"${title}" updated`);
    } else {
      surveys.unshift({
        id: nextSurveyId++, title,
        description: fieldDescription.value.trim(),
        audience, status: targetStatus,
        dueDate: dueDate || null,
        createdOn: new Date().toISOString().slice(0, 10),
        responseCount: 0,
        totalPossible: audienceSize[audience] || 5,
        questions,
      });
      renderList();
      closeSurveyModal();
      showToast(targetStatus === "Active" ? `"${title}" published` : `"${title}" saved as draft`);
    }
  }

  surveyForm.addEventListener("submit", (e) => { e.preventDefault(); saveSurvey("Active"); });
  document.getElementById("surveyDraftBtn").addEventListener("click", () => saveSurvey("Draft"));

  document.getElementById("newSurveyBtn").addEventListener("click", () => openSurveyModal("new"));

  /* ---------------------------------------------------------
     Results modal
  --------------------------------------------------------- */
  const resultsModalBackdrop = document.getElementById("resultsModalBackdrop");
  const resultsModalTitle = document.getElementById("resultsModalTitle");
  const resultsModalSub = document.getElementById("resultsModalSub");
  const resultsBody = document.getElementById("resultsBody");

  function openResultsModal(survey) {
    resultsModalTitle.textContent = survey.title;
    resultsModalSub.textContent = `${survey.audience} \u00b7 ${survey.responseCount} of ${survey.totalPossible} responded \u00b7 ${survey.status}`;

    resultsBody.innerHTML = survey.questions.map((q) => {
      const head = `
        <div class="result-question-head">
          <p>${escapeHtml(q.text)}</p>
          <span class="result-type-tag">${questionTypeLabel[q.type]}</span>
        </div>`;

      if (survey.responseCount === 0) {
        return `<div class="result-question">${head}<p class="no-responses">No responses yet</p></div>`;
      }

      let body = "";
      if (q.type === "rating") {
        body = `<div class="rating-display"><strong>${q.result.average?.toFixed(1) ?? "\u2014"}</strong><span>/ 5 average (${survey.responseCount} response${survey.responseCount === 1 ? "" : "s"})</span></div>`;
      } else if (q.type === "yesno") {
        const total = q.result.yes + q.result.no || 1;
        body = `
          <div class="option-bar-row">
            <span class="option-bar-label">Yes</span>
            <div class="option-bar-track"><div class="option-bar-fill option-bar-fill--yes" style="width:${(q.result.yes / total) * 100}%"></div></div>
            <span class="option-bar-pct">${q.result.yes} (${Math.round((q.result.yes / total) * 100)}%)</span>
          </div>
          <div class="option-bar-row">
            <span class="option-bar-label">No</span>
            <div class="option-bar-track"><div class="option-bar-fill option-bar-fill--no" style="width:${(q.result.no / total) * 100}%"></div></div>
            <span class="option-bar-pct">${q.result.no} (${Math.round((q.result.no / total) * 100)}%)</span>
          </div>`;
      } else if (q.type === "mc") {
        const counts = q.result.counts || {};
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        body = (q.options || Object.keys(counts)).map((opt) => {
          const c = counts[opt] || 0;
          return `
            <div class="option-bar-row">
              <span class="option-bar-label">${escapeHtml(opt)}</span>
              <div class="option-bar-track"><div class="option-bar-fill" style="width:${(c / total) * 100}%"></div></div>
              <span class="option-bar-pct">${c} (${Math.round((c / total) * 100)}%)</span>
            </div>`;
        }).join("");
      } else {
        const responses = q.result.responses || [];
        body = responses.length
          ? `<div class="text-response-list">${responses.map((r) => `<div class="text-response-item">\u201c${escapeHtml(r)}\u201d</div>`).join("")}</div>`
          : `<p class="no-responses">No written responses yet</p>`;
      }

      return `<div class="result-question">${head}${body}</div>`;
    }).join("");

    resultsModalBackdrop.classList.add("is-open");
  }

  document.getElementById("resultsModalClose").addEventListener("click", () => resultsModalBackdrop.classList.remove("is-open"));
  resultsModalBackdrop.addEventListener("click", (e) => { if (e.target === resultsModalBackdrop) resultsModalBackdrop.classList.remove("is-open"); });

  /* ---------------------------------------------------------
     Delete confirm modal
  --------------------------------------------------------- */
  const deleteModalBackdrop = document.getElementById("deleteModalBackdrop");
  const deleteModalText = document.getElementById("deleteModalText");
  let pendingDeleteId = null;

  function openDeleteModal(survey) {
    pendingDeleteId = survey.id;
    deleteModalText.textContent = `This will permanently remove "${survey.title}" and its ${survey.responseCount} response${survey.responseCount === 1 ? "" : "s"}. This action cannot be undone.`;
    deleteModalBackdrop.classList.add("is-open");
  }
  function closeDeleteModal() { deleteModalBackdrop.classList.remove("is-open"); pendingDeleteId = null; }

  document.getElementById("deleteModalClose").addEventListener("click", closeDeleteModal);
  document.getElementById("deleteCancelBtn").addEventListener("click", closeDeleteModal);
  deleteModalBackdrop.addEventListener("click", (e) => { if (e.target === deleteModalBackdrop) closeDeleteModal(); });
  document.getElementById("deleteConfirmBtn").addEventListener("click", () => {
    const survey = surveys.find((s) => s.id === pendingDeleteId);
    surveys = surveys.filter((s) => s.id !== pendingDeleteId);
    closeDeleteModal();
    renderList();
    if (survey) showToast(`"${survey.title}" was deleted`);
  });

  function closeAllModals() {
    surveyModalBackdrop.classList.remove("is-open");
    resultsModalBackdrop.classList.remove("is-open");
    deleteModalBackdrop.classList.remove("is-open");
  }

  /* ---------------------------------------------------------
     Initial render
  --------------------------------------------------------- */
  renderList();

});
