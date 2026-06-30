/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — Admin Dashboard (KPI Configuration)                 ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: KpisController                                  ║
  ║    Path: Backend/controllers/KpisController.cs                 ║
  ║    Endpoints: GET /api/kpis                                    ║
  ║                GET /api/kpis/{id}                              ║
  ║                GET /api/kpis/department/{departmentId}         ║
  ║                POST /api/kpis                                  ║
  ║                PUT /api/kpis/{id}                              ║
  ║                DELETE /api/kpis/{id}                           ║
  ║                                                                ║
  ║  • Service: IKpiService                                        ║
  ║    Path: Backend/services/IKpiService.cs                       ║
  ║    Implementation: Backend/services/KpiService.cs              ║
  ║                                                                ║
  ║  • DTOs:                                                        ║
  ║    - KpiDetailDto: Backend/dtos/kpi/KpiDetailDto.cs            ║
  ║    - CreateKpiDto: Backend/dtos/kpi/CreateKpiDto.cs            ║
  ║    - UpdateKpiDto: Backend/dtos/kpi/UpdateKpiDto.cs            ║
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ────────────────────────────────────────
   DATA
──────────────────────────────────────── */
const DEPT_META = {
  Development:{ label:'Engineering KPIs', color:'#1D4ED8', bg:'#EFF6FF', textColor:'#1e40af' },
  QA:         { label:'QA KPIs',          color:'#10B981', bg:'#ECFDF5', textColor:'#065F46' },
  HR:         { label:'HR KPIs',          color:'#8B5CF6', bg:'#F5F3FF', textColor:'#5B21B6' },
  BA:         { label:'BA KPIs',          color:'#F59E0B', bg:'#FFFBEB', textColor:'#92400E' },
  PM:         { label:'PM KPIs',          color:'#0891B2', bg:'#ECFEFF', textColor:'#155E75' },
};
const EMP_COLORS=['#1D4ED8','#10B981','#F59E0B','#8B5CF6','#EF4444','#0891B2','#0F766E','#B45309'];
const empColorMap={};
let empColorIdx=0;
function getEmpColor(name){
  if(!empColorMap[name]) empColorMap[name]=EMP_COLORS[empColorIdx++%EMP_COLORS.length];
  return empColorMap[name];
}
function initials(n){ return n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

let nextId=100;
let deleteTarget=null;
let editTarget=null;
let activeTab='All';

let kpis = [
  /* ── Development ── */
  {id:1,  dept:'Development', title:'Requirement Understanding & Implementation',
   desc:'Measures how accurately the developer understands business and technical requirements and translates them into working features.',
   weight:15, target:90, employee:'Amir Habib',  quarter:'Q1', status:'active'},
  {id:2,  dept:'Development', title:'Code Quality & Maintainability',
   desc:'Measures how well the developer writes clean, reliable, and maintainable code with proper testing and minimal technical debt.',
   weight:20, target:95, employee:'Amir Habib',  quarter:'Q1', status:'active'},
  {id:3,  dept:'Development', title:'Productivity & Delivery',
   desc:'Evaluates the developer\'s ability to complete assigned tasks efficiently, meet sprint commitments, and deliver features on schedule.',
   weight:20, target:90, employee:'Omer Yar',    quarter:'Q1', status:'active'},
  {id:4,  dept:'Development', title:'App Performance & Reliability',
   desc:'Assesses how effectively the developer minimizes crashes, optimizes app launch times, and handles errors for a stable user experience.',
   weight:20, target:95, employee:'Fatima Malik',quarter:'Q1', status:'active'},
  {id:5,  dept:'Development', title:'Team & Process Efficiency',
   desc:'Focuses on how well the developer collaborates within the team, performs code reviews, follows documentation standards, and contributes to continuous improvement.',
   weight:10, target:85, employee:'Amir Habib',  quarter:'Q1', status:'active'},
  {id:6,  dept:'Development', title:'Technical Ownership & Accountability',
   desc:'Measures how responsibly the developer takes ownership of assigned modules from start to finish, debugging production issues and ensuring long-term stability.',
   weight:10, target:90, employee:'Fatima Malik',quarter:'Q1', status:'active'},
  {id:7,  dept:'Development', title:'Learning, Innovation & Technical Growth',
   desc:'Evaluates the developer\'s efforts to improve skills, adopt new technologies, and contribute innovative ideas that improve the product or development process.',
   weight:5,  target:80, employee:'Omer Yar',    quarter:'Q1', status:'active'},

  /* ── QA ── */
  {id:8,  dept:'QA', title:'Defect Leakage Rate',
   desc:'Measures the percentage of defects that escape QA and reach production. Lower is better — target is near-zero production leakage.',
   weight:20, target:95, employee:'Sara Ahmed',  quarter:'Q1', status:'active'},
  {id:9,  dept:'QA', title:'Test Case Coverage',
   desc:'Evaluates the percentage of requirements covered by test cases. Ensures comprehensive test traceability via RTM.',
   weight:20, target:90, employee:'Sara Ahmed',  quarter:'Q1', status:'active'},
  {id:10, dept:'QA', title:'First-Time Pass Rate',
   desc:'Measures the percentage of test cases that pass on the first execution. High scores indicate well-prepared builds.',
   weight:20, target:85, employee:'Sara Ahmed',  quarter:'Q1', status:'active'},
  {id:11, dept:'QA', title:'API Test Coverage & Defect Detection',
   desc:'Covers API-level testing including success rate, response time compliance, error handling validation, and automation coverage.',
   weight:25, target:90, employee:'Sara Ahmed',  quarter:'Q1', status:'active'},
  {id:12, dept:'QA', title:'Individual SQA Performance',
   desc:'Appraisal-focused KPI covering ownership, accountability, adherence to QA best practices, learning, and mentoring / knowledge sharing.',
   weight:15, target:85, employee:'Sara Ahmed',  quarter:'Q1', status:'active'},

  /* ── HR ── */
  {id:13, dept:'HR', title:'Schedule Predictability Index',
   desc:'Measures how reliably the HR/PM delivers milestones versus the committed plan. Reflects planning accuracy and execution control.',
   weight:25, target:90, employee:'Nauman Manzoor',quarter:'Q1', status:'active'},
  {id:14, dept:'HR', title:'Resource Utilization Efficiency',
   desc:'Evaluates how effectively the HR manager balances team workload and optimizes human resource allocation across projects.',
   weight:25, target:90, employee:'Nauman Manzoor',quarter:'Q1', status:'active'},
  {id:15, dept:'HR', title:'Risk & Issues Management',
   desc:'Measures how early risks and issues are identified versus discovered late. Separates reactive managers from strategic ones.',
   weight:20, target:85, employee:'Nauman Manzoor',quarter:'Q1', status:'active'},
  {id:16, dept:'HR', title:'Rework Ratio',
   desc:'Measures quality of delivery coordination — PM/HR quality directly affects downstream rework in the development lifecycle.',
   weight:15, target:90, employee:'Nauman Manzoor',quarter:'Q1', status:'inactive'},
  {id:17, dept:'HR', title:'Reporting, Documentation & Process Compliance',
   desc:'Evaluates consistency of stakeholder communication. BRDs, FSDs, timelines, CRs, and approvals are properly maintained.',
   weight:15, target:85, employee:'Nauman Manzoor',quarter:'Q1', status:'active'},

  /* ── BA ── */
  {id:18, dept:'BA', title:'CBAP – Requirement Clarity & Documentation',
   desc:'Certified Business Analysis Professional level KPI for 4–5 year experienced analysts focusing on requirement completeness and traceability.',
   weight:35, target:90, employee:'Ahmed Mujtaba',quarter:'Q1', status:'active'},
  {id:19, dept:'BA', title:'CCBA – Stakeholder Communication',
   desc:'Certification in Competency in Business Analysis. Targets 2–3 year analysts focusing on stakeholder engagement and communication quality.',
   weight:30, target:85, employee:'Ahmed Mujtaba',quarter:'Q1', status:'active'},
  {id:20, dept:'BA', title:'Soft Skills & Communication',
   desc:'Evaluates written and verbal communication clarity, active listening, presentation quality, and cross-team collaboration effectiveness.',
   weight:35, target:90, employee:'Ahmed Mujtaba',quarter:'Q1', status:'active'},

  /* ── PM ── */
  {id:21, dept:'PM', title:'Schedule Predictability Index',
   desc:'How reliably the PM delivers project milestones versus committed plan. A key maturity indicator measuring planning realism.',
   weight:30, target:90, employee:'Asif Khan',   quarter:'Q1', status:'active'},
  {id:22, dept:'PM', title:'Scope Change Management',
   desc:'Measures the number and handling quality of change requests. Reflects requirement clarity and change control discipline.',
   weight:20, target:85, employee:'Asif Khan',   quarter:'Q1', status:'active'},
  {id:23, dept:'PM', title:'Resource Utilization Efficiency',
   desc:'Evaluates how well the PM balances team workload and optimizes resource allocation throughout the project lifecycle.',
   weight:25, target:90, employee:'Asif Khan',   quarter:'Q1', status:'active'},
  {id:24, dept:'PM', title:'Delay Root Cause Accountability',
   desc:'Forces structured problem ownership — PM must provide RCAs for all delays with root cause analysis and preventive measures.',
   weight:15, target:80, employee:'Asif Khan',   quarter:'Q1', status:'active'},
  {id:25, dept:'PM', title:'Reporting & Documentation Compliance',
   desc:'Consistency of stakeholder communication. Essential for audits, scaling, and knowledge transfer across the organization.',
   weight:10, target:85, employee:'Asif Khan',   quarter:'Q1', status:'active'},
];

/* ────────────────────────────────────────
   HELPERS
──────────────────────────────────────── */
function deptWeight(dept, excludeId=null){
  return kpis.filter(k=>k.dept===dept && k.id!==excludeId).reduce((s,k)=>s+k.weight,0);
}
function weightClass(pct){ return pct>=100?'weight-over': pct>=85?'weight-warn':'weight-ok'; }
function miniColor(pct)  { return pct>=100?'#EF4444':     pct>=85?'#F59E0B':    '#10B981'; }

/* ────────────────────────────────────────
   RENDER
──────────────────────────────────────── */
function renderTabs(){
  const depts=['All','Development','QA','HR','BA','PM'];
  const tabs = document.getElementById('deptTabs');
  tabs.innerHTML = depts.map(d=>{
    const count = d==='All' ? kpis.length : kpis.filter(k=>k.dept===d).length;
    return `<button class="tab-btn ${activeTab===d?'active':''}" onclick="setTab('${d}')">
      ${d} <span class="tab-count">${count}</span>
    </button>`;
  }).join('');
}

function setTab(t){ activeTab=t; renderAll(); }

function renderAll(){
  const q   = document.getElementById('kpiSearch').value.toLowerCase();
  const qtr = document.getElementById('quarterFilter').value;
  const st  = document.getElementById('statusFilter').value;

  renderTabs();
  const container = document.getElementById('deptSections');
  const depts = activeTab==='All' ? ['Development','QA','HR','BA','PM'] : [activeTab];
  container.innerHTML = '';

  depts.forEach(dept=>{
    let list = kpis.filter(k=>
      k.dept===dept &&
      (!q   || k.title.toLowerCase().includes(q) || k.desc.toLowerCase().includes(q)) &&
      (!qtr || k.quarter===qtr) &&
      (!st  || k.status===st)
    );

    const meta   = DEPT_META[dept];
    const used   = deptWeight(dept);
    const wClass = weightClass(used);
    const fillPct= Math.min(used,100);

    const section = document.createElement('div');
    section.className = 'dept-section';
    section.id = `section-${dept}`;

    section.innerHTML = `
      <div class="dept-card">
        <div class="dept-card-header">
          <div class="dept-card-header-left">
            <div class="dept-dot" style="background:${meta.color}"></div>
            <span class="dept-card-name">${meta.label}</span>
            <span class="dept-kpi-count" style="background:${meta.bg};color:${meta.textColor}">
              ${list.length} KPI${list.length!==1?'s':''}
            </span>
          </div>
          <div class="weight-bar-wrap">
            <span class="weight-bar-label">Weight used: <span>${used}%</span> / 100%</span>
            <div class="weight-bar-track">
              <div class="weight-bar-fill ${wClass}" style="width:${fillPct}%"></div>
            </div>
            ${used>100?`<span style="font-size:11px;color:var(--red);font-weight:700">⚠ Exceeds 100%</span>`:''}
          </div>
        </div>
        <div class="table-wrap">
          <table class="kpi-table">
            <thead>
              <tr>
                <th>KPI</th>
                <th>Weight</th>
                <th>Target</th>
                <th>Employee</th>
                <th>Quarter</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="tbody-${dept}">
              ${list.length ? list.map(k=>rowHTML(k,meta)).join('') : emptyRow()}
            </tbody>
          </table>
        </div>
      </div>`;
    container.appendChild(section);
  });

  updateStatBadge();
}

function rowHTML(k, meta){
  const wPct = k.weight;
  return `<tr id="krow-${k.id}">
    <td>
      <div class="kpi-name-cell">
        <div class="kn">${k.title}</div>
        <div class="kd">${k.desc}</div>
      </div>
    </td>
    <td class="weight-cell">
      <div class="weight-pct">${k.weight}%</div>
      <div class="mini-bar-track">
        <div class="mini-bar-fill" style="width:${wPct}%;background:${miniColor(wPct)}"></div>
      </div>
    </td>
    <td class="target-cell">${k.target}</td>
    <td>
      <div class="emp-cell">
        <div class="emp-av" style="background:${getEmpColor(k.employee)}">${initials(k.employee)}</div>
        <span class="emp-name">${k.employee}</span>
      </div>
    </td>
    <td style="color:var(--txt-light);font-size:13px;font-weight:500">${k.quarter} 2026</td>
    <td>
      <span class="status-badge ${k.status==='active'?'sb-active':'sb-inactive'}">
        ${k.status==='active'?'Active':'Inactive'}
      </span>
    </td>
    <td>
      <div class="act-btns">
        <button class="act-btn toggle" title="${k.status==='active'?'Deactivate':'Activate'}"
          onclick="toggleKPIStatus(${k.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            ${k.status==='active'
              ? '<path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>'
              : '<path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'}
          </svg>
        </button>
        <button class="act-btn edit" title="Edit KPI" onclick="openEditModal(${k.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button class="act-btn del" title="Delete KPI" onclick="openDeleteModal(${k.id})">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </td>
  </tr>`;
}

function emptyRow(){
  return `<tr><td colspan="7">
    <div class="empty-state">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p>No KPIs found matching your filters.</p>
    </div>
  </td></tr>`;
}

function updateStatBadge(){
  document.getElementById('statActiveKPIs').textContent = kpis.filter(k=>k.status==='active').length;
}

/* ────────────────────────────────────────
   WEIGHT BANNER
──────────────────────────────────────── */
function updateWeightBanner(){
  const dept  = document.getElementById('f-dept').value;
  const wVal  = parseInt(document.getElementById('f-weight').value)||0;
  const banner= document.getElementById('weightBanner');
  const bannerTxt = document.getElementById('weightBannerText');
  const dot   = banner.querySelector('.wb-dot');

  if(!dept){ banner.className='weight-banner wb-ok'; dot.style.background='var(--green)';
    bannerTxt.textContent='Select a department to see available weight.'; return; }

  const used = deptWeight(dept, editTarget);
  const avail= 100-used;
  const after= used+wVal;

  if(after>100){
    banner.className='weight-banner wb-over'; dot.style.background='var(--red)';
    bannerTxt.innerHTML=`<strong>Over limit!</strong> ${dept} uses ${used}% + ${wVal}% = ${after}%. Exceeds 100% by ${after-100}%.`;
  } else if(avail<=15){
    banner.className='weight-banner wb-warn'; dot.style.background='var(--amber)';
    bannerTxt.innerHTML=`<strong>Nearly full.</strong> ${dept} uses ${used}% of 100%. Only <strong>${avail}%</strong> available.`;
  } else {
    banner.className='weight-banner wb-ok'; dot.style.background='var(--green)';
    bannerTxt.innerHTML=`${dept} uses ${used}% of 100%. <strong>${avail}% available</strong> for this KPI.`;
  }
}

/* ────────────────────────────────────────
   ADD MODAL
──────────────────────────────────────── */
function openAddModal(){
  editTarget=null;
  clearForm();
  document.getElementById('modalTitle').textContent='Add New KPI';
  document.getElementById('kpiSaveBtn').textContent='Add KPI';
  openModal('kpiModal');
}

/* ────────────────────────────────────────
   EDIT MODAL
──────────────────────────────────────── */
function openEditModal(id){
  const k=kpis.find(x=>x.id===id); if(!k) return;
  editTarget=id;
  clearForm();
  document.getElementById('modalTitle').textContent='Edit KPI';
  document.getElementById('kpiSaveBtn').textContent='Save Changes';
  document.getElementById('f-title').value  = k.title;
  document.getElementById('f-desc').value   = k.desc;
  document.getElementById('f-dept').value   = k.dept;
  document.getElementById('f-emp').value    = k.employee;
  document.getElementById('f-weight').value = k.weight;
  document.getElementById('f-target').value = k.target;
  document.getElementById('f-quarter').value= k.quarter;
  document.getElementById('f-status').value = k.status;
  updateWeightBanner();
  openModal('kpiModal');
}

/* ────────────────────────────────────────
   SAVE KPI
──────────────────────────────────────── */
function saveKPI(){
  const title  = document.getElementById('f-title').value.trim();
  const desc   = document.getElementById('f-desc').value.trim();
  const dept   = document.getElementById('f-dept').value;
  const emp    = document.getElementById('f-emp').value;
  const weight = parseInt(document.getElementById('f-weight').value)||0;
  const target = parseInt(document.getElementById('f-target').value)||0;
  const quarter= document.getElementById('f-quarter').value;
  const status = document.getElementById('f-status').value;

  let valid=true;
  const se=(id,show)=>{
    document.getElementById(id).classList.toggle('show',show);
    const fi=id.replace('err-','f-');
    if(document.getElementById(fi)) document.getElementById(fi).classList.toggle('input-error',show);
  };
  se('err-title',  !title);       if(!title)   valid=false;
  se('err-desc',   !desc);        if(!desc)    valid=false;
  se('err-dept',   !dept);        if(!dept)    valid=false;
  se('err-emp',    !emp);         if(!emp)     valid=false;
  se('err-weight', weight<1||weight>100); if(weight<1||weight>100) valid=false;
  se('err-target', target<1||target>100); if(target<1||target>100) valid=false;
  if(!valid) return;

  // Weight check
  const used = deptWeight(dept, editTarget);
  if(used+weight>100){
    showToast('warn',`Weight exceeds 100% for ${dept}. Adjust before saving.`); return;
  }

  if(editTarget){
    const k=kpis.find(x=>x.id===editTarget);
    Object.assign(k,{title,desc,dept,employee:emp,weight,target,quarter,status});
    showToast('success',`"${title}" updated successfully.`);
  } else {
    kpis.push({id:nextId++,dept,title,desc,weight,target,employee:emp,quarter,status});
    showToast('success',`"${title}" added to ${dept} KPIs.`);
  }
  closeModal('kpiModal');
  renderAll();
}

/* ────────────────────────────────────────
   DELETE
──────────────────────────────────────── */
function openDeleteModal(id){
  const k=kpis.find(x=>x.id===id); if(!k) return;
  deleteTarget=id;
  document.getElementById('delKPIName').textContent=`"${k.title}"`;
  openModal('deleteModal');
}
function confirmDelete(){
  const k=kpis.find(x=>x.id===deleteTarget);
  const name=k?k.title:'KPI';
  kpis=kpis.filter(x=>x.id!==deleteTarget);
  closeModal('deleteModal');
  renderAll();
  showToast('error',`"${name}" has been removed.`);
}

/* ────────────────────────────────────────
   TOGGLE STATUS
──────────────────────────────────────── */
function toggleKPIStatus(id){
  const k=kpis.find(x=>x.id===id); if(!k) return;
  k.status = k.status==='active'?'inactive':'active';
  renderAll();
  showToast('info',`"${k.title}" is now ${k.status}.`);
}

/* ────────────────────────────────────────
   MODAL / FORM HELPERS
──────────────────────────────────────── */
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function clearForm(){
  ['f-title','f-weight','f-target'].forEach(id=>{ document.getElementById(id).value=''; document.getElementById(id).classList.remove('input-error'); });
  document.getElementById('f-desc').value=''; document.getElementById('f-desc').classList.remove('input-error');
  ['f-dept','f-emp'].forEach(id=>{ document.getElementById(id).value=''; document.getElementById(id).classList.remove('input-error'); });
  document.getElementById('f-quarter').value='Q1';
  document.getElementById('f-status').value='active';
  ['err-title','err-desc','err-dept','err-emp','err-weight','err-target'].forEach(id=>document.getElementById(id).classList.remove('show'));
  updateWeightBanner();
}
document.querySelectorAll('.modal-overlay').forEach(ov=>{
  ov.addEventListener('click',e=>{ if(e.target===ov) ov.classList.remove('open'); });
});

/* ────────────────────────────────────────
   TOAST
──────────────────────────────────────── */
function showToast(type,msg){
  const icons={
    success:`<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    error:  `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    info:   `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    warn:   `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
  };
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`${icons[type]||icons.info}<span>${msg}</span>`;
  document.getElementById('toastCtr').appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),400); },3400);
}

/* ── INIT ── */
renderAll();
