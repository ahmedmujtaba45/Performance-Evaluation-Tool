/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — Admin Dashboard (Reports & Analytics)                ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: ReportsController                               ║
  ║    Path: Backend/controllers/ReportsController.cs              ║
  ║    Endpoints: GET /api/reports/departments/all                ║
  ║                GET /api/reports/department/{departmentId}      ║
  ║                                                                ║
  ║  • Controller: EvaluationsController                           ║
  ║    Path: Backend/controllers/EvaluationsController.cs          ║
  ║    Endpoints: GET /api/evaluations                             ║
  ║                GET /api/evaluations/cycle/{cycleId}            ║
  ║                                                                ║
  ║  • Service: IReportService                                     ║
  ║    Path: Backend/services/IReportService.cs                    ║
  ║    Implementation: Backend/services/ReportService.cs           ║
  ║                                                                ║
  ║  • DTOs:                                                        ║
  ║    - DepartmentReportDto: Backend/dtos/report/DepartmentReportDto.cs
  ║    - KpiPerformanceDto: Backend/dtos/report/DepartmentReportDto.cs
  ║    - EvaluationDetailDto: Backend/dtos/evaluation/EvaluationDetailDto.cs
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ═══════════ DATA ═══════════ */
const QUARTERS = ['Q1 2025','Q2 2025','Q3 2025','Q4 2025','Q1 2026'];
const DEPT_COLOR = { Development:'#1D4ED8', QA:'#10B981', HR:'#8B5CF6', BA:'#F59E0B', PM:'#0891B2' };

const DEPARTMENTS = {
  Development:{ trend:[75,77,79,80,81], target:90,
    kpis:[{name:'Requirement Understanding & Implementation',weight:15,score:85,target:90},
          {name:'Code Quality & Maintainability',weight:20,score:88,target:95},
          {name:'Productivity & Delivery',weight:20,score:78,target:90},
          {name:'App Performance & Reliability',weight:20,score:90,target:95},
          {name:'Team & Process Efficiency',weight:10,score:72,target:85},
          {name:'Technical Ownership & Accountability',weight:10,score:84,target:90},
          {name:'Learning, Innovation & Technical Growth',weight:5,score:70,target:80}]},
  QA:{ trend:[80,82,84,85,86], target:90,
    kpis:[{name:'Defect Leakage Rate',weight:20,score:91,target:95},
          {name:'Test Case Coverage',weight:20,score:88,target:90},
          {name:'First-Time Pass Rate',weight:20,score:82,target:85},
          {name:'API Test Coverage & Defect Detection',weight:25,score:89,target:90},
          {name:'Individual SQA Performance',weight:15,score:80,target:85}]},
  HR:{ trend:[74,72,69,65,68], target:85,
    kpis:[{name:'Schedule Predictability Index',weight:25,score:72,target:90},
          {name:'Resource Utilization Efficiency',weight:25,score:65,target:90},
          {name:'Risk & Issues Management',weight:20,score:70,target:85},
          {name:'Rework Ratio',weight:15,score:60,target:90},
          {name:'Reporting, Documentation & Process Compliance',weight:15,score:75,target:85}]},
  BA:{ trend:[86,88,89,91,92], target:90,
    kpis:[{name:'CBAP – Requirement Clarity & Documentation',weight:35,score:90,target:90},
          {name:'CCBA – Stakeholder Communication',weight:30,score:93,target:85},
          {name:'Soft Skills & Communication',weight:35,score:94,target:90}]},
  PM:{ trend:[73,75,77,78,80], target:88,
    kpis:[{name:'Schedule Predictability Index',weight:30,score:82,target:90},
          {name:'Scope Change Management',weight:20,score:85,target:85},
          {name:'Resource Utilization Efficiency',weight:25,score:78,target:90},
          {name:'Delay Root Cause Accountability',weight:15,score:75,target:80},
          {name:'Reporting & Documentation Compliance',weight:10,score:80,target:85}]},
};
const ORG_TREND = [77,79,80,81,82];

const EMPLOYEES = [
 {name:'Amir Habib',dept:'Development',mgr:17,hr:4,trend:[17,18,19,20,21],
  kpis:[{name:'Requirement Understanding & Implementation',score:85,target:90},
        {name:'Code Quality & Maintainability',score:90,target:95},
        {name:'Productivity & Delivery',score:80,target:90},
        {name:'Technical Ownership & Accountability',score:86,target:90}]},
 {name:'Sara Ahmed',dept:'QA',mgr:15,hr:4,trend:[15,16,17,18,19],
  kpis:[{name:'Defect Leakage Rate',score:80,target:95},
        {name:'Test Case Coverage',score:78,target:90},
        {name:'API Test Coverage & Defect Detection',score:75,target:90},
        {name:'Individual SQA Performance',score:67,target:85}]},
 {name:'Omer Yar',dept:'Development',mgr:14,hr:4,trend:[20,19,19,18,18],
  kpis:[{name:'Requirement Understanding & Implementation',score:75,target:90},
        {name:'Productivity & Delivery',score:65,target:90},
        {name:'App Performance & Reliability',score:72,target:95},
        {name:'Team & Process Efficiency',score:68,target:85}]},
 {name:'Ahmed Mujtaba',dept:'BA',mgr:19,hr:4,trend:[20,21,22,22,23],
  kpis:[{name:'CBAP – Requirement Clarity & Documentation',score:93,target:90},
        {name:'CCBA – Stakeholder Communication',score:96,target:85},
        {name:'Soft Skills & Communication',score:96,target:90}]},
 {name:'Fatima Malik',dept:'Development',mgr:18,hr:4,trend:[18,19,20,21,22],
  kpis:[{name:'Technical Ownership & Accountability',score:94,target:90},
        {name:'App Performance & Reliability',score:92,target:95},
        {name:'Code Quality & Maintainability',score:88,target:95},
        {name:'Team & Process Efficiency',score:86,target:85}]},
 {name:'Asif Khan',dept:'PM',mgr:16,hr:4,trend:[17,18,18,19,20],
  kpis:[{name:'Schedule Predictability Index',score:82,target:90},
        {name:'Scope Change Management',score:85,target:85},
        {name:'Resource Utilization Efficiency',score:76,target:90},
        {name:'Delay Root Cause Accountability',score:77,target:80}]},
 {name:'Emily Chen',dept:'QA',mgr:19,hr:5,trend:[23,24,24,23,24],
  kpis:[{name:'API Test Coverage & Defect Detection',score:97,target:90},
        {name:'Defect Leakage Rate',score:96,target:95},
        {name:'First-Time Pass Rate',score:93,target:85},
        {name:'Individual SQA Performance',score:94,target:85}]},
 {name:'Nauman Manzoor',dept:'HR',mgr:14,hr:3,trend:[18,17,15,14,17],
  kpis:[{name:'Schedule Predictability Index',score:74,target:90},
        {name:'Resource Utilization Efficiency',score:62,target:90},
        {name:'Reporting, Documentation & Process Compliance',score:80,target:85},
        {name:'Risk & Issues Management',score:64,target:85}]},
];
EMPLOYEES.forEach(e=>{ e.final = e.mgr+e.hr; e.pct = Math.round(e.final/25*100); e.color = DEPT_COLOR[e.dept]; });

let recentReports = [
 {name:'Development – Department Report',scope:'Department',cycle:'Q1 2026',by:'Robert Hayes',date:'Apr 5, 2026',fmt:'PDF'},
 {name:'Amir Habib – Individual Report',scope:'Individual',cycle:'Q1 2026',by:'Robert Hayes',date:'Apr 4, 2026',fmt:'PDF'},
 {name:'QA – Department Report',scope:'Department',cycle:'Q1 2026',by:'Robert Hayes',date:'Apr 3, 2026',fmt:'PDF'},
 {name:'Organization Summary',scope:'Organization',cycle:'Q4 2025',by:'Robert Hayes',date:'Jan 10, 2026',fmt:'Excel'},
 {name:'Nauman Manzoor – Individual Report',scope:'Individual',cycle:'Q1 2026',by:'Robert Hayes',date:'Jan 8, 2026',fmt:'Excel'},
];

/* ═══════════ HELPERS ═══════════ */
function initials(n){return n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();}
function statusPill(score,target){
  if(score>=target) return '<span class="pill pill-met">Target Met</span>';
  if(score>=target-10) return '<span class="pill pill-close">Close to Target</span>';
  return '<span class="pill pill-below">Below Target</span>';
}
function barColor(score,target){ return score>=target?'#10B981':score>=target-10?'#F59E0B':'#EF4444'; }

/* ═══════════ TAB SWITCHING ═══════════ */
document.getElementById('mainTabs').addEventListener('click', e=>{
  const btn=e.target.closest('.ai-tab'); if(!btn) return;
  document.querySelectorAll('#mainTabs .ai-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+btn.dataset.tab).classList.add('active');
});
document.getElementById('subTabs').addEventListener('click', e=>{
  const btn=e.target.closest('.ai-tab'); if(!btn) return;
  document.querySelectorAll('#subTabs .ai-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const sub=btn.dataset.sub;
  document.getElementById('sub-dept').style.display = sub==='dept'?'block':'none';
  document.getElementById('sub-individual').style.display = sub==='individual'?'block':'none';
  if(sub==='dept'&&deptTrendChart){deptTrendChart.resize();deptCompareChart.resize();}
  if(sub==='individual'&&empTrendChart){empTrendChart.resize();scoreDonutChart.resize();}
});

/* ═══════════ DEPARTMENT PANEL ═══════════ */
let deptTrendChart, deptCompareChart;
function renderDept(){
  const dept = document.getElementById('deptSelect').value;
  const d = DEPARTMENTS[dept];
  const current = d.trend[d.trend.length-1];

  document.getElementById('deptStrip').innerHTML = `
    <div class="dept-strip-dot" style="background:${DEPT_COLOR[dept]}"></div>
    <div><div class="dept-strip-name">${dept} Department</div><div class="dept-strip-meta">${countEmp(dept)} employees · Q1 2026</div></div>
    <div class="dept-strip-score" style="color:${DEPT_COLOR[dept]}">${current}%</div>
    <div class="dept-strip-target">Target: ${d.target}%<br>${current>=d.target?'On target':'Below target by '+(d.target-current)+'%'}</div>`;

  document.getElementById('deptKpiBody').innerHTML = d.kpis.map(k=>`
    <tr>
      <td class="kpi-name-cell"><div class="kn">${k.name}</div></td>
      <td>${k.weight}%</td>
      <td><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${k.score}%;background:${barColor(k.score,k.target)}"></div></div>${k.score}%</td>
      <td>${k.target}%</td>
      <td>${statusPill(k.score,k.target)}</td>
    </tr>`).join('');

  if(deptTrendChart) deptTrendChart.destroy();
  deptTrendChart = new Chart(document.getElementById('deptTrendChart').getContext('2d'),{
    type:'line',
    data:{labels:QUARTERS,datasets:[
      {label:dept,data:d.trend,borderColor:DEPT_COLOR[dept],backgroundColor:DEPT_COLOR[dept],tension:.35,pointRadius:4},
      {label:'Org Average',data:ORG_TREND,borderColor:'#94A3B8',borderDash:[5,4],backgroundColor:'#94A3B8',tension:.35,pointRadius:3}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top',align:'end',labels:{boxWidth:12,boxHeight:12,color:'#475569',font:{size:11}}},
        tooltip:{callbacks:{label:ctx=>` ${ctx.dataset.label}: ${ctx.raw}%`}}},
      scales:{y:{min:55,max:100,ticks:{callback:v=>v+'%',color:'#94A3B8'},grid:{color:'#F1F5F9'}},
        x:{grid:{display:false},ticks:{color:'#64748B',font:{size:11}}}}}
  });

  if(deptCompareChart) deptCompareChart.destroy();
  const names = Object.keys(DEPARTMENTS);
  deptCompareChart = new Chart(document.getElementById('deptCompareChart').getContext('2d'),{
    type:'bar',
    data:{labels:names,datasets:[{label:'Q1 2026 Avg',
      data:names.map(n=>DEPARTMENTS[n].trend[4]),
      backgroundColor:names.map(n=>n===dept?DEPT_COLOR[n]:DEPT_COLOR[n]+'66'),
      borderRadius:5}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.raw}% avg score`}}},
      scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%',color:'#94A3B8'},grid:{color:'#F1F5F9'}},
        x:{grid:{display:false},ticks:{color:'#334155',font:{weight:'600',size:11}}}}}
  });
}
function countEmp(dept){ return EMPLOYEES.filter(e=>e.dept===dept).length; }

/* ═══════════ INDIVIDUAL PANEL ═══════════ */
let scoreDonutChart, empTrendChart;
function populateEmpSelect(){
  document.getElementById('empSelect').innerHTML = EMPLOYEES.map(e=>`<option value="${e.name}">${e.name} — ${e.dept}</option>`).join('');
}
function renderEmployee(){
  const name = document.getElementById('empSelect').value;
  const e = EMPLOYEES.find(x=>x.name===name);
  const deptAvg = DEPARTMENTS[e.dept].trend[4];
  const delta = e.pct - deptAvg;

  document.getElementById('finalScoreNum').textContent = e.final;
  document.getElementById('mgrLabel').textContent = e.mgr+' / 20';
  document.getElementById('hrLabel').textContent = e.hr+' / 5';
  document.getElementById('mgrBar').style.width = (e.mgr/20*100)+'%';
  document.getElementById('hrBar').style.width = (e.hr/5*100)+'%';
  document.getElementById('mgrBar').style.background = e.color;

  const deltaEl = document.getElementById('vsDeptDelta');
  deltaEl.className = 'score-delta '+(delta>=0?'delta-up':'delta-down');
  deltaEl.textContent = (delta>=0?'+':'')+delta+'% vs '+e.dept+' average';

  document.getElementById('empKpiBody').innerHTML = e.kpis.map(k=>`
    <tr>
      <td class="kpi-name-cell"><div class="kn">${k.name}</div></td>
      <td><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${k.score}%;background:${barColor(k.score,k.target)}"></div></div>${k.score}%</td>
      <td>${k.target}%</td>
      <td>${statusPill(k.score,k.target)}</td>
    </tr>`).join('');

  if(scoreDonutChart) scoreDonutChart.destroy();
  scoreDonutChart = new Chart(document.getElementById('scoreDonut').getContext('2d'),{
    type:'doughnut',
    data:{datasets:[{data:[e.final,25-e.final],backgroundColor:[e.color,'#F1F5F9'],borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'74%',
      plugins:{legend:{display:false},tooltip:{enabled:false}}}
  });

  if(empTrendChart) empTrendChart.destroy();
  empTrendChart = new Chart(document.getElementById('empTrendChart').getContext('2d'),{
    type:'line',
    data:{labels:QUARTERS,datasets:[
      {label:e.name,data:e.trend,borderColor:e.color,backgroundColor:e.color,tension:.35,pointRadius:4},
      {label:e.dept+' Avg',data:DEPARTMENTS[e.dept].trend.map(v=>Math.round(v/4)),borderColor:'#94A3B8',borderDash:[5,4],backgroundColor:'#94A3B8',tension:.35,pointRadius:3}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top',align:'end',labels:{boxWidth:12,boxHeight:12,color:'#475569',font:{size:11}}},
        tooltip:{callbacks:{label:ctx=>` ${ctx.dataset.label}: ${ctx.raw}/25`}}},
      scales:{y:{min:0,max:25,ticks:{color:'#94A3B8'},grid:{color:'#F1F5F9'}},
        x:{grid:{display:false},ticks:{color:'#64748B',font:{size:11}}}}}
  });
}

/* ═══════════ RECENT REPORTS ═══════════ */
function renderRecentReports(){
  document.getElementById('recentReportsBody').innerHTML = recentReports.map((r,i)=>`
    <tr class="${i===0&&r.isNew?'new-row':''}">
      <td class="report-name-cell">
        <div class="report-icon" style="background:${r.fmt==='PDF'?'#FEE2E2':'#D1FAE5'};color:${r.fmt==='PDF'?'#B91C1C':'#047857'}">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <strong>${r.name}</strong>
      </td>
      <td>${r.scope}</td><td>${r.cycle}</td><td>${r.by}</td><td>${r.date}</td>
      <td><span class="fmt-badge ${r.fmt==='PDF'?'fmt-pdf':'fmt-excel'}">${r.fmt}</span></td>
      <td><button class="btn-dl" onclick="downloadReport('${r.name.replace(/'/g,"\\'")}')">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Download</button></td>
    </tr>`).join('');
}
function generateReport(scope){
  const btn = event.target.closest('button');
  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Generating…';
  setTimeout(()=>{
    let name;
    if(scope==='dept'){
      const dept = document.getElementById('deptSelect').value;
      name = `${dept} – Department Report`;
    } else {
      const emp = document.getElementById('empSelect').value;
      name = `${emp} – Individual Report`;
    }
    recentReports.unshift({name,scope:scope==='dept'?'Department':'Individual',cycle:'Q1 2026',by:'Robert Hayes',date:'Today',fmt:'PDF',isNew:true});
    renderRecentReports();
    btn.disabled = false;
    btn.innerHTML = origText;
    showToast('success', `"${name}" generated and added to Recent Reports.`);
  },900);
}
function downloadReport(name){ showToast('info', `Downloading "${name}"…`); }

/* ═══════════ AI ANALYTICS REPORTS PANEL ═══════════ */
function renderAIReports(){
  const predictions = [
    {name:'Amir Habib',cur:84,pred:88},{name:'Ahmed Mujtaba',cur:92,pred:96},{name:'Fatima Malik',cur:88,pred:92},
    {name:'Sara Ahmed',cur:76,pred:80},{name:'Asif Khan',cur:80,pred:84},{name:'Nauman Manzoor',cur:68,pred:76},
    {name:'Emily Chen',cur:96,pred:96},{name:'Omer Yar',cur:72,pred:68}
  ];
  document.getElementById('predMiniList').innerHTML = predictions.slice(0,4).map(p=>{
    const up = p.pred>=p.cur;
    return `<div class="row"><span>${p.name}</span><strong style="color:${up?'#059669':'#DC2626'}">${p.cur}% → ${p.pred}%</strong></div>`;
  }).join('');

  const CLUSTER = s=>s>=85?'High Performer':s>=75?'Steady Performer':'Needs Improvement';
  const BIAS = n=>['Fatima Malik'].includes(n)?'Reviewer Flagged':'—';
  document.getElementById('aiSummaryBody').innerHTML = predictions.map(p=>{
    const emp = EMPLOYEES.find(e=>e.name===p.name);
    const up = p.pred>=p.cur;
    return `<tr>
      <td><div class="emp-cell"><div class="emp-av" style="background:${emp.color}">${initials(p.name)}</div><span class="emp-name">${p.name}</span></div></td>
      <td>${emp.dept}</td>
      <td style="color:${up?'#059669':'#DC2626'};font-weight:700">${p.cur}% → ${p.pred}% ${up?'↑':'↓'}</td>
      <td>${CLUSTER(p.cur)}</td>
      <td>${BIAS(p.name)==='—'?'—':'<span class="pill pill-close">Flagged</span>'}</td>
    </tr>`;
  }).join('');
}

/* ═══════════ EXPORT ACTIONS ═══════════ */
function exportPDF(){ showToast('info','Opening print dialog — choose "Save as PDF" in the destination list.'); setTimeout(()=>window.print(),400); }
function exportExcel(){
  let csv = 'Report,Scope,Cycle,Generated By,Date,Format\n';
  recentReports.forEach(r=>{ csv += `"${r.name}",${r.scope},${r.cycle},${r.by},${r.date},${r.fmt}\n`; });
  downloadCSV(csv,'reports_log.csv');
  showToast('success','Recent Reports exported as reports_log.csv.');
}
function exportAISummary(){
  let csv = 'Employee,Department,Current,Predicted,Cluster,BiasFlag\n';
  document.querySelectorAll('#aiSummaryBody tr').forEach(tr=>{
    const cells=[...tr.children].map(td=>td.textContent.trim().replace(/,/g,';'));
    csv += cells.join(',')+'\n';
  });
  downloadCSV(csv,'ai_analytics_summary.csv');
  showToast('success','AI Analytics summary exported as CSV.');
}
function downloadCSV(content, filename){
  const blob = new Blob([content], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ═══════════ TOAST ═══════════ */
function showToast(type,msg){
  const icons={
    success:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`${icons[type]||icons.info}<span>${msg}</span>`;
  document.getElementById('toastCtr').appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),400)},3400);
}

/* ═══════════ INIT ═══════════ */
renderDept();
populateEmpSelect();
renderEmployee();
renderRecentReports();
renderAIReports();
