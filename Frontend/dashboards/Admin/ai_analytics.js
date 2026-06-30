/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — Admin Dashboard (AI Analytics & Insights)            ║
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
  ║    - ReportDto: Backend/dtos/report/ReportDto.cs               ║
  ║    - DepartmentReportDto: Backend/dtos/report/DepartmentReportDto.cs
  ║    - EvaluationDetailDto: Backend/dtos/evaluation/EvaluationDetailDto.cs
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ───────── DATA ───────── */
const employees = [
 {name:'Amir Habib',dept:'Development',color:'#1D4ED8',current:84,predicted:88,confidence:92,quality:85,delivery:84,
  reason:'3-quarter trend shows Code Quality improving (+2.1 pts/quarter) while Productivity holds steady. The regression model projects an 88% score next cycle (R² = 0.87).'},
 {name:'Sara Ahmed',dept:'QA',color:'#8B5CF6',current:76,predicted:80,confidence:88,quality:78,delivery:75,
  reason:'Defect Leakage Rate has improved in each of the last 3 cycles (−1.8% / quarter). The model projects continued improvement to 80% (R² = 0.84).'},
 {name:'Omer Yar',dept:'Development',color:'#10B981',current:72,predicted:68,confidence:85,quality:70,delivery:73,
  reason:'Spillover Ratio rose from 8% to 14% over 2 cycles, alongside more code-review defects per PR. If this trend continues, the model projects a 4-point dip to 68% (R² = 0.81).'},
 {name:'Ahmed Mujtaba',dept:'BA',color:'#0891B2',current:92,predicted:96,confidence:94,quality:95,delivery:90,
  reason:'Documentation completeness and stakeholder-satisfaction scores have trended upward for 3 consecutive cycles. The model projects 96% next cycle (R² = 0.90).'},
 {name:'Fatima Malik',dept:'Development',color:'#F59E0B',current:88,predicted:92,confidence:90,quality:90,delivery:87,
  reason:'Technical ownership and incident-response metrics show consistent improvement — MTTR dropped from 48 min to 22 min over 2 cycles. The model projects 92% (R² = 0.88).'},
 {name:'Asif Khan',dept:'PM',color:'#0F766E',current:80,predicted:84,confidence:87,quality:82,delivery:79,
  reason:'Schedule predictability has improved steadily as scope-change frequency declined. The model projects 84% next cycle (R² = 0.83).'},
 {name:'Emily Chen',dept:'QA',color:'#B45309',current:96,predicted:96,confidence:95,quality:97,delivery:95,
  reason:'Already at the upper bound of historical scores (94–96% range) for 3 cycles — the model projects a plateau at 96% (R² = 0.91).'},
 {name:'Nauman Manzoor',dept:'HR',color:'#EF4444',current:68,predicted:76,confidence:82,quality:65,delivery:70,
  reason:'Reporting consistency improved sharply this cycle (+9% vs. last). If sustained, the model projects a rebound to 76% (R² = 0.79).'},
];

const CLUSTER_META = {
 high:{title:'High Performers',color:'#10B981',bg:'#ECFDF5',
  desc:'Consistently exceeds targets across most KPIs. Strong candidates for stretch assignments or leadership development.',
  icon:'<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>'},
 steady:{title:'Steady Performers',color:'#3B82F6',bg:'#EFF6FF',
  desc:'Meets expectations overall, with 1–2 KPI areas identified for targeted growth this cycle.',
  icon:'<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'},
 needs:{title:'Needs Improvement',color:'#F59E0B',bg:'#FFFBEB',
  desc:'Below target on multiple KPIs this cycle. Recommend a structured improvement plan with regular manager check-ins.',
  icon:'<path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>'},
};
function clusterOf(score){ return score>=85?'high':score>=75?'steady':'needs'; }

const managers=[
 {name:'Fatima Malik',avg:18.6,count:2,flagged:true},
 {name:'Asif Khan',avg:16.5,count:1,flagged:false},
 {name:'Sara Ahmed',avg:15.2,count:1,flagged:false},
 {name:'Nauman Manzoor',avg:14.8,count:3,flagged:false},
];
const ORG_AVG=15.5;

const flaggedEvals=[
 {emp:'Amir Habib',mgr:'Fatima Malik',given:18,deptAvg:15.5,dev:'+2.5',status:'review'},
 {emp:'Omer Yar',mgr:'Fatima Malik',given:19,deptAvg:15.5,dev:'+3.5',status:'review'},
];

const feedbackData=[
 {name:'Amir Habib',dept:'Development',score:84,color:'#1D4ED8',strengths:['Requirement Understanding','Code Quality'],improve:['Review Turnaround'],
  a:'Strong grasp of requirements with minimal rework this quarter. Sprint commitment held at 92%, though code review turnaround could be faster.',
  b:'Code commits show consistent adherence to the style guide (98% lint-pass rate). Consider taking ownership of the upcoming auth-module refactor to build technical leadership experience.'},
 {name:'Sara Ahmed',dept:'QA',score:76,color:'#8B5CF6',strengths:['Defect Detection','Ownership'],improve:['Automation Coverage'],
  a:'Defect leakage stayed below target with proactive root-cause analysis on 3 critical issues. API automation coverage grew 12% — continued investment here will compound returns next cycle.',
  b:'Regression suite execution time decreased by 18% after recent automation additions. A strong candidate to lead the API regression framework migration next quarter.'},
 {name:'Omer Yar',dept:'Development',score:72,color:'#10B981',strengths:['Delivery Consistency'],improve:['Spillover Management','Estimation'],
  a:'Delivery pace remained steady, but spillover ratio rose to 14% (target < 10%). Pairing with a senior developer for the next two sprints is recommended to reinforce estimation accuracy.',
  b:'Three of five sprint goals were met without rework. Writing acceptance criteria before development begins would help reduce mid-sprint scope clarification requests.'},
 {name:'Ahmed Mujtaba',dept:'BA',score:92,color:'#0891B2',strengths:['Documentation','Communication'],improve:['Mentoring Opportunity'],
  a:'Documentation clarity and stakeholder communication remain benchmark-level across the team. A strong candidate to mentor junior BAs on requirement-gathering techniques this quarter.',
  b:'BRD revisions per project dropped from 4 to 1 this quarter — a strong signal of upfront requirement clarity. Recommend leading the next stakeholder workshop series.'},
 {name:'Fatima Malik',dept:'Development',score:88,color:'#F59E0B',strengths:['Technical Ownership','Documentation'],improve:['Knowledge Sharing'],
  a:'Consistently strong technical ownership with zero unresolved production incidents this quarter. HLD/LLD documentation was completed ahead of schedule for all three assigned modules.',
  b:'Mean time to recovery on the one production incident this quarter was 22 minutes, well under the 1-hour target, a great example for the team incident-response playbook.'},
 {name:'Asif Khan',dept:'PM',score:80,color:'#0F766E',strengths:['Schedule Management','Scope Control'],improve:['Risk Reporting Frequency'],
  a:'Schedule predictability held within 5% of plan across all milestones. Two change requests were processed without timeline impact — strong scope control this cycle.',
  b:'Resource allocation across the two active projects stayed within 5% of forecast. Increasing the frequency of risk-log reviews could surface emerging issues even earlier.'},
 {name:'Emily Chen',dept:'QA',score:96,color:'#B45309',strengths:['API Testing','Quality Standards'],improve:['Knowledge Sharing'],
  a:'Exceptional quarter — all KPI targets exceeded, including a 99.2% API success rate. Consider a cross-team automation workshop to share testing strategies.',
  b:'Automation coverage for API tests now sits at 91%, the highest in QA. Pairing with newer QA hires this quarter would help transfer this expertise across the team.'},
 {name:'Nauman Manzoor',dept:'HR',score:68,color:'#EF4444',strengths:['Reporting Consistency'],improve:['Resource Utilization Tracking'],
  a:'Reporting consistency improved from last quarter, though resource-utilization tracking still shows gaps for two departments. Recommend a structured weekly sync with department leads.',
  b:'Employee satisfaction survey participation rose to 87%, the highest this year. Closing the loop on survey feedback with visible action items would further boost engagement.'},
];

const optimizations={
 Development:[
  {kpi:'Code Quality & Maintainability',current:20,suggested:24,
   reason:'Strongest positive correlation with final performance outcomes of any Development KPI this cycle (<strong>r = 0.82</strong>) — increasing its weight better reflects its impact on long-term stability.'},
  {kpi:'Learning, Innovation & Technical Growth',current:5,suggested:8,
   reason:'Employees scoring ≥80% here show measurably faster skill progression and shorter ramp-up time on new technologies (<strong>r = 0.71</strong> with quarter-over-quarter improvement).'},
  {kpi:'Team & Process Efficiency',current:10,suggested:7,
   reason:'Lowest correlation with final scores among Development KPIs (<strong>r = 0.31</strong>) — the current weight slightly overstates its impact.'},
  {kpi:'Productivity & Delivery',current:20,suggested:16,
   reason:'Already well-tracked via sprint tooling; correlation with final score (<strong>r = 0.58</strong>) suggests the current weight is slightly high relative to other KPIs.'},
 ],
 QA:[
  {kpi:'API Test Coverage & Defect Detection',current:25,suggested:30,
   reason:'Highest predictive value for production stability (<strong>r = 0.79</strong>) — API-level defects are roughly 3× more costly to fix post-release than UI-level defects.'},
  {kpi:'Individual SQA Performance',current:15,suggested:10,
   reason:'This appraisal-style metric shows high variance across evaluators (<strong>σ = 4.2</strong>) — reducing its weight limits the impact of evaluator-specific scoring bias.'},
 ],
 HR:[
  {kpi:'Schedule Predictability Index',current:25,suggested:22,
   reason:'Correlation with overall HR effectiveness (<strong>r = 0.61</strong>) is moderate; the current weight slightly overstates its role relative to documentation quality.'},
  {kpi:'Reporting, Documentation & Process Compliance',current:15,suggested:18,
   reason:'Strongly linked to audit readiness and cross-team handoff quality (<strong>r = 0.74</strong>) — currently under-weighted relative to its impact.'},
 ],
 BA:[
  {kpi:'CBAP',current:35,suggested:32,
   reason:'High weight given a limited pool of certification holders; correlation with delivery quality is moderate (<strong>r = 0.55</strong>) compared to communication-based KPIs.'},
  {kpi:'Soft Skills & Communication',current:35,suggested:38,
   reason:'The strongest predictor of stakeholder-satisfaction scores across all BA evaluations this cycle (<strong>r = 0.81</strong>).'},
 ],
 PM:[
  {kpi:'Schedule Predictability Index',current:30,suggested:27,
   reason:'Still the top PM KPI, but slightly over-weighted relative to Resource Utilization in driving overall delivery success this cycle.'},
  {kpi:'Resource Utilization Efficiency',current:25,suggested:28,
   reason:'Strong correlation (<strong>r = 0.76</strong>) with reduced rework ratio and on-time delivery across all PM-led projects.'},
 ],
};

/* ───────── HELPERS ───────── */
function initials(n){return n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();}
const TREND_ICONS={
 up:'<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>',
 down:'<path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>',
 flat:'<path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>',
};

/* ───────── TAB SWITCHING ───────── */
document.getElementById('mainTabs').addEventListener('click', e=>{
  const btn=e.target.closest('.ai-tab'); if(!btn) return;
  document.querySelectorAll('#mainTabs .ai-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const tab=btn.dataset.tab;
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+tab).classList.add('active');
  if(tab==='clustering'&&clusterChart) clusterChart.resize();
  if(tab==='bias'&&biasChart) biasChart.resize();
  if(tab==='prediction'&&predictionChart) predictionChart.resize();
});

/* ───────── WHY TOGGLE (generic) ───────── */
function toggleWhy(btn){
  btn.classList.toggle('open');
  let panel = btn.nextElementSibling;
  if(!panel || !panel.classList.contains('why-panel')){
    panel = btn.parentElement.querySelector('.why-panel');
  }
  panel.classList.toggle('open');
}

/* ════════ PREDICTION ════════ */
let predictionChart;
function buildPredictionChart(){
  const ctx=document.getElementById('predictionChart').getContext('2d');
  predictionChart=new Chart(ctx,{
    type:'bar',
    data:{
      labels: employees.map(e=>e.name.split(' ')[0]+' '+e.name.split(' ')[1][0]+'.'),
      datasets:[
        {label:'Current (Q1)',data:employees.map(e=>e.current),backgroundColor:'#CBD5E1',borderRadius:5},
        {label:'Predicted (Q2)',data:employees.map(e=>e.predicted),backgroundColor:'#8B5CF6',borderRadius:5}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'top',align:'end',labels:{boxWidth:12,boxHeight:12,color:'#475569',font:{size:12}}},
        tooltip:{callbacks:{label:ctx=>`  ${ctx.dataset.label}: ${ctx.raw}%`}}
      },
      scales:{
        y:{min:0,max:100,ticks:{callback:v=>v+'%',color:'#94A3B8'},grid:{color:'#F1F5F9'}},
        x:{grid:{display:false},ticks:{color:'#334155',font:{weight:'600',size:12}}}
      }
    }
  });
}

function renderPrediction(){
  const tbody=document.getElementById('predictionBody');
  tbody.innerHTML = employees.map((e,i)=>{
    const delta=e.predicted-e.current;
    const tClass = delta>0?'trend-up':delta<0?'trend-down':'trend-flat';
    const tIcon  = delta>0?TREND_ICONS.up:delta<0?TREND_ICONS.down:TREND_ICONS.flat;
    const tText  = (delta>0?'+':'')+delta+'%';
    const confColor = e.confidence>=90?'var(--green)':e.confidence>=80?'var(--primary)':'var(--amber)';
    return `
    <tr class="main-row">
      <td><div class="emp-cell"><div class="emp-av" style="background:${e.color}">${initials(e.name)}</div><span class="emp-name">${e.name}</span></div></td>
      <td style="color:var(--txt-light)">${e.dept}</td>
      <td><strong>${e.current}%</strong> <span style="color:var(--txt-faint);font-size:12px">(${Math.round(e.current*25/100)}/25)</span></td>
      <td><strong style="color:var(--purple)">${e.predicted}%</strong> <span style="color:var(--txt-faint);font-size:12px">(${Math.round(e.predicted*25/100)}/25)</span></td>
      <td><span class="trend-badge ${tClass}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${tIcon}</svg>${tText}</span></td>
      <td><div class="conf-wrap"><div class="conf-track"><div class="conf-fill" style="width:${e.confidence}%;background:${confColor}"></div></div><span class="conf-label">${e.confidence}%</span></div></td>
      <td>
        <button class="why-btn" onclick="toggleWhy(this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Why? <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </td>
    </tr>
    <tr class="detail-row"><td colspan="7">
      <div class="why-panel"><div class="why-panel-inner">${e.reason}</div></div>
    </td></tr>`;
  }).join('');
}

function runPrediction(){
  const btn=document.getElementById('runPredBtn');
  const overlay=document.getElementById('predLoading');
  btn.disabled=true; overlay.classList.add('show');
  predictionChart.reset();
  setTimeout(()=>{
    predictionChart.update();
    overlay.classList.remove('show'); btn.disabled=false;
    showToast('success','Prediction model executed — 8 employees analyzed (R² = 0.87).');
  },1100);
}

/* ════════ CLUSTERING ════════ */
let clusterChart;
function renderClustering(){
  const grid=document.getElementById('clusterGrid');
  grid.innerHTML = Object.entries(CLUSTER_META).map(([key,meta])=>{
    const members = employees.filter(e=>clusterOf(e.current)===key);
    return `<div class="cluster-card" style="--cc-color:${meta.color}">
      <div class="cluster-card-top">
        <div class="cluster-icon" style="background:${meta.bg};color:${meta.color}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${meta.icon}</svg></div>
        <div><div class="cluster-title">${meta.title}</div><div class="cluster-count">${members.length} employee${members.length!==1?'s':''}</div></div>
      </div>
      <p class="cluster-desc">${meta.desc}</p>
      <div class="cluster-chips">
        ${members.map(m=>`<div class="cluster-chip"><div class="chip-av" style="background:${m.color}">${initials(m.name)}</div><span>${m.name}</span><span class="chip-score">${m.current}%</span></div>`).join('')}
      </div>
    </div>`;
  }).join('');

  const ctx=document.getElementById('clusterChart').getContext('2d');
  const datasets = Object.entries(CLUSTER_META).map(([key,meta])=>({
    label: meta.title,
    data: employees.filter(e=>clusterOf(e.current)===key).map(e=>({x:e.delivery,y:e.quality,name:e.name})),
    backgroundColor: meta.color,
    pointRadius:7, pointHoverRadius:9
  }));
  clusterChart=new Chart(ctx,{
    type:'scatter',
    data:{datasets},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'top',align:'end',labels:{boxWidth:12,boxHeight:12,color:'#475569',font:{size:12}}},
        tooltip:{callbacks:{label:ctx=>` ${ctx.raw.name}: Delivery ${ctx.raw.x}% · Quality ${ctx.raw.y}%`}}
      },
      scales:{
        x:{title:{display:true,text:'Delivery Score (%)',color:'#94A3B8',font:{size:11}},min:60,max:100,grid:{color:'#F1F5F9'},ticks:{color:'#94A3B8'}},
        y:{title:{display:true,text:'Quality Score (%)',color:'#94A3B8',font:{size:11}},min:60,max:100,grid:{color:'#F1F5F9'},ticks:{color:'#94A3B8'}}
      }
    }
  });
}

/* ════════ BIAS ════════ */
let biasChart;
function renderBias(){
  document.getElementById('biasAlerts').innerHTML = `
    <div class="alert-card">
      <div class="alert-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
      <div class="alert-body">
        <div class="alert-title">Potential Leniency Bias — Fatima Malik</div>
        <div class="alert-text">Average manager score of <strong>18.6 / 20</strong> is <strong>+3.1 points</strong> above the organizational
        average (15.5 / 20) across 2 evaluations — exceeding the ±2.0 flag threshold.</div>
        <button class="why-btn" onclick="toggleWhy(this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Why this matters <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div class="why-panel"><div class="why-panel-inner">
          Consistently high scores can reduce the discriminative power of evaluations, making it harder to identify employees
          who need support. <strong>Recommended action:</strong> peer-review Fatima Malik's Q1 2026 evaluations with a second
          manager, or schedule a calibration session with HR before Q2 scoring begins.
        </div></div>
      </div>
    </div>
    <div class="alert-card amber-alert">
      <div class="alert-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
      <div class="alert-body">
        <div class="alert-title">Low Score Variance — HR Department</div>
        <div class="alert-text">All HR evaluations this cycle fall within a <strong>2.0-point range</strong> (14–16 / 20), compared to
        an organization-wide standard deviation of <strong>2.4 points</strong>.</div>
        <button class="why-btn" onclick="toggleWhy(this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Why this matters <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div class="why-panel"><div class="why-panel-inner">
          Low variance can mask genuine performance differences between team members. <strong>Recommended action:</strong>
          review HR's evaluation rubric for clearer differentiation criteria between "meets expectations" and "exceeds expectations" tiers.
        </div></div>
      </div>
    </div>`;

  const ctx=document.getElementById('biasChart').getContext('2d');
  biasChart=new Chart(ctx,{
    type:'bar',
    data:{
      labels: managers.map(m=>m.name),
      datasets:[{label:'Avg Score (out of 20)',data:managers.map(m=>m.avg),
        backgroundColor:managers.map(m=>m.flagged?'#EF4444':'#3B82F6'),borderRadius:5}]
    },
    options:{
      indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.raw}/20 avg (${managers[ctx.dataIndex].count} eval${managers[ctx.dataIndex].count!==1?'s':''})`}}},
      scales:{
        x:{min:0,max:20,grid:{color:'#F1F5F9'},ticks:{color:'#94A3B8'}},
        y:{grid:{display:false},ticks:{color:'#334155',font:{weight:'600',size:12}}}
      }
    }
  });

  const tbody=document.getElementById('flaggedBody');
  tbody.innerHTML = flaggedEvals.map((f,i)=>`
    <tr class="main-row" id="frow-${i}">
      <td><strong>${f.emp}</strong></td>
      <td>${f.mgr}</td>
      <td>${f.given} / 20</td>
      <td>${f.deptAvg} / 20</td>
      <td style="color:var(--red);font-weight:700">${f.dev}</td>
      <td>
        <span class="pill ${f.status==='review'?'pill-review':'pill-reviewed'}" id="fpill-${i}">${f.status==='review'?'Under Review':'Reviewed'}</span>
        <button class="btn-mini" id="fbtn-${i}" style="margin-left:8px" ${f.status!=='review'?'disabled':''} onclick="markReviewed(${i})">
          ${f.status==='review'?'Mark as Reviewed':'Done'}
        </button>
      </td>
    </tr>`).join('');
}

function markReviewed(i){
  flaggedEvals[i].status='reviewed';
  document.getElementById(`fpill-${i}`).className='pill pill-reviewed';
  document.getElementById(`fpill-${i}`).textContent='Reviewed';
  const btn=document.getElementById(`fbtn-${i}`);
  btn.disabled=true; btn.textContent='Done';
  showToast('success',`Evaluation for ${flaggedEvals[i].emp} marked as reviewed.`);
}

/* ════════ FEEDBACK ════════ */
function renderFeedback(){
  const grid=document.getElementById('feedbackGrid');
  grid.innerHTML = feedbackData.map((f,i)=>`
    <div class="feedback-card" id="fb-${i}">
      <div class="fb-header">
        <div class="emp-cell">
          <div class="emp-av" style="background:${f.color}">${initials(f.name)}</div>
          <div><div class="u-name">${f.name}</div><div class="u-meta">${f.dept} · Score ${f.score}%</div></div>
        </div>
        <span class="ai-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>AI Generated</span>
      </div>
      <p class="fb-text" id="fbtext-${i}">${f.a}</p>
      <div class="fb-tags">
        ${f.strengths.map(t=>`<span class="tag tag-strength">${t}</span>`).join('')}
        ${f.improve.map(t=>`<span class="tag tag-improve">${t}</span>`).join('')}
      </div>
      <div class="fb-footer">
        <span class="fb-source">Generated from Q1 2026 evaluation data · gpt-4o</span>
        <button class="btn-regen" id="regen-${i}" onclick="regenFeedback(${i})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Regenerate
        </button>
      </div>
    </div>`).join('');
  feedbackData.forEach(f=>f.state='a');
}

function regenFeedback(i){
  const textEl=document.getElementById(`fbtext-${i}`);
  const btn=document.getElementById(`regen-${i}`);
  btn.disabled=true;
  textEl.innerHTML = `<span class="loading-dots"><span></span><span></span><span></span></span>`;
  setTimeout(()=>{
    const f=feedbackData[i];
    f.state = f.state==='a'?'b':'a';
    textEl.textContent = f.state==='a'?f.a:f.b;
    btn.disabled=false;
    showToast('info', `Feedback regenerated for ${f.name}.`);
  },800);
}

function generateAllFeedback(){
  feedbackData.forEach((f,i)=>{
    const textEl=document.getElementById(`fbtext-${i}`);
    textEl.innerHTML = `<span class="loading-dots"><span></span><span></span><span></span></span>`;
  });
  setTimeout(()=>{
    feedbackData.forEach((f,i)=>{
      f.state = f.state==='a'?'b':'a';
      document.getElementById(`fbtext-${i}`).textContent = f.state==='a'?f.a:f.b;
    });
    showToast('success','AI feedback regenerated for 8 employees.');
  },1000);
}

/* ════════ OPTIMIZATION ════════ */
let optActiveDept='Development';
function renderOptTabs(){
  const tabs=document.getElementById('optTabs');
  tabs.innerHTML = Object.keys(optimizations).map(d=>
    `<button class="ai-tab sub ${d===optActiveDept?'active':''}" onclick="setOptDept('${d}')">${d}</button>`
  ).join('');
}
function setOptDept(d){ optActiveDept=d; renderOptTabs(); renderOptGrid(); }

function renderOptGrid(){
  const grid=document.getElementById('optGrid');
  grid.innerHTML = optimizations[optActiveDept].map((item,idx)=>{
    const delta=item.suggested-item.current;
    const sign=delta>0?'+':'';
    const color=delta>0?'var(--green)':'var(--red)';
    const id=`opt-${optActiveDept}-${idx}`;
    return `<div class="opt-card" id="${id}">
      <div class="opt-card-top">
        <div><div class="opt-kpi-name">${item.kpi}</div><div class="opt-dept-tag">${optActiveDept}</div></div>
        <div class="opt-delta" style="color:${color}" id="${id}-delta">${sign}${delta}%</div>
      </div>
      <div class="weight-compare">
        <div class="wc-row"><span>Current</span><div class="wc-track"><div class="wc-fill wc-current" style="width:${item.current}%" id="${id}-cur"></div></div><span class="wc-val" id="${id}-curval">${item.current}%</span></div>
        <div class="wc-row"><span>Suggested</span><div class="wc-track"><div class="wc-fill wc-suggested" style="width:${item.suggested}%"></div></div><span class="wc-val">${item.suggested}%</span></div>
      </div>
      <button class="why-btn" onclick="toggleWhy(this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Why this suggestion? <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </button>
      <div class="why-panel"><div class="why-panel-inner">${item.reason}</div></div>
      <button class="btn-apply" id="${id}-btn" onclick="applyOpt('${id}',${idx})">Apply Suggestion</button>
    </div>`;
  }).join('');
}

function applyOpt(id, idx){
  const item = optimizations[optActiveDept][idx];
  document.getElementById(`${id}-cur`).style.width = item.suggested+'%';
  document.getElementById(`${id}-curval`).textContent = item.suggested+'%';
  document.getElementById(`${id}-delta`).textContent = '0%';
  document.getElementById(`${id}-delta`).style.color = 'var(--txt-faint)';
  const btn=document.getElementById(`${id}-btn`);
  btn.textContent='Applied ✓'; btn.classList.add('applied-btn'); btn.disabled=true;
  document.getElementById(id).classList.add('applied');
  showToast('success', `Weight updated: "${item.kpi}" is now ${item.suggested}%.`);
}

/* ════════ TOAST ════════ */
function showToast(type,msg){
  const icons={
    success:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
  };
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`${icons[type]||icons.info}<span>${msg}</span>`;
  document.getElementById('toastCtr').appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),400)},3400);
}

/* ════════ INIT ════════ */
buildPredictionChart();
renderPrediction();
renderClustering();
renderBias();
renderFeedback();
renderOptTabs();
renderOptGrid();
