/* =======================================================
   EvaluAI – Announcements Scripts
   File    : announcements.js
   Sections:
     1. Shared UI helpers  (dropdowns, notifications, nav)
     2. Announcement data store
     3. Category filter tabs
     4. Live search
     5. Slide-in detail panel  (open / close / populate)
     6. Mark as read  (single + all)
     7. Toast notification
     8. Unread counter badge (sidebar-style)
     9. Init
======================================================= */

/* -------------------------------------------------------
   1. SHARED UI HELPERS
------------------------------------------------------- */
function toggleDropdown(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const isOpen = target.classList.contains('open');
  document.querySelectorAll('.notif-dropdown.open, .user-dropdown.open')
          .forEach(el => el.classList.remove('open'));
  if (!isOpen) target.classList.add('open');
}

document.addEventListener('click', function (e) {
  if (!e.target.closest('.notif-wrap') && !e.target.closest('#userPillWrap')) {
    document.querySelectorAll('.notif-dropdown.open, .user-dropdown.open')
            .forEach(el => el.classList.remove('open'));
  }
});

function markAllNotifRead() {
  document.querySelectorAll('.notif-dot').forEach(d => d.classList.add('read'));
  const badge = document.getElementById('notifCount');
  if (badge) badge.style.opacity = '0';
}

function setNavActive() {
  const page = location.pathname.split('/').pop() || 'announcements.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

/* -------------------------------------------------------
   2. ANNOUNCEMENT DATA STORE
   Full body content is stored here and injected into
   the detail panel when an announcement is opened.
------------------------------------------------------- */
const ANNOUNCE = {

  1: {
    title:          'Q2 2026 KPI Targets Now Published',
    category:       'kpi',
    categoryLabel:  'KPI & Evaluation',
    author:         'HR Department',
    authorInitials: 'HR',
    authorRole:     'Human Resources',
    date:           'Jun 22, 2026',
    readTime:       '4 min read',
    tags:           ['Q2 2026', 'KPI Targets', 'Engineering', 'All Departments'],
    body: `
      <h3>Overview</h3>
      <p>HR has officially published the <strong>Q2 2026 KPI targets</strong> for all departments. 
      These targets reflect updated organizational priorities and incorporate feedback from Q1 
      performance reviews. All employees are required to acknowledge their assigned KPIs by 
      <strong>July 1st, 2026</strong>.</p>

      <h3>What Has Changed for Engineering?</h3>
      <ul>
        <li><strong>Code Quality & Reviews</strong> — target threshold increased from 90% to 95% completion rate</li>
        <li><strong>Technical Documentation</strong> — minimum output raised from 12 to 15 documents per quarter</li>
        <li><strong>Sprint Velocity</strong> — target remains 20 story points; bonus band introduced at 22+</li>
        <li><strong>Team Collaboration</strong> — cross-department contribution now counted separately</li>
      </ul>

      <h3>Key Dates</h3>
      <ul>
        <li><strong>July 1:</strong>  KPI acknowledgement deadline (via EvaluAI)</li>
        <li><strong>July 7:</strong>  Q2 evaluation cycle officially opens</li>
        <li><strong>Sep 26:</strong>  Q2 mid-quarter check-in with team leads</li>
        <li><strong>Sep 30:</strong>  Q2 evaluation period closes</li>
      </ul>

      <h3>Action Required</h3>
      <p>Log into your <strong>Employee Dashboard → My KPIs – Q2 2026</strong> to review your 
      assigned indicators. If you have questions about weight adjustments, contact your team lead 
      or reach HR at <strong>hr@evaluai.com</strong>.</p>
    `
  },

  2: {
    title:          'Mid-Year Performance Review: Key Dates & Process',
    category:       'kpi',
    categoryLabel:  'KPI & Evaluation',
    author:         'HR Department',
    authorInitials: 'HR',
    authorRole:     'Human Resources',
    date:           'Jun 20, 2026',
    readTime:       '3 min read',
    tags:           ['Mid-Year Review', 'Performance', 'Self-Assessment'],
    body: `
      <h3>Mid-Year Review 2026</h3>
      <p>The <strong>Mid-Year Performance Review cycle</strong> runs from <strong>July 7 – July 25, 2026</strong>. 
      This review covers combined Q1 and Q2 performance and forms the basis for mid-year salary 
      adjustments and promotion recommendations.</p>

      <h3>What You Need to Do</h3>
      <ul>
        <li><strong>Complete your self-assessment</strong> in EvaluAI by <strong>June 30th</strong></li>
        <li>Review your Q1 evaluation feedback and AI insights</li>
        <li>Prepare examples of achievements against each KPI</li>
        <li>Schedule a mid-year 1-on-1 with your manager (slots visible in EvaluAI Calendar)</li>
      </ul>

      <h3>Timeline</h3>
      <ul>
        <li><strong>Jun 30:</strong> Self-assessment submission deadline</li>
        <li><strong>Jul 7–18:</strong>  Manager evaluations open</li>
        <li><strong>Jul 20–25:</strong> HR calibration sessions</li>
        <li><strong>Jul 31:</strong> Results published to employee dashboards</li>
      </ul>

      <p>For support completing your self-assessment, refer to the <strong>EvaluAI User Guide</strong> 
      available in the Help section of your dashboard.</p>
    `
  },

  3: {
    title:          'Updated Code Review Standards — Engineering Team',
    category:       'engineering',
    categoryLabel:  'Engineering',
    author:         'Sarah Mitchell',
    authorInitials: 'SM',
    authorRole:     'Engineering Manager',
    date:           'Jun 19, 2026',
    readTime:       '5 min read',
    tags:           ['Code Review', 'Engineering Policy', 'Q2 2026'],
    body: `
      <h3>Policy Update Effective July 1st, 2026</h3>
      <p>Following the Q1 code quality analysis, the Engineering team is updating its code review 
      standards to improve overall merge quality and reduce post-merge defect rates.</p>

      <h3>Key Changes</h3>
      <ul>
        <li><strong>Minimum 2 peer approvals</strong> required before merging to <code>main</code> 
        (previously 1 approval)</li>
        <li><strong>SonarQube quality gates</strong> are now mandatory — PRs failing code smell 
        or coverage thresholds will be blocked automatically</li>
        <li><strong>Review response SLA:</strong> All review requests must receive a first response 
        within <strong>1 business day</strong></li>
        <li><strong>PR descriptions</strong> must reference the linked Jira ticket and include 
        a testing checklist</li>
      </ul>

      <h3>How This Affects Your KPIs</h3>
      <p>The <strong>Code Quality & Reviews KPI</strong> (25% weight) will now incorporate 
      SonarQube gate pass rates alongside peer review completion. Employees who consistently 
      meet the new standards will be eligible for an Exceeds Target rating on this KPI.</p>

      <h3>Support</h3>
      <p>A SonarQube onboarding session will be held on <strong>July 3rd, 10:00 AM</strong> 
      (Engineering Meeting Room / Teams). Attendance is strongly encouraged. Questions? 
      Reach out to <strong>sarah.mitchell@evaluai.com</strong>.</p>
    `
  },

  4: {
    title:          'EvaluAI Platform Update v2.4 — New Features & Fixes',
    category:       'system',
    categoryLabel:  'System Update',
    author:         'IT Administration',
    authorInitials: 'IT',
    authorRole:     'IT Department',
    date:           'Jun 14, 2026',
    readTime:       '2 min read',
    tags:           ['System Update', 'EvaluAI v2.4', 'Bug Fixes'],
    body: `
      <h3>What's New in v2.4</h3>
      <ul>
        <li><strong>AI Feedback enhancements:</strong> Typing animation, radar chart, and 
        score prediction chart added to the AI Feedback module</li>
        <li><strong>Performance History:</strong> New quarter filter tabs and expandable 
        evaluation accordion with full KPI table</li>
        <li><strong>Announcements module:</strong> Slide-in detail panel with category filtering 
        and mark-as-read functionality</li>
        <li><strong>Navigation:</strong> All employee dashboard modules now linked with 
        consistent active-state highlighting</li>
      </ul>

      <h3>Bug Fixes</h3>
      <ul>
        <li>Fixed notification badge count not resetting after Mark All Read</li>
        <li>Resolved chart rendering issue on tablet screen sizes</li>
        <li>Fixed sidebar active state not persisting across page refreshes</li>
      </ul>

      <h3>Maintenance Window</h3>
      <p>A <strong>30-minute maintenance window</strong> is scheduled for <strong>June 28, 2:00–2:30 AM PKT</strong>. 
      The system will be unavailable during this period. Please save any in-progress work beforehand.</p>
    `
  },

  5: {
    title:          'Q1 2026 Final Evaluation Results Now Available',
    category:       'kpi',
    categoryLabel:  'KPI & Evaluation',
    author:         'HR Department',
    authorInitials: 'HR',
    authorRole:     'Human Resources',
    date:           'Jun 12, 2026',
    readTime:       '2 min read',
    tags:           ['Q1 2026', 'Results', 'Evaluation Scores'],
    body: `
      <h3>Q1 2026 Evaluation Complete</h3>
      <p>All Q1 2026 manager evaluations have been finalized and HR calibration is complete. 
      Your official evaluation results are now available on your <strong>Employee Dashboard</strong>.</p>

      <h3>Where to View Your Results</h3>
      <ul>
        <li>Go to <strong>Employee Dashboard → Overview</strong> to see your Manager Score, 
        HR Score, and Total Score</li>
        <li>Visit <strong>Performance History → Q1 2026</strong> for the full KPI-by-KPI breakdown</li>
        <li>Check <strong>AI Feedback</strong> for your personalized Q1 analysis and Q2 recommendations</li>
      </ul>

      <h3>Score Appeal Process</h3>
      <p>If you have questions about your evaluation scores, you have a <strong>10-day appeal 
      window</strong> (closes June 22nd). Submit appeals via EvaluAI's Evaluation History page 
      using the "Request Review" button next to your Q1 2026 record.</p>
    `
  },

  6: {
    title:          'Annual Company Picnic — July 5th, F-9 Park Islamabad',
    category:       'event',
    categoryLabel:  'Events',
    author:         'HR Department',
    authorInitials: 'HR',
    authorRole:     'Human Resources',
    date:           'Jun 10, 2026',
    readTime:       '2 min read',
    tags:           ['Company Event', 'Picnic', 'July 2026'],
    body: `
      <h3>You're Invited!</h3>
      <p>The annual <strong>EvaluAI Company Picnic</strong> returns on <strong>Saturday, July 5th, 2026</strong> 
      at F-9 Park, Islamabad. Bring your family and enjoy a day of food, fun, and team bonding.</p>

      <h3>Event Details</h3>
      <ul>
        <li><strong>Date:</strong> Saturday, July 5th, 2026</li>
        <li><strong>Time:</strong> 10:00 AM – 5:00 PM</li>
        <li><strong>Venue:</strong> F-9 Park, Islamabad (parking available at Gate 3)</li>
        <li><strong>Dress code:</strong> Casual / Smart casual</li>
      </ul>

      <h3>Activities</h3>
      <ul>
        <li>Team cricket tournament</li>
        <li>Badminton & table tennis</li>
        <li>Kids' activities (face painting, rides)</li>
        <li>BBQ lunch and evening snacks</li>
        <li>Lucky draw with prizes</li>
      </ul>

      <h3>RSVP Required</h3>
      <p>Please RSVP by <strong>June 28th</strong> using the HR Portal so we can arrange catering 
      and transport. Contact <strong>events@evaluai.com</strong> for questions.</p>
    `
  },

  7: {
    title:          'Remote Work Policy Update — Effective July 1st',
    category:       'hr',
    categoryLabel:  'HR Policy',
    author:         'HR Department',
    authorInitials: 'HR',
    authorRole:     'Human Resources',
    date:           'Jun 5, 2026',
    readTime:       '6 min read',
    tags:           ['HR Policy', 'Remote Work', 'WFH', 'Effective Jul 2026'],
    body: `
      <h3>Policy Summary</h3>
      <p>Effective <strong>July 1st, 2026</strong>, the Remote Work Policy has been updated to 
      reflect the company's evolving hybrid work strategy. The key change is an expansion of 
      remote work allowance to support employee flexibility while maintaining productivity standards.</p>

      <h3>Key Changes</h3>
      <ul>
        <li><strong>Remote days allowed:</strong> Up to <strong>3 days per week</strong> 
        (increased from 2), subject to manager approval</li>
        <li><strong>Core hours:</strong> All employees must be available 
        <strong>10:00 AM – 3:00 PM PKT</strong> on working days regardless of location</li>
        <li><strong>In-office requirement:</strong> At least 2 days per week in office; 
        Mondays are mandatory in-office days for all departments</li>
        <li><strong>Approval process:</strong> Submit WFH requests via EvaluAI's Leave module 
        at least 24 hours in advance</li>
      </ul>

      <h3>Performance Implications</h3>
      <p>Attendance and punctuality (captured via check-in logs) remain part of the <strong>HR 
      Score KPI</strong>. Remote days will be tracked and consistently missing core hours may 
      affect your HR KPI score for the quarter.</p>

      <h3>Questions?</h3>
      <p>Contact <strong>hr@evaluai.com</strong> or speak with your HR Business Partner for 
      department-specific guidance.</p>
    `
  },

  8: {
    title:          'Q3–Q4 2026 Training & Development Calendar Released',
    category:       'event',
    categoryLabel:  'Events',
    author:         'L&D Team',
    authorInitials: 'LD',
    authorRole:     'Learning & Development',
    date:           'Jun 1, 2026',
    readTime:       '3 min read',
    tags:           ['Training', 'L&D', 'Q3 2026', 'Q4 2026'],
    body: `
      <h3>Training Calendar Now Open</h3>
      <p>The Learning & Development team has published the <strong>Q3–Q4 2026 training 
      calendar</strong>. Over <strong>15 technical and soft-skills courses</strong> are available 
      this semester, including several new additions aligned with Q2 KPI focus areas.</p>

      <h3>Highlighted Courses</h3>
      <ul>
        <li><strong>Clean Code & Code Review Mastery</strong> (Engineering – July 14)</li>
        <li><strong>Technical Writing for Developers</strong> (Engineering – July 22)</li>
        <li><strong>Agile Sprint Planning Advanced</strong> (All – August 5)</li>
        <li><strong>Leadership Essentials for Senior Contributors</strong> (All – August 19)</li>
        <li><strong>AI Tools for Productivity</strong> (All – September 3)</li>
      </ul>

      <h3>How to Register</h3>
      <p>Registration is open on a first-come, first-served basis. Log into <strong>EvaluAI → 
      Training Portal</strong> to view the full calendar and reserve your seat. 
      Priority seats are available for employees with active development goals in their 
      Q2 evaluation.</p>

      <p>Questions? Contact <strong>learning@evaluai.com</strong>.</p>
    `
  }
};

/* Track read state in memory (resets on page reload — real app would use localStorage/API) */
const readState = { 1: false, 2: false, 3: false, 4: false, 5: true, 6: true, 7: true, 8: true };
let unreadCount = Object.values(readState).filter(v => !v).length; // 4

/* Currently open announcement id */
let activeId = null;

/* -------------------------------------------------------
   3. CATEGORY FILTER TABS
------------------------------------------------------- */
function filterCategory(tabEl, value) {
  document.querySelectorAll('.ann-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');

  const cards   = document.querySelectorAll('.ann-card');
  const headers = document.querySelectorAll('.ann-section-head');
  let   visible = 0;

  cards.forEach(card => {
    const match = value === 'all' || card.dataset.cat === value;
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  });

  // Hide "Pinned" section header if no pinned cards are visible
  headers.forEach(h => {
    if (h.dataset.section === 'pinned') {
      const pinnedVisible = [...document.querySelectorAll('.ann-card.pinned')]
        .some(c => c.style.display !== 'none');
      h.style.display = pinnedVisible ? '' : 'none';
    }
  });

  // Empty state
  const empty = document.getElementById('annEmpty');
  if (empty) empty.classList.toggle('visible', visible === 0);

  // Close open panel
  closePanel();
}

/* -------------------------------------------------------
   4. LIVE SEARCH
------------------------------------------------------- */
function initSearch() {
  const input = document.getElementById('annSearch');
  if (!input) return;

  input.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.ann-card');
    let visible = 0;

    cards.forEach(card => {
      const title   = (card.dataset.title   || '').toLowerCase();
      const preview = (card.dataset.preview || '').toLowerCase();
      const match   = !q || title.includes(q) || preview.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    const empty = document.getElementById('annEmpty');
    if (empty) empty.classList.toggle('visible', visible === 0);
  });
}

/* -------------------------------------------------------
   5. SLIDE-IN DETAIL PANEL
------------------------------------------------------- */
function openAnnouncement(id) {
  const data = ANNOUNCE[id];
  if (!data) return;

  activeId = id;

  /* ── Populate panel bar ── */
  const bar = document.getElementById('annPanelBar');
  if (bar) {
    bar.innerHTML = `
      <div class="ann-panel-bar-left">
        <span class="ann-cat-badge ${getCatClass(data.category)}">${data.categoryLabel}</span>
        ${isPinned(id) ? '<span class="ann-pin-tag"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>Pinned</span>' : ''}
        ${isUrgent(id) ? '<span class="ann-urg-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Urgent</span>' : ''}
      </div>
      <button class="ann-panel-close" onclick="closePanel()" aria-label="Close">&#x2715;</button>
    `;
  }

  /* ── Populate panel body ── */
  const body = document.getElementById('annPanelBody');
  if (body) {
    const tagsHtml = data.tags.map(t => `<span class="ann-panel-tag">${t}</span>`).join('');
    body.innerHTML = `
      <h2 class="ann-panel-title">${data.title}</h2>
      <div class="ann-panel-author-row">
        <div class="ann-panel-avatar ${getCatClass(data.category)}">${data.authorInitials}</div>
        <div>
          <div class="ann-panel-author-name">${data.author}</div>
          <div class="ann-panel-author-meta">${data.authorRole} &middot; ${data.date} &middot; ${data.readTime}</div>
        </div>
      </div>
      <hr class="ann-panel-divider">
      <div class="ann-panel-content">${data.body}</div>
      <div class="ann-panel-tags">${tagsHtml}</div>
    `;
  }

  /* ── Update mark-as-read footer button ── */
  refreshMarkReadBtn();

  /* ── Open overlay + panel ── */
  document.getElementById('annOverlay').classList.add('active');
  document.getElementById('annPanel').classList.add('open');
}

function closePanel() {
  document.getElementById('annOverlay').classList.remove('active');
  document.getElementById('annPanel').classList.remove('open');
  activeId = null;
}

/* -------------------------------------------------------
   6. MARK AS READ  (single + all)
------------------------------------------------------- */
function markThisRead() {
  if (!activeId || readState[activeId]) return;

  readState[activeId] = true;
  unreadCount = Math.max(0, unreadCount - 1);

  /* Update the card in the list */
  const card = document.querySelector(`.ann-card[data-id="${activeId}"]`);
  if (card) {
    card.classList.remove('unread');
    card.classList.add('read');
    const dot = card.querySelector('.ann-unread-dot');
    if (dot) dot.remove();
  }

  /* Update stat card */
  updateUnreadStat();

  /* Update footer button */
  refreshMarkReadBtn();

  /* Toast */
  showToast('Marked as read');
}

function markAllAnnouncementsRead() {
  Object.keys(readState).forEach(id => { readState[id] = true; });
  unreadCount = 0;

  document.querySelectorAll('.ann-card.unread').forEach(card => {
    card.classList.remove('unread');
    card.classList.add('read');
    const dot = card.querySelector('.ann-unread-dot');
    if (dot) dot.remove();
  });

  updateUnreadStat();
  refreshMarkReadBtn();
  showToast('All announcements marked as read');
}

function refreshMarkReadBtn() {
  const btn = document.getElementById('annMarkReadBtn');
  if (!btn || !activeId) return;

  if (readState[activeId]) {
    btn.classList.add('done');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Already Read`;
    btn.onclick = null;
  } else {
    btn.classList.remove('done');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Mark as Read`;
    btn.onclick = markThisRead;
  }
}

function updateUnreadStat() {
  const el = document.getElementById('unreadStatVal');
  if (el) el.textContent = unreadCount;
}

/* -------------------------------------------------------
   7. TOAST NOTIFICATION
------------------------------------------------------- */
let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('annToast');
  if (!toast) return;

  toast.querySelector('.ann-toast-msg').textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* -------------------------------------------------------
   8. HELPERS
------------------------------------------------------- */
function getCatClass(cat) {
  const map = { kpi:'cat-kpi', hr:'cat-hr', system:'cat-system', event:'cat-event', engineering:'cat-engineering', general:'cat-general' };
  return map[cat] || 'cat-general';
}

function isPinned(id) { return [1, 2].includes(Number(id)); }
function isUrgent(id) { return [1].includes(Number(id));   }

/* -------------------------------------------------------
   9. INIT
------------------------------------------------------- */
window.addEventListener('load', function () {
  setNavActive();
  initSearch();
  updateUnreadStat();
});
