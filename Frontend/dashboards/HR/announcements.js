/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — HR Dashboard (Announcements)                       ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS (Future):                                 ║
  ║  • Controller: AnnouncementsController (TBD)                   ║
  ║    Planned Endpoints:                                          ║
  ║      GET /api/announcements                                    ║
  ║      GET /api/announcements/{id}                               ║
  ║      POST /api/announcements                                   ║
  ║      PUT /api/announcements/{id}                               ║
  ║      DELETE /api/announcements/{id}                            ║
  ║                                                                ║
  ║  • DTO Models (TBD):                                            ║
  ║    - AnnouncementDto                                           ║
  ║    - CreateAnnouncementDto                                     ║
  ║    - UpdateAnnouncementDto                                     ║
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ===========================================================
   EvaluAI — HR Dashboard (Announcements module)
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
    "surveys": "surveys.html",
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const moduleKey = item.dataset.module;
      if (moduleKey === "announcements") { closeSidebar(); return; }
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
    div.textContent = str;
    return div.innerHTML;
  }
  function slug(category) {
    return category.toLowerCase().replace(/\s+/g, "-");
  }
  const TOTAL_EMPLOYEES = 5;
  const DEPT_HEADCOUNT = { Engineering: 3, Marketing: 1, Finance: 1 };

  function audienceSize(audience) {
    return audience === "All Employees" ? TOTAL_EMPLOYEES : (DEPT_HEADCOUNT[audience] || 0);
  }

  /* ---------------------------------------------------------
     Announcement data (in-memory)
  --------------------------------------------------------- */
  let announcements = [
    {
      id: 1,
      title: "Q1 2026 Performance Evaluations Now Open",
      category: "Evaluation Cycle",
      audience: "All Employees",
      body: "The Q1 2026 evaluation cycle is now live in EvaluAI. Managers should complete KPI scoring under the Scoring tab by the end of the month, and HR will follow up with the professional conduct score shortly after. Reach out with any questions about the rubric for your department.",
      author: "James Rodriguez",
      postedOn: "2026-01-05",
      pinned: true,
      viewed: 5,
    },
    {
      id: 2,
      title: "Congratulations to David Kim \u2014 Q1 Top Performer",
      category: "Recognition",
      audience: "All Employees",
      body: "Please join us in congratulating David Kim on an outstanding Q1 2026, finishing as our top scorer at 23.5/25. David's work on infrastructure reliability and uptime was called out specifically by the Engineering team \u2014 great work!",
      author: "James Rodriguez",
      postedOn: "2026-01-12",
      pinned: false,
      viewed: 5,
    },
    {
      id: 3,
      title: "Updated Attendance & Leave Policy",
      category: "Policy",
      audience: "All Employees",
      body: "Starting this quarter, leave requests should be submitted at least 3 working days in advance through HR. This also feeds directly into the Attendance & Punctuality component of your quarterly HR evaluation score, so please keep your requests up to date.",
      author: "James Rodriguez",
      postedOn: "2026-01-08",
      pinned: false,
      viewed: 4,
    },
    {
      id: 4,
      title: "Engineering Sprint Retrospective \u2014 New Process",
      category: "General",
      audience: "Engineering",
      body: "Starting next sprint, retrospectives move to the last Friday of each sprint at 4pm. The goal is to capture process feedback while it's fresh, ahead of quarterly KPI scoring on Team & Process Efficiency.",
      author: "James Rodriguez",
      postedOn: "2026-01-14",
      pinned: false,
      viewed: 2,
    },
    {
      id: 5,
      title: "Q1 Team Pulse Survey Closing Soon",
      category: "Event",
      audience: "All Employees",
      body: "There's still time to fill out the Q1 Team Pulse survey \u2014 it takes less than five minutes and helps HR understand how the quarter is going across departments. The survey closes this Friday.",
      author: "James Rodriguez",
      postedOn: "2026-01-16",
      pinned: false,
      viewed: 3,
    },
  ];
  let nextId = 6;

  /* ---------------------------------------------------------
     Filters
  --------------------------------------------------------- */
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const audienceFilter = document.getElementById("audienceFilter");
  const pinnedOnlyBtn = document.getElementById("pinnedOnlyBtn");
  const resultCount = document.getElementById("resultCount");
  const feed = document.getElementById("feed");
  const emptyState = document.getElementById("emptyState");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  let pinnedOnly = false;

  pinnedOnlyBtn.addEventListener("click", () => {
    pinnedOnly = !pinnedOnly;
    pinnedOnlyBtn.setAttribute("aria-pressed", String(pinnedOnly));
    renderFeed();
  });

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const audience = audienceFilter.value;

    return announcements
      .filter((a) => {
        const matchesQuery = !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
        const matchesCategory = category === "all" || a.category === category;
        const matchesAudience = audience === "all" || a.audience === audience;
        const matchesPinned = !pinnedOnly || a.pinned;
        return matchesQuery && matchesCategory && matchesAudience && matchesPinned;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.postedOn) - new Date(a.postedOn);
      });
  }

  function formatDate(d) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function renderFeed() {
    const rows = getFiltered();
    resultCount.textContent = `Showing ${rows.length} of ${announcements.length} announcement${announcements.length === 1 ? "" : "s"}`;

    if (rows.length === 0) {
      feed.innerHTML = "";
      emptyState.hidden = false;
      renderStats();
      return;
    }
    emptyState.hidden = true;

    feed.innerHTML = rows.map((a) => {
      const size = audienceSize(a.audience);
      const reachPct = size ? Math.round((a.viewed / size) * 100) : 0;
      return `
        <article class="announcement-card ${a.pinned ? "is-pinned" : ""}" data-id="${a.id}">
          <div class="announcement-head">
            <div class="announcement-badges">
              <span class="badge-pill badge--${slug(a.category)}">${escapeHtml(a.category)}</span>
              <span class="announcement-meta">To: <b>${escapeHtml(a.audience)}</b></span>
              ${a.pinned ? `<span class="pin-flag"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>Pinned</span>` : ""}
            </div>
            <div class="announcement-actions">
              <button class="action-btn action-btn--pin ${a.pinned ? "is-active" : ""}" data-action="pin" data-id="${a.id}" aria-label="${a.pinned ? "Unpin" : "Pin"} announcement" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
              </button>
              <button class="action-btn" data-action="edit" data-id="${a.id}" aria-label="Edit announcement" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-btn action-btn--delete" data-action="delete" data-id="${a.id}" aria-label="Delete announcement" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>

          <h3 class="announcement-title">${escapeHtml(a.title)}</h3>
          <p class="announcement-body">${escapeHtml(a.body)}</p>

          <div class="announcement-footer">
            <span class="announcement-meta"><b>${escapeHtml(a.author)}</b><span class="announcement-dot"></span>${formatDate(a.postedOn)}</span>
            <span class="announcement-reach">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ${a.viewed}/${size} viewed (${reachPct}%)
            </span>
          </div>
        </article>
      `;
    }).join("");

    renderStats();
  }

  function renderStats() {
    const total = announcements.length;
    const pinned = announcements.filter((a) => a.pinned).length;
    const thisQuarter = announcements.length; // all seeded + created announcements fall in Q1 2026 in this prototype
    const avgReach = total
      ? Math.round(announcements.reduce((sum, a) => sum + (a.viewed / audienceSize(a.audience)) * 100, 0) / total)
      : 0;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statPinned").textContent = pinned;
    document.getElementById("statQuarter").textContent = thisQuarter;
    document.getElementById("statReach").textContent = `${avgReach}%`;
  }

  searchInput.addEventListener("input", renderFeed);
  categoryFilter.addEventListener("change", renderFeed);
  audienceFilter.addEventListener("change", renderFeed);

  clearFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    audienceFilter.value = "all";
    pinnedOnly = false;
    pinnedOnlyBtn.setAttribute("aria-pressed", "false");
    renderFeed();
  });

  /* ---------------------------------------------------------
     Pin toggle (direct, no modal)
  --------------------------------------------------------- */
  feed.addEventListener("click", (e) => {
    const pinBtn = e.target.closest('[data-action="pin"]');
    const editBtn = e.target.closest('[data-action="edit"]');
    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (pinBtn) {
      const a = announcements.find((an) => an.id === parseInt(pinBtn.dataset.id, 10));
      if (!a) return;
      a.pinned = !a.pinned;
      renderFeed();
      showToast(a.pinned ? "Announcement pinned" : "Announcement unpinned");
      return;
    }
    if (editBtn) {
      const a = announcements.find((an) => an.id === parseInt(editBtn.dataset.id, 10));
      if (a) openAnnouncementModal("edit", a);
      return;
    }
    if (deleteBtn) {
      const a = announcements.find((an) => an.id === parseInt(deleteBtn.dataset.id, 10));
      if (a) openDeleteModal(a);
      return;
    }
  });

  /* ---------------------------------------------------------
     New / Edit modal
  --------------------------------------------------------- */
  const announcementModalBackdrop = document.getElementById("announcementModalBackdrop");
  const announcementModalTitle = document.getElementById("announcementModalTitle");
  const announcementForm = document.getElementById("announcementForm");
  const announcementSubmitBtn = document.getElementById("announcementSubmitBtn");
  const announcementModalClose = document.getElementById("announcementModalClose");
  const announcementCancelBtn = document.getElementById("announcementCancelBtn");
  const newAnnouncementBtn = document.getElementById("newAnnouncementBtn");

  const fieldTitle = document.getElementById("fieldTitle");
  const fieldCategory = document.getElementById("fieldCategory");
  const fieldAudience = document.getElementById("fieldAudience");
  const fieldBody = document.getElementById("fieldBody");
  const fieldPinned = document.getElementById("fieldPinned");
  const charCount = document.getElementById("charCount");

  let editingId = null;

  function openAnnouncementModal(mode, announcement) {
    editingId = announcement ? announcement.id : null;
    announcementModalTitle.textContent = mode === "edit" ? "Edit Announcement" : "New Announcement";
    announcementSubmitBtn.textContent = mode === "edit" ? "Save Changes" : "Publish Announcement";

    fieldTitle.value = announcement?.title || "";
    fieldCategory.value = announcement?.category || "General";
    fieldAudience.value = announcement?.audience || "All Employees";
    fieldBody.value = announcement?.body || "";
    fieldPinned.checked = announcement?.pinned || false;
    updateCharCount();
    clearErrors();

    announcementModalBackdrop.classList.add("is-open");
    setTimeout(() => fieldTitle.focus(), 50);
  }
  function closeAnnouncementModal() {
    announcementModalBackdrop.classList.remove("is-open");
    editingId = null;
  }
  function clearErrors() {
    document.getElementById("errorTitle").textContent = "";
    document.getElementById("errorBody").textContent = "";
    fieldTitle.classList.remove("is-invalid");
    fieldBody.classList.remove("is-invalid");
  }
  function updateCharCount() {
    charCount.textContent = `${fieldBody.value.length} / 500`;
  }

  newAnnouncementBtn.addEventListener("click", () => openAnnouncementModal("add"));
  announcementModalClose.addEventListener("click", closeAnnouncementModal);
  announcementCancelBtn.addEventListener("click", closeAnnouncementModal);
  announcementModalBackdrop.addEventListener("click", (e) => { if (e.target === announcementModalBackdrop) closeAnnouncementModal(); });
  fieldBody.addEventListener("input", updateCharCount);

  announcementForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const title = fieldTitle.value.trim();
    const body = fieldBody.value.trim();
    let hasError = false;

    if (title.length < 4) {
      document.getElementById("errorTitle").textContent = "Give the announcement a short, clear title";
      fieldTitle.classList.add("is-invalid");
      hasError = true;
    }
    if (body.length < 10) {
      document.getElementById("errorBody").textContent = "Write a short message so people know what changed";
      fieldBody.classList.add("is-invalid");
      hasError = true;
    }
    if (hasError) return;

    if (editingId) {
      const a = announcements.find((an) => an.id === editingId);
      Object.assign(a, { title, category: fieldCategory.value, audience: fieldAudience.value, body, pinned: fieldPinned.checked });
      showToast("Announcement updated");
    } else {
      announcements.unshift({
        id: nextId++, title, category: fieldCategory.value, audience: fieldAudience.value, body,
        author: "James Rodriguez", postedOn: new Date().toISOString().slice(0, 10),
        pinned: fieldPinned.checked, viewed: 0,
      });
      showToast("Announcement published");
    }

    closeAnnouncementModal();
    renderFeed();
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

  function openDeleteModal(a) {
    pendingDeleteId = a.id;
    deleteModalText.textContent = `This will permanently remove "${a.title}" from the feed. This action cannot be undone.`;
    deleteModalBackdrop.classList.add("is-open");
  }
  function closeDeleteModal() {
    deleteModalBackdrop.classList.remove("is-open");
    pendingDeleteId = null;
  }
  deleteModalClose.addEventListener("click", closeDeleteModal);
  deleteCancelBtn.addEventListener("click", closeDeleteModal);
  deleteModalBackdrop.addEventListener("click", (e) => { if (e.target === deleteModalBackdrop) closeDeleteModal(); });

  deleteConfirmBtn.addEventListener("click", () => {
    const a = announcements.find((an) => an.id === pendingDeleteId);
    announcements = announcements.filter((an) => an.id !== pendingDeleteId);
    closeDeleteModal();
    renderFeed();
    if (a) showToast(`"${a.title}" was deleted`);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeAnnouncementModal();
    closeDeleteModal();
  });

  /* ---------------------------------------------------------
     Initial render
  --------------------------------------------------------- */
  renderFeed();

});
