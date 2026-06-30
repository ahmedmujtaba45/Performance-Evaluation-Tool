/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — HR Dashboard (Employee Management)                  ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: EmployeesController                             ║
  ║    Path: Backend/controllers/EmployeesController.cs            ║
  ║    Endpoints: GET /api/employees                               ║
  ║                GET /api/employees/{id}                         ║
  ║                GET /api/employees/department/{department}      ║
  ║                POST /api/employees                             ║
  ║                PUT /api/employees/{id}                         ║
  ║                DELETE /api/employees/{id}                      ║
  ║                                                                ║
  ║  • Controller: UsersController                                 ║
  ║    Path: Backend/controllers/UsersController.cs                ║
  ║    Endpoints: GET /api/users                                   ║
  ║                POST /api/users                                 ║
  ║                                                                ║
  ║  • Service: IEmployeeService                                   ║
  ║    Path: Backend/services/IEmployeeService.cs                  ║
  ║    Implementation: Backend/services/EmployeeService.cs         ║
  ║                                                                ║
  ║  • Service: IUserService                                       ║
  ║    Path: Backend/services/IUserService.cs                      ║
  ║    Implementation: Backend/services/UserService.cs             ║
  ║                                                                ║
  ║  • DTOs:                                                        ║
  ║    - EmployeeDetailDto: Backend/dtos/employee/EmployeeDetailDto.cs
  ║    - CreateEmployeeDto: Backend/dtos/employee/CreateEmployeeDto.cs
  ║    - UpdateEmployeeDto: Backend/dtos/employee/UpdateEmployeeDto.cs
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ===========================================================
   EvaluAI — HR Dashboard (Manage Employees module)
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
     This page IS the Manage Employees module. Overview links to
     its real page; everything else is not built yet.
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
    "scoring": "scoring.html",
    "reports": "reports.html",
    "announcements": "announcements.html",
    "surveys": "surveys.html",
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const moduleKey = item.dataset.module;

      if (moduleKey === "manage-employees") {
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
    notifBadge.style.display = unread > 0 ? "flex" : "none";
    if (unread > 0) notifBadge.textContent = unread;
  }

  markAllReadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notifications.forEach((n) => (n.read = true));
    renderNotifications();
  });

  renderNotifications();

  /* ---------------------------------------------------------
     Employee data
     In-memory only for this prototype — wiring this up to the
     real Employee Management API happens during implementation.
  --------------------------------------------------------- */
  let employees = [
    { id: 1, name: "David Kim", email: "david.kim@company.com", age: 31, role: "Employee", department: "Engineering", jobTitle: "DevOps Engineer", score: 23.53 },
    { id: 2, name: "Emily Chen", email: "emily.chen@company.com", age: 28, role: "Employee", department: "Engineering", jobTitle: "Senior Developer", score: 20.8 },
    { id: 3, name: "Michael Park", email: "michael.park@company.com", age: 26, role: "Employee", department: "Engineering", jobTitle: "Software Engineer", score: 21.0 },
    { id: 4, name: "Fahad Siddique", email: "fahad.siddique@company.com", age: 25, role: "Employee", department: "Marketing", jobTitle: "Digital Marketing Executive", score: 19.6 },
    { id: 5, name: "Shahmeer", email: "shahmeer@company.com", age: 27, role: "Employee", department: "Finance", jobTitle: "Accounts Officer", score: null },
  ];
  let nextId = 6;

  const avatarPalettes = {
    Engineering: "linear-gradient(135deg,#3b6df0,#36c6c0)",
    Marketing: "linear-gradient(135deg,#7c5cff,#c95cff)",
    Finance: "linear-gradient(135deg,#f0962b,#f0c12b)",
  };

  function initials(name) {
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /* ---------------------------------------------------------
     Filter / search / sort state
  --------------------------------------------------------- */
  const searchInput = document.getElementById("searchInput");
  const deptFilter = document.getElementById("deptFilter");
  const roleFilter = document.getElementById("roleFilter");
  const resultCount = document.getElementById("resultCount");
  const tableBody = document.getElementById("tableBody");
  const emptyState = document.getElementById("emptyState");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const sortScoreHead = document.getElementById("sortScore");

  let sortState = { key: null, dir: 1 };

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    const dept = deptFilter.value;
    const role = roleFilter.value;

    let rows = employees.filter((e) => {
      const matchesQuery = !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q);
      const matchesDept = dept === "all" || e.department === dept;
      const matchesRole = role === "all" || e.role === role;
      return matchesQuery && matchesDept && matchesRole;
    });

    if (sortState.key === "score") {
      rows = rows.slice().sort((a, b) => {
        const av = a.score ?? -1;
        const bv = b.score ?? -1;
        return (av - bv) * sortState.dir;
      });
    }

    return rows;
  }

  function renderTable() {
    const rows = getFiltered();

    resultCount.textContent = `Showing ${rows.length} of ${employees.length} employee${employees.length === 1 ? "" : "s"}`;

    if (rows.length === 0) {
      tableBody.innerHTML = "";
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    tableBody.innerHTML = rows.map((e) => `
      <div class="emp-row" role="row" data-id="${e.id}">
        <div class="emp-cell cell-employee" role="cell">
          <span class="emp-avatar" style="background:${avatarPalettes[e.department] || "var(--navy)"}">${initials(e.name)}</span>
          <span class="emp-name-wrap">
            <div class="emp-name">${escapeHtml(e.name)}</div>
            <div class="emp-email">${escapeHtml(e.email)}</div>
          </span>
        </div>
        <div class="emp-cell cell-dept" role="cell" data-label="Department">
          <span class="badge-pill badge--${e.department}">${e.department}</span>
        </div>
        <div class="emp-cell cell-title" role="cell" data-label="Job Title">${escapeHtml(e.jobTitle)}</div>
        <div class="emp-cell cell-role" role="cell" data-label="Role">
          <span class="badge-pill badge--${e.role}">${e.role}</span>
        </div>
        <div class="emp-cell cell-score" role="cell" data-label="Score">
          ${e.score != null
            ? `<span class="score-text">${e.score}</span><span class="score-of">/25</span>`
            : `<span class="score-empty">Not yet scored</span>`}
        </div>
        <div class="emp-cell cell-actions" role="cell">
          <button class="action-btn action-btn--edit" data-action="edit" data-id="${e.id}" aria-label="Edit ${escapeHtml(e.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn action-btn--delete" data-action="delete" data-id="${e.id}" aria-label="Remove ${escapeHtml(e.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `).join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  searchInput.addEventListener("input", renderTable);
  deptFilter.addEventListener("change", renderTable);
  roleFilter.addEventListener("change", renderTable);

  clearFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    deptFilter.value = "all";
    roleFilter.value = "all";
    renderTable();
  });

  sortScoreHead.addEventListener("click", () => {
    if (sortState.key === "score") {
      sortState.dir *= -1;
    } else {
      sortState = { key: "score", dir: -1 };
    }
    const icon = sortScoreHead.querySelector(".sort-icon");
    icon.classList.remove("is-inactive");
    icon.classList.toggle("is-desc", sortState.dir === -1);
    renderTable();
  });

  /* ---------------------------------------------------------
     Add / Edit modal
  --------------------------------------------------------- */
  const employeeModalBackdrop = document.getElementById("employeeModalBackdrop");
  const employeeModalTitle = document.getElementById("employeeModalTitle");
  const employeeForm = document.getElementById("employeeForm");
  const employeeSubmitBtn = document.getElementById("employeeSubmitBtn");
  const employeeModalClose = document.getElementById("employeeModalClose");
  const employeeCancelBtn = document.getElementById("employeeCancelBtn");
  const addEmployeeBtn = document.getElementById("addEmployeeBtn");

  const fieldName = document.getElementById("fieldName");
  const fieldEmail = document.getElementById("fieldEmail");
  const fieldAge = document.getElementById("fieldAge");
  const fieldRole = document.getElementById("fieldRole");
  const fieldDept = document.getElementById("fieldDept");
  const fieldTitle = document.getElementById("fieldTitle");

  let editingId = null;

  function openEmployeeModal(mode, employee) {
    editingId = employee ? employee.id : null;
    employeeModalTitle.textContent = mode === "edit" ? "Edit Employee" : "Add New Employee";
    employeeSubmitBtn.textContent = mode === "edit" ? "Save Changes" : "Add Employee";

    fieldName.value = employee?.name || "";
    fieldEmail.value = employee?.email || "";
    fieldAge.value = employee?.age || 30;
    fieldRole.value = employee?.role || "Employee";
    fieldDept.value = employee?.department || "Engineering";
    fieldTitle.value = employee?.jobTitle || "";

    clearErrors();
    employeeModalBackdrop.classList.add("is-open");
    setTimeout(() => fieldName.focus(), 50);
  }

  function closeEmployeeModal() {
    employeeModalBackdrop.classList.remove("is-open");
    editingId = null;
  }

  function clearErrors() {
    ["Name", "Email", "Age", "Title"].forEach((key) => {
      document.getElementById(`error${key}`).textContent = "";
      document.getElementById(`field${key}`).classList.remove("is-invalid");
    });
  }

  function setError(key, message) {
    document.getElementById(`error${key}`).textContent = message;
    document.getElementById(`field${key}`).classList.add("is-invalid");
  }

  addEmployeeBtn.addEventListener("click", () => openEmployeeModal("add"));
  employeeModalClose.addEventListener("click", closeEmployeeModal);
  employeeCancelBtn.addEventListener("click", closeEmployeeModal);
  employeeModalBackdrop.addEventListener("click", (e) => {
    if (e.target === employeeModalBackdrop) closeEmployeeModal();
  });

  employeeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const name = fieldName.value.trim();
    const email = fieldEmail.value.trim();
    const age = parseInt(fieldAge.value, 10);
    const jobTitle = fieldTitle.value.trim();
    let hasError = false;

    if (name.length < 2) { setError("Name", "Enter the employee's full name"); hasError = true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Email", "Enter a valid email address"); hasError = true; }
    if (!age || age < 18 || age > 70) { setError("Age", "Age must be between 18 and 70"); hasError = true; }
    if (jobTitle.length < 2) { setError("Title", "Enter a job title"); hasError = true; }

    if (hasError) return;

    if (editingId) {
      const emp = employees.find((e) => e.id === editingId);
      Object.assign(emp, { name, email, age, role: fieldRole.value, department: fieldDept.value, jobTitle });
      showToast(`${name}'s record was updated`);
    } else {
      employees.push({
        id: nextId++,
        name, email, age,
        role: fieldRole.value,
        department: fieldDept.value,
        jobTitle,
        score: null,
      });
      showToast(`${name} was added to the team`);
    }

    closeEmployeeModal();
    renderTable();
  });

  /* ---------------------------------------------------------
     Delete confirm modal
  --------------------------------------------------------- */
  const deleteModalBackdrop = document.getElementById("deleteModalBackdrop");
  const deleteModalText = document.getElementById("deleteModalText");
  const deleteModalClose = document.getElementById("deleteModalClose");
  const deleteCancelBtn = document.getElementById("deleteCancelBtn");
  const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");

  let pendingDeleteId = null;

  function openDeleteModal(employee) {
    pendingDeleteId = employee.id;
    deleteModalText.textContent = `This will permanently remove ${employee.name} from your employee records. This action cannot be undone.`;
    deleteModalBackdrop.classList.add("is-open");
  }

  function closeDeleteModal() {
    deleteModalBackdrop.classList.remove("is-open");
    pendingDeleteId = null;
  }

  deleteModalClose.addEventListener("click", closeDeleteModal);
  deleteCancelBtn.addEventListener("click", closeDeleteModal);
  deleteModalBackdrop.addEventListener("click", (e) => {
    if (e.target === deleteModalBackdrop) closeDeleteModal();
  });

  deleteConfirmBtn.addEventListener("click", () => {
    const emp = employees.find((e) => e.id === pendingDeleteId);
    employees = employees.filter((e) => e.id !== pendingDeleteId);
    closeDeleteModal();
    renderTable();
    if (emp) showToast(`${emp.name} was removed`);
  });

  /* ---------------------------------------------------------
     Row action delegation (edit / delete buttons)
  --------------------------------------------------------- */
  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    const employee = employees.find((emp) => emp.id === id);
    if (!employee) return;

    if (btn.dataset.action === "edit") openEmployeeModal("edit", employee);
    if (btn.dataset.action === "delete") openDeleteModal(employee);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeEmployeeModal();
    closeDeleteModal();
  });

  /* ---------------------------------------------------------
     Initial render
  --------------------------------------------------------- */
  renderTable();

});
