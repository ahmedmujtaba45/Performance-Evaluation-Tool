/* =======================================================
   EvaluAI – Surveys Scripts
   File    : surveys.js
   Sections:
     1. Shared UI helpers
     2. Survey data store (questions + config)
     3. Survey state manager
     4. Filter tabs
     5. Open / close survey overlay
     6. Question renderer
     7. Answer interaction handlers
     8. Navigation (prev / next / submit)
     9. Progress calculation
    10. Auto-save simulation
    11. Completion screen
    12. Init
======================================================= */

/* -------------------------------------------------------
   1. SHARED UI HELPERS
------------------------------------------------------- */
function toggleDropdown(id) {
  const t = document.getElementById(id);
  if (!t) return;
  const open = t.classList.contains('open');
  document.querySelectorAll('.notif-dropdown.open,.user-dropdown.open')
          .forEach(el => el.classList.remove('open'));
  if (!open) t.classList.add('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.notif-wrap') && !e.target.closest('#userPillWrap'))
    document.querySelectorAll('.notif-dropdown.open,.user-dropdown.open')
            .forEach(el => el.classList.remove('open'));
});

function markAllNotifRead() {
  document.querySelectorAll('.notif-dot').forEach(d => d.classList.add('read'));
  const b = document.getElementById('notifCount');
  if (b) b.style.opacity = '0';
}

function setNavActive() {
  const page = location.pathname.split('/').pop() || 'surveys.html';
  document.querySelectorAll('.nav-item[data-page]')
          .forEach(el => el.classList.toggle('active', el.dataset.page === page));
}

/* -------------------------------------------------------
   2. SURVEY DATA STORE
------------------------------------------------------- */
const SURVEYS = {

  /* ── Q1 2026 Employee Satisfaction (10 Qs) ── */
  sv1: {
    title:    'Q1 2026 Employee Satisfaction Survey',
    category: 'Satisfaction',
    anon:     true,
    estMins:  5,
    due:      'Jun 30, 2026',
    dueUrgent: true,
    questions: [
      {
        id: 'sv1_q1', type: 'rating',
        text: 'How satisfied are you with your overall work experience this quarter?',
        hint: 'Rate from 1 (very dissatisfied) to 5 (very satisfied)',
        min: 1, max: 5,
        minLabel: 'Very Dissatisfied', maxLabel: 'Very Satisfied'
      },
      {
        id: 'sv1_q2', type: 'scale',
        text: 'I feel my performance was evaluated fairly and transparently.',
        options: [
          'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'
        ]
      },
      {
        id: 'sv1_q3', type: 'radio',
        text: 'Do you feel your assigned KPI targets were fair and achievable this quarter?',
        options: [
          'Yes, completely fair',
          'Mostly fair, with minor concerns',
          'Neutral — neither fair nor unfair',
          'Somewhat unfair',
          'No, the targets were unreasonable'
        ]
      },
      {
        id: 'sv1_q4', type: 'rating',
        text: 'How would you rate the support and communication from your team lead?',
        hint: 'Rate from 1 (poor) to 5 (excellent)',
        min: 1, max: 5,
        minLabel: 'Poor', maxLabel: 'Excellent'
      },
      {
        id: 'sv1_q5', type: 'scale',
        text: 'The EvaluAI platform is easy to use and helps me understand my performance clearly.',
        options: [
          'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'
        ]
      },
      {
        id: 'sv1_q6', type: 'radio',
        text: 'How often do you feel your contributions are recognized by your manager or team?',
        options: ['Always', 'Frequently', 'Sometimes', 'Rarely', 'Never']
      },
      {
        id: 'sv1_q7', type: 'nps',
        text: 'On a scale of 0–10, how likely are you to recommend EvaluAI as a great place to work?',
        hint: '0 = Not at all likely · 10 = Extremely likely'
      },
      {
        id: 'sv1_q8', type: 'checkbox',
        text: 'Which aspects of your work do you find most fulfilling? (Select all that apply)',
        options: [
          'Technical challenges and problem-solving',
          'Collaboration and team dynamics',
          'Learning and professional growth',
          'Direct impact and visibility of work',
          'Recognition and career progression'
        ]
      },
      {
        id: 'sv1_q9', type: 'textarea',
        text: 'What one change would most improve the performance evaluation process?',
        placeholder: 'Share your suggestion here…',
        maxlen: 600
      },
      {
        id: 'sv1_q10', type: 'textarea',
        text: 'Any additional feedback, comments, or suggestions for the team or management?',
        placeholder: 'Your feedback is valued and reviewed by HR. Feel free to share anything…',
        maxlen: 800
      }
    ]
  },

  /* ── Mid-Year Culture & Engagement (15 Qs) ── */
  sv2: {
    title:    'Mid-Year Culture & Engagement Survey 2026',
    category: 'Engagement',
    anon:     true,
    estMins:  8,
    due:      'Jul 5, 2026',
    dueUrgent: false,
    questions: [
      {
        id: 'sv2_q1', type: 'scale',
        text: 'I feel a strong sense of belonging and inclusion at EvaluAI.',
        options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']
      },
      {
        id: 'sv2_q2', type: 'scale',
        text: 'The company\'s values and mission are clearly communicated and understood.',
        options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']
      },
      {
        id: 'sv2_q3', type: 'rating',
        text: 'Rate the overall communication and transparency from senior leadership.',
        hint: '1 = Very poor · 5 = Excellent',
        min: 1, max: 5, minLabel: 'Very Poor', maxLabel: 'Excellent'
      },
      {
        id: 'sv2_q4', type: 'scale',
        text: 'I have access to the tools, resources, and information needed to do my job effectively.',
        options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']
      },
      {
        id: 'sv2_q5', type: 'radio',
        text: 'How would you describe the overall team morale in your department this quarter?',
        options: ['Excellent — very positive and motivated','Good — generally positive','Mixed — varies day to day','Low — morale needs attention','Very low — significant issues present']
      },
      {
        id: 'sv2_q6', type: 'rating',
        text: 'Rate the effectiveness of cross-department collaboration at EvaluAI.',
        hint: '1 = Very ineffective · 5 = Very effective',
        min: 1, max: 5, minLabel: 'Ineffective', maxLabel: 'Very Effective'
      },
      {
        id: 'sv2_q7', type: 'scale',
        text: 'I feel empowered to share ideas and suggestions with my manager and team.',
        options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']
      },
      {
        id: 'sv2_q8', type: 'radio',
        text: 'How satisfied are you with the learning and development opportunities provided?',
        options: ['Very satisfied','Satisfied','Neutral','Dissatisfied','Very dissatisfied']
      },
      {
        id: 'sv2_q9', type: 'scale',
        text: 'The workload distribution in my team is fair and manageable.',
        options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']
      },
      {
        id: 'sv2_q10', type: 'rating',
        text: 'Rate the overall effectiveness of the remote/hybrid work arrangements this quarter.',
        hint: '1 = Very ineffective · 5 = Highly effective',
        min: 1, max: 5, minLabel: 'Ineffective', maxLabel: 'Highly Effective'
      },
      {
        id: 'sv2_q11', type: 'checkbox',
        text: 'Which areas do you believe need the most improvement at EvaluAI? (Select up to 3)',
        options: [
          'Internal communication', 'Work-life balance', 'Career growth paths',
          'Technical tooling & processes', 'Recognition & rewards', 'Team collaboration'
        ]
      },
      {
        id: 'sv2_q12', type: 'nps',
        text: 'How likely are you to still be working at EvaluAI in the next 12 months?',
        hint: '0 = Very unlikely · 10 = Definitely staying'
      },
      {
        id: 'sv2_q13', type: 'radio',
        text: 'Do you feel the performance evaluation process motivates you to improve?',
        options: ['Yes, strongly','Yes, somewhat','Neutral','Not really','No, it demotivates me']
      },
      {
        id: 'sv2_q14', type: 'textarea',
        text: 'What is one thing EvaluAI leadership could do to improve company culture?',
        placeholder: 'Share your suggestion here…', maxlen: 600
      },
      {
        id: 'sv2_q15', type: 'textarea',
        text: 'Any other thoughts on engagement, culture, or team dynamics you\'d like to share?',
        placeholder: 'All responses are anonymous and reviewed by senior HR leadership…',
        maxlen: 800
      }
    ]
  },

  /* ── 360° Peer Feedback — Sprint Team (10 Qs, 3 pre-answered) ── */
  sv3: {
    title:    '360° Peer Feedback — Michael Park',
    category: 'Peer Feedback',
    anon:     false,
    estMins:  6,
    due:      'Jun 28, 2026',
    dueUrgent: true,
    savedProgress: 3,
    preAnswers: { sv3_q1: 4, sv3_q2: 3, sv3_q3: 2 },   /* already answered */
    questions: [
      {
        id: 'sv3_q1', type: 'rating',
        text: 'Rate Michael\'s overall technical skill and code quality.',
        hint: '1 = Needs significant improvement · 5 = Exceptional',
        min: 1, max: 5, minLabel: 'Needs Work', maxLabel: 'Exceptional'
      },
      {
        id: 'sv3_q2', type: 'rating',
        text: 'How effectively does Michael contribute to sprint velocity and on-time delivery?',
        hint: '1 = Frequently misses targets · 5 = Consistently exceeds targets',
        min: 1, max: 5, minLabel: 'Misses Targets', maxLabel: 'Exceeds Targets'
      },
      {
        id: 'sv3_q3', type: 'scale',
        text: 'Michael communicates effectively and transparently within the team.',
        options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']
      },
      {
        id: 'sv3_q4', type: 'rating',
        text: 'Rate Michael\'s responsiveness to code review requests and feedback.',
        hint: '1 = Very slow / unresponsive · 5 = Always prompt and constructive',
        min: 1, max: 5, minLabel: 'Unresponsive', maxLabel: 'Excellent'
      },
      {
        id: 'sv3_q5', type: 'scale',
        text: 'Michael actively supports team members who need help or guidance.',
        options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']
      },
      {
        id: 'sv3_q6', type: 'radio',
        text: 'How often does Michael proactively identify and flag technical risks or blockers?',
        options: ['Always — before they become issues','Frequently','Sometimes','Rarely','Never']
      },
      {
        id: 'sv3_q7', type: 'rating',
        text: 'Rate Michael\'s overall collaboration and team-player attitude.',
        hint: '1 = Does not collaborate well · 5 = Outstanding team player',
        min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Outstanding'
      },
      {
        id: 'sv3_q8', type: 'scale',
        text: 'Michael\'s technical documentation is clear, thorough, and kept up to date.',
        options: ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']
      },
      {
        id: 'sv3_q9', type: 'textarea',
        text: 'What is Michael\'s greatest strength that positively impacts the team?',
        placeholder: 'Describe a specific strength or example…', maxlen: 500
      },
      {
        id: 'sv3_q10', type: 'textarea',
        text: 'What is one area where Michael could improve to become more effective?',
        placeholder: 'Constructive, specific feedback is most helpful…', maxlen: 500
      }
    ]
  }
};

/* -------------------------------------------------------
   3. SURVEY STATE MANAGER
------------------------------------------------------- */
const state = {
  activeSurveyId: null,
  currentQ:       0,           /* 0-based index */
  answers:        {},          /* { questionId: value } */
  completed:      new Set(),   /* surveyIds already finished this session */
};

function getSurvey() { return SURVEYS[state.activeSurveyId]; }

/* -------------------------------------------------------
   4. FILTER TABS
------------------------------------------------------- */
function filterSurveys(tabEl, status) {
  document.querySelectorAll('.sv-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');

  const cards = document.querySelectorAll('.sv-card[data-status]');
  let visible = 0;

  cards.forEach(c => {
    const match = status === 'all' || c.dataset.status === status;
    c.style.display = match ? '' : 'none';
    if (match) visible++;
  });

  const empty = document.getElementById('svEmpty');
  if (empty) empty.classList.toggle('visible', visible === 0);
}

/* -------------------------------------------------------
   5. OPEN / CLOSE SURVEY OVERLAY
------------------------------------------------------- */
function openSurvey(surveyId) {
  const sv = SURVEYS[surveyId];
  if (!sv) return;

  state.activeSurveyId = surveyId;
  state.answers        = { ...(sv.preAnswers || {}) };
  state.currentQ       = sv.savedProgress ? sv.savedProgress : 0;

  /* Update overlay title */
  const titleEl = document.getElementById('svOvTitle');
  if (titleEl) titleEl.textContent = sv.title;

  /* Show question view, hide completion screen */
  document.getElementById('svQuestionView').style.display = '';
  document.getElementById('svCompleteScreen').classList.remove('show');

  /* Render first question */
  renderQuestion();

  /* Show overlay */
  document.getElementById('svOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSurvey() {
  document.getElementById('svOverlay').classList.remove('open');
  document.body.style.overflow = '';
  state.activeSurveyId = null;
}

/* -------------------------------------------------------
   6. QUESTION RENDERER
------------------------------------------------------- */
function renderQuestion() {
  const sv  = getSurvey();
  if (!sv) return;

  const q   = sv.questions[state.currentQ];
  const num = state.currentQ + 1;
  const tot = sv.questions.length;

  /* ── Top-bar counter ── */
  document.getElementById('svQCount').textContent = `${num} of ${tot}`;

  /* ── Progress strip ── */
  const pct = Math.round(((num - 1) / tot) * 100);
  document.getElementById('svProgressFill').style.width = pct + '%';

  /* ── Question number label ── */
  document.getElementById('svQNum').textContent = `Question ${num} of ${tot}`;

  /* ── Question text ── */
  document.getElementById('svQText').textContent = q.text;

  /* ── Hint ── */
  const hintEl = document.getElementById('svQHint');
  hintEl.textContent = q.hint || '';
  hintEl.style.display = q.hint ? '' : 'none';

  /* ── Answer area ── */
  const answerEl = document.getElementById('svAnswerArea');
  answerEl.innerHTML = buildAnswerHTML(q);

  /* ── Re-apply saved answer ── */
  restoreAnswer(q);

  /* ── Navigation buttons ── */
  const prevBtn = document.getElementById('svPrevBtn');
  const nextBtn = document.getElementById('svNextBtn');

  prevBtn.disabled = (state.currentQ === 0);

  const isLast = state.currentQ === tot - 1;
  nextBtn.className = isLast ? 'sv-nav-btn submit' : 'sv-nav-btn primary';
  nextBtn.innerHTML = isLast
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Submit Survey`
    : `Next <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
  nextBtn.onclick = isLast ? submitSurvey : nextQuestion;
}

/* -------------------------------------------------------
   7. BUILD ANSWER HTML
------------------------------------------------------- */
function buildAnswerHTML(q) {
  switch (q.type) {

    case 'rating': {
      let btns = '';
      for (let i = q.min; i <= q.max; i++) {
        btns += `<button class="sv-rating-btn" data-val="${i}" onclick="selectAnswer('rating','${q.id}',${i},this)">${i}</button>`;
      }
      return `
        <div class="sv-rating-row" id="ans_${q.id}">${btns}</div>
        <div class="sv-rating-labels">
          <span>${q.minLabel}</span><span>${q.maxLabel}</span>
        </div>`;
    }

    case 'scale': {
      const opts = q.options.map((o, i) => `
        <div class="sv-scale-option" data-val="${i}" onclick="selectAnswer('scale','${q.id}',${i},this)">
          <div class="sv-scale-radio"><div class="sv-scale-inner"></div></div>
          <span class="sv-scale-text">${o}</span>
        </div>`).join('');
      return `<div class="sv-scale-wrap" id="ans_${q.id}">${opts}</div>`;
    }

    case 'nps': {
      let btns = '';
      for (let i = 0; i <= 10; i++) {
        btns += `<button class="sv-nps-btn" data-val="${i}" onclick="selectAnswer('nps','${q.id}',${i},this)">${i}</button>`;
      }
      return `
        <div class="sv-nps-wrap" id="ans_${q.id}">
          <div class="sv-nps-row">${btns}</div>
          <div class="sv-nps-labels"><span>Not at all likely</span><span>Extremely likely</span></div>
        </div>`;
    }

    case 'radio': {
      const opts = q.options.map((o, i) => `
        <div class="sv-radio-option" data-val="${i}" onclick="selectAnswer('radio','${q.id}',${i},this)">
          <div class="sv-radio-dot"><div class="sv-radio-fill"></div></div>
          <span class="sv-radio-label">${o}</span>
        </div>`).join('');
      return `<div class="sv-radio-wrap" id="ans_${q.id}">${opts}</div>`;
    }

    case 'checkbox': {
      const opts = q.options.map((o, i) => `
        <div class="sv-check-option" data-val="${i}" onclick="toggleCheckbox('${q.id}',${i},this)">
          <div class="sv-check-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span class="sv-check-label">${o}</span>
        </div>`).join('');
      return `<div class="sv-check-wrap" id="ans_${q.id}">${opts}</div>`;
    }

    case 'textarea': {
      const max = q.maxlen || 600;
      return `
        <div class="sv-textarea-wrap" id="ans_${q.id}">
          <textarea class="sv-textarea" maxlength="${max}"
            placeholder="${q.placeholder || ''}"
            oninput="recordTextarea('${q.id}',this)"
            rows="5"></textarea>
          <div class="sv-textarea-hint" id="tc_${q.id}">0 / ${max}</div>
        </div>`;
    }

    default: return '<p style="color:var(--t3)">Unknown question type.</p>';
  }
}

/* -------------------------------------------------------
   RESTORE SAVED ANSWER (when navigating back)
------------------------------------------------------- */
function restoreAnswer(q) {
  const saved = state.answers[q.id];
  if (saved === undefined || saved === null) return;

  if (q.type === 'rating' || q.type === 'nps') {
    const btn = document.querySelector(`#ans_${q.id} [data-val="${saved}"]`);
    if (btn) btn.classList.add('active');
  }
  if (q.type === 'scale' || q.type === 'radio') {
    const el = document.querySelector(`#ans_${q.id} [data-val="${saved}"]`);
    if (el) el.classList.add('active');
  }
  if (q.type === 'checkbox' && Array.isArray(saved)) {
    saved.forEach(v => {
      const el = document.querySelector(`#ans_${q.id} [data-val="${v}"]`);
      if (el) el.classList.add('active');
    });
  }
  if (q.type === 'textarea') {
    const ta = document.querySelector(`#ans_${q.id} textarea`);
    if (ta) {
      ta.value = saved;
      updateCharCount(q.id, saved, q.maxlen || 600);
    }
  }
}

/* -------------------------------------------------------
   8. ANSWER INTERACTION HANDLERS
------------------------------------------------------- */

/* Single-select (rating, scale, nps, radio) */
function selectAnswer(type, qId, val, el) {
  const container = document.getElementById(`ans_${qId}`);
  container.querySelectorAll('.active').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
  state.answers[qId] = val;
  triggerAutosave();
}

/* Multi-select (checkbox) */
function toggleCheckbox(qId, val, el) {
  el.classList.toggle('active');
  const current = state.answers[qId] || [];
  if (el.classList.contains('active')) {
    state.answers[qId] = [...current, val];
  } else {
    state.answers[qId] = current.filter(v => v !== val);
  }
  triggerAutosave();
}

/* Textarea */
function recordTextarea(qId, ta) {
  state.answers[qId] = ta.value;
  const sv = getSurvey();
  const q  = sv ? sv.questions.find(q => q.id === qId) : null;
  updateCharCount(qId, ta.value, q ? (q.maxlen || 600) : 600);
  triggerAutosave();
}

function updateCharCount(qId, val, max) {
  const el = document.getElementById(`tc_${qId}`);
  if (el) el.textContent = `${val.length} / ${max}`;
}

/* -------------------------------------------------------
   9. NAVIGATION
------------------------------------------------------- */
function prevQuestion() {
  if (state.currentQ > 0) {
    state.currentQ--;
    renderQuestion();
    scrollQToTop();
  }
}

function nextQuestion() {
  const sv = getSurvey();
  if (!sv) return;
  if (state.currentQ < sv.questions.length - 1) {
    state.currentQ++;
    renderQuestion();
    scrollQToTop();
  }
}

function scrollQToTop() {
  const body = document.getElementById('svOvBody');
  if (body) body.scrollTop = 0;
}

/* -------------------------------------------------------
   KEYBOARD NAVIGATION
------------------------------------------------------- */
document.addEventListener('keydown', e => {
  if (!document.getElementById('svOverlay')?.classList.contains('open')) return;
  if (e.target.tagName === 'TEXTAREA') return; /* don't intercept inside textarea */
  if (e.key === 'ArrowRight' || e.key === 'Enter') nextQuestion();
  if (e.key === 'ArrowLeft')  prevQuestion();
  if (e.key === 'Escape')     closeSurvey();
});

/* -------------------------------------------------------
   10. AUTO-SAVE SIMULATION
------------------------------------------------------- */
let autosaveTimer = null;

function triggerAutosave() {
  const el = document.getElementById('svAutosave');
  if (!el) return;

  el.className = 'sv-autosave saving';
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-6"/></svg> Saving…`;

  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    el.className = 'sv-autosave saved';
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved`;
  }, 900);
}

/* -------------------------------------------------------
   11. SUBMIT SURVEY + COMPLETION SCREEN
------------------------------------------------------- */
function submitSurvey() {
  const sv = getSurvey();
  if (!sv) return;

  /* Mark progress on card */
  const surveyId = state.activeSurveyId;
  state.completed.add(surveyId);

  /* Update the card in the list */
  const card = document.querySelector(`.sv-card[data-survey="${surveyId}"]`);
  if (card) {
    card.className = `sv-card completed ${card.dataset.survey}`;
    card.dataset.status = 'completed';

    /* Swap status badge */
    const badge = card.querySelector('.sv-status-badge');
    if (badge) {
      badge.className = 'sv-status-badge completed';
      badge.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg> Completed`;
    }

    /* Update action button */
    const btn = card.querySelector('.sv-action-btn');
    if (btn) {
      btn.className = 'sv-action-btn view';
      btn.textContent = 'View Results';
      btn.onclick = null;
    }

    /* Fill progress bar */
    const fill = card.querySelector('.sv-prog-fill');
    if (fill) fill.style.width = '100%';
    const pctEl = card.querySelector('.sv-prog-pct');
    if (pctEl) pctEl.textContent = '100%';
    const labelEl = card.querySelector('.sv-prog-label');
    if (labelEl) labelEl.textContent = 'Completed';
  }

  /* Update stat counters */
  updateStats();

  /* Show completion screen */
  document.getElementById('svQuestionView').style.display = 'none';
  document.getElementById('svCompleteScreen').classList.add('show');

  /* Update top-bar progress to 100% */
  document.getElementById('svProgressFill').style.width = '100%';
}

function updateStats() {
  /* Count completed surveys from DOM */
  const completed = document.querySelectorAll('.sv-card[data-status="completed"]').length;
  const pending   = document.querySelectorAll('.sv-card[data-status="pending"]').length;
  const inprog    = document.querySelectorAll('.sv-card[data-status="inprogress"]').length;

  const els = {
    svStatCompleted: completed,
    svStatPending:   pending,
    svStatInProgress: inprog,
  };
  Object.entries(els).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* -------------------------------------------------------
   12. INIT
------------------------------------------------------- */
window.addEventListener('load', () => {
  setNavActive();

  /* Animate progress bars on cards */
  document.querySelectorAll('.sv-prog-fill[data-w]').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 300);
  });
});
