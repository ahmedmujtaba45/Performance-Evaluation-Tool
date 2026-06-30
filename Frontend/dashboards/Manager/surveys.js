/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — Manager Dashboard (Surveys & Feedback)              ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS (Future):                                 ║
  ║  • Controller: SurveysController (TBD)                         ║
  ║    Planned Endpoints:                                          ║
  ║      GET /api/surveys                                          ║
  ║      GET /api/surveys/{id}                                     ║
  ║      POST /api/surveys/{id}/responses                          ║
  ║      PUT /api/surveys/{id}/responses/{responseId}             ║
  ║                                                                ║
  ║  • Controller: EmployeesController                             ║
  ║    Path: Backend/controllers/EmployeesController.cs            ║
  ║    Endpoints: GET /api/employees/department/{department}      ║
  ║                                                                ║
  ║  • DTO Models (TBD):                                            ║
  ║    - SurveyResponseDto                                         ║
  ║    - CreateSurveyResponseDto                                   ║
  ╚════════════════════════════════════════════════════════════════╝
*/

/* =========================================================
   EvaluAI — Surveys & Feedback
   Page-specific behaviour: employee picker, Manager Feedback
   form (E7-US1-UI15 per spec), character counter, validation,
   star-rating Pulse Survey, and all submit/edit flows.
   Shell behaviour (sidebar, dropdowns, toasts) in shared.js.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  EvaluAIShell.init();
  initSurveysPage();
});

/* ---------------------------------------------------------
   Source data
   Mirrors the three team members used across every other
   module so the page feels connected to the same data set.
--------------------------------------------------------- */
const TEAM_MEMBERS = [
  {
    id: "emily-chen",
    name: "Emily Chen",
    title: "Senior Developer",
    department: "Engineering",
    feedback: {
      submitted: true,
      text: "Emily consistently shows strong initiative in code reviews this quarter. Her attention to quality has helped the entire team maintain high standards. I would encourage her to take on more mentoring responsibilities next quarter — she has great potential to develop junior developers.",
      submittedAt: "Jan 18, 2026",
    },
    survey: {
      submitted: true,
      submittedAt: "Jan 20, 2026",
      responses: {
        "team-collab": 4,
        "goal-clarity": 4,
        "manager-support": 5,
        "work-life-balance": 3,
        "career-growth": 4,
      },
    },
  },
  {
    id: "michael-park",
    name: "Michael Park",
    title: "Software Engineer",
    department: "Engineering",
    feedback: {
      submitted: true,
      text: "Michael has shown great improvement in project delivery this quarter. His collaborative approach with the DevOps team on the platform work was particularly valuable. For Q2, I would like to see him step up on technical documentation and knowledge-sharing within the team.",
      submittedAt: "Jan 19, 2026",
    },
    survey: {
      submitted: false,
      submittedAt: null,
      responses: { "team-collab": 0, "goal-clarity": 0, "manager-support": 0, "work-life-balance": 0, "career-growth": 0 },
    },
  },
  {
    id: "david-kim",
    name: "David Kim",
    title: "DevOps Engineer",
    department: "Engineering",
    feedback: {
      submitted: false,
      text: "",
      submittedAt: null,
    },
    survey: {
      submitted: false,
      submittedAt: null,
      responses: { "team-collab": 0, "goal-clarity": 0, "manager-support": 0, "work-life-balance": 0, "career-growth": 0 },
    },
  },
];

const SURVEY_QUESTIONS = [
  {
    id: "team-collab",
    label: "Team Collaboration Quality",
    description: "How effectively did your team collaborate and support each other this quarter?",
  },
  {
    id: "goal-clarity",
    label: "Goal Clarity",
    description: "How clearly were performance goals and expectations communicated to your team?",
  },
  {
    id: "manager-support",
    label: "Manager Support",
    description: "How well did team members feel supported in their professional development?",
  },
  {
    id: "work-life-balance",
    label: "Work-Life Balance",
    description: "How well was a healthy work-life balance maintained within the team?",
  },
  {
    id: "career-growth",
    label: "Career Growth Opportunities",
    description: "How satisfied is your team with the professional growth opportunities available?",
  },
];

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

/* ---------------------------------------------------------
   Module state
--------------------------------------------------------- */
let selectedEmployeeId = TEAM_MEMBERS[0].id;

/* ---------------------------------------------------------
   Page init
--------------------------------------------------------- */
function initSurveysPage() {
  renderEmployeeList();
  selectEmployee(selectedEmployeeId);
  initTabSwitching();
  initFeedbackFormEvents();
  initSurveyFormEvents();
}

function getMember(id) {
  return TEAM_MEMBERS.find((m) => m.id === id);
}

function getInitials(name) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

/* ---------------------------------------------------------
   Employee picker
--------------------------------------------------------- */
function renderEmployeeList() {
  const list = document.getElementById("surveyEmployeeList");
  list.innerHTML = TEAM_MEMBERS.map((m) => buildPickerRow(m)).join("");

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-employee-id]");
    if (btn) selectEmployee(btn.getAttribute("data-employee-id"));
  });
}

function buildPickerRow(m) {
  const fbDone = m.feedback.submitted;
  const svDone = m.survey.submitted;
  return `
    <li>
      <button class="survey-emp-row" type="button" data-employee-id="${m.id}">
        <span class="avatar">${getInitials(m.name)}</span>
        <span class="survey-emp-text">
          <strong>${m.name}</strong>
          <span>${m.title}</span>
        </span>
        <span class="survey-emp-badges">
          <span class="survey-badge ${fbDone ? "survey-badge--done" : "survey-badge--pending"}">
            <span class="dot"></span>${fbDone ? "Feedback" : "Feedback"}
          </span>
          <span class="survey-badge ${svDone ? "survey-badge--done" : "survey-badge--pending"}">
            <span class="dot"></span>${svDone ? "Survey" : "Survey"}
          </span>
        </span>
      </button>
    </li>
  `;
}

function refreshPickerRow(memberId) {
  const member = getMember(memberId);
  const li = document.querySelector(`[data-employee-id="${memberId}"]`)?.closest("li");
  if (!li) return;
  li.outerHTML = buildPickerRow(member);

  // Re-attach the click listener for the newly injected element
  document.querySelector(`[data-employee-id="${memberId}"]`).addEventListener("click", () => selectEmployee(memberId));
  updatePickerSelection();
}

function updatePickerSelection() {
  document.querySelectorAll(".survey-emp-row").forEach((btn) => {
    btn.classList.toggle("is-selected", btn.getAttribute("data-employee-id") === selectedEmployeeId);
  });
}

/* ---------------------------------------------------------
   Select an employee — re-renders header + both tabs
--------------------------------------------------------- */
function selectEmployee(id) {
  selectedEmployeeId = id;
  updatePickerSelection();
  const member = getMember(id);
  renderEmpHeader(member);
  renderFeedbackTab(member);
  renderSurveyTab(member);
}

function renderEmpHeader(m) {
  document.getElementById("survEmpAvatar").textContent = getInitials(m.name);
  document.getElementById("survEmpName").textContent = m.name;
  document.getElementById("survEmpTitle").textContent = `${m.title} · ${m.department}`;

  const pill = document.getElementById("survEmpPill");
  const both = m.feedback.submitted && m.survey.submitted;
  const none = !m.feedback.submitted && !m.survey.submitted;
  if (both) { pill.textContent = "All Submitted"; pill.className = "pill pill-green"; }
  else if (none) { pill.textContent = "Pending"; pill.className = "pill pill-amber"; }
  else { pill.textContent = "Partially Submitted"; pill.className = "pill pill-blue"; }
}

/* ---------------------------------------------------------
   Manager Feedback tab
--------------------------------------------------------- */
function renderFeedbackTab(m) {
  const submittedView = document.getElementById("feedbackSubmittedView");
  const formView = document.getElementById("feedbackFormView");

  if (m.feedback.submitted) {
    document.getElementById("fbSubmittedDate").textContent = `Submitted ${m.feedback.submittedAt}`;
    document.getElementById("fbSubmittedText").textContent = m.feedback.text;
    submittedView.hidden = false;
    formView.hidden = true;
  } else {
    submittedView.hidden = true;
    formView.hidden = false;
    resetFeedbackForm(m);
  }
}

function resetFeedbackForm(m) {
  const textarea = document.getElementById("fbTextarea");
  const submitBtn = document.getElementById("submitFeedbackBtn");
  textarea.value = m.feedback.text || "";           // pre-fill if editing
  document.getElementById("fbError").hidden = true;
  document.getElementById("fbSubtitle").textContent =
    `Provide constructive feedback to help ${m.name} improve their performance. This will be visible on their dashboard.`;
  textarea.setAttribute("placeholder", `Share specific observations, praise, or guidance for ${m.name}...`);
  updateCharCounter(textarea.value.length);
  submitBtn.disabled = textarea.value.trim().length === 0;
}

/* ---------- Feedback form events ---------- */
function initFeedbackFormEvents() {
  const textarea = document.getElementById("fbTextarea");
  const submitBtn = document.getElementById("submitFeedbackBtn");

  // Live character counter + enable/disable button
  textarea.addEventListener("input", () => {
    const len = textarea.value.length;
    updateCharCounter(len);
    submitBtn.disabled = textarea.value.trim().length === 0;
    if (textarea.value.trim().length > 0) {
      document.getElementById("fbError").hidden = true;
    }
  });

  // Submit
  submitBtn.addEventListener("click", () => {
    const text = textarea.value.trim();
    if (!text) {
      document.getElementById("fbError").hidden = false;
      textarea.focus();
      return;
    }
    const member = getMember(selectedEmployeeId);
    member.feedback.text = text;
    member.feedback.submitted = true;
    member.feedback.submittedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    renderFeedbackTab(member);
    renderEmpHeader(member);
    refreshPickerRow(selectedEmployeeId);
    EvaluAIShell.showToast(`Feedback submitted for ${member.name}`, "success");
  });

  // Edit button (inside submitted view)
  document.getElementById("editFeedbackBtn").addEventListener("click", () => {
    const member = getMember(selectedEmployeeId);
    const submittedView = document.getElementById("feedbackSubmittedView");
    const formView = document.getElementById("feedbackFormView");
    submittedView.hidden = true;
    formView.hidden = false;
    resetFeedbackForm(member);
  });
}

function updateCharCounter(len) {
  const el = document.getElementById("charCounter");
  el.textContent = `${len} / 1000`;
  el.className = len >= 950 ? "char-counter char-counter--limit"
                : len >= 800 ? "char-counter char-counter--warn"
                : "char-counter";
}

/* ---------------------------------------------------------
   Pulse Survey tab
--------------------------------------------------------- */
function renderSurveyTab(m) {
  const submittedView = document.getElementById("surveySubmittedView");
  const formView = document.getElementById("surveyFormView");

  if (m.survey.submitted) {
    document.getElementById("surveySubmittedDate").textContent = `Submitted ${m.survey.submittedAt}`;
    renderSurveyDoneGrid(m);
    submittedView.hidden = false;
    formView.hidden = true;
  } else {
    submittedView.hidden = true;
    formView.hidden = false;
    renderSurveyQuestions(m);
  }
}

function renderSurveyQuestions(m) {
  const container = document.getElementById("surveyQuestions");
  container.innerHTML = SURVEY_QUESTIONS.map((q) => {
    const saved = m.survey.responses[q.id] || 0;
    return `
      <div class="survey-question" data-question-id="${q.id}">
        <p class="survey-question-label">${q.label}</p>
        <p class="survey-question-desc">${q.description}</p>
        <div class="star-row" role="radiogroup" aria-label="${q.label} rating">
          ${[1, 2, 3, 4, 5].map((n) => `
            <button class="star-btn ${n <= saved ? "is-filled" : ""}"
              type="button" data-value="${n}"
              role="radio" aria-checked="${n <= saved}"
              aria-label="${STAR_LABELS[n]}">
              ${starSvg(n <= saved)}
            </button>
          `).join("")}
        </div>
        <div class="star-scale-labels"><span>1 — Poor</span><span>5 — Excellent</span></div>
      </div>
    `;
  }).join("");

  // Star interaction
  container.querySelectorAll(".survey-question").forEach((qEl) => {
    const stars = qEl.querySelectorAll(".star-btn");
    stars.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.getAttribute("data-value"), 10);
        const qId = qEl.getAttribute("data-question-id");
        m.survey.responses[qId] = val;
        stars.forEach((s, i) => {
          const filled = i < val;
          s.classList.toggle("is-filled", filled);
          s.setAttribute("aria-checked", String(i + 1 <= val));
          s.innerHTML = starSvg(filled);
        });
        // Hide error once at least one question is rated
        if (allQuestionsRated(m)) document.getElementById("surveyError").hidden = true;
      });
    });
  });
}

function renderSurveyDoneGrid(m) {
  const grid = document.getElementById("surveyDoneGrid");
  grid.innerHTML = SURVEY_QUESTIONS.map((q) => {
    const rating = m.survey.responses[q.id] || 0;
    const starsHtml = [1, 2, 3, 4, 5].map((n) =>
      `<svg class="${n <= rating ? "star-filled" : "star-empty"}" viewBox="0 0 24 24" fill="${n <= rating ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    ).join("");
    return `
      <div class="survey-done-item">
        <span class="survey-done-label">${q.label}</span>
        <span class="survey-done-stars">${starsHtml}</span>
      </div>
    `;
  }).join("");
}

function allQuestionsRated(m) {
  return SURVEY_QUESTIONS.every((q) => (m.survey.responses[q.id] || 0) > 0);
}

/* ---------- Survey form events ---------- */
function initSurveyFormEvents() {
  document.getElementById("submitSurveyBtn").addEventListener("click", () => {
    const member = getMember(selectedEmployeeId);
    if (!allQuestionsRated(member)) {
      document.getElementById("surveyError").hidden = false;
      return;
    }
    document.getElementById("surveyError").hidden = true;
    member.survey.submitted = true;
    member.survey.submittedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    renderSurveyTab(member);
    renderEmpHeader(member);
    refreshPickerRow(selectedEmployeeId);
    EvaluAIShell.showToast(`Pulse survey submitted for ${member.name}`, "success");
  });
}

/* ---------------------------------------------------------
   Tabs
--------------------------------------------------------- */
function initTabSwitching() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
  });
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const active = btn.getAttribute("data-tab") === tabName;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.hidden = panel.id !== `tabPanel${capitalize(tabName)}`;
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------------------------------------------------------
   SVG helpers
--------------------------------------------------------- */
function starSvg(filled) {
  return `<svg viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
}
