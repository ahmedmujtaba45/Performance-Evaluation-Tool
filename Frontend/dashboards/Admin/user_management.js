/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — Admin Dashboard (User Management)                   ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: UsersController                                 ║
  ║    Path: Backend/controllers/UsersController.cs                ║
  ║    Endpoints: GET /api/users                                   ║
  ║                GET /api/users/{id}                             ║
  ║                POST /api/users                                 ║
  ║                PUT /api/users/{id}                             ║
  ║                DELETE /api/users/{id}                          ║
  ║                PUT /api/users/{id}/status                      ║
  ║                                                                ║
  ║  • Service: IUserService                                       ║
  ║    Path: Backend/services/IUserService.cs                      ║
  ║    Implementation: Backend/services/UserService.cs             ║
  ║                                                                ║
  ║  • DTOs:                                                        ║
  ║    - CreateUserDto: Backend/dtos/user/CreateUserDto.cs         ║
  ║    - UpdateUserDto: Backend/dtos/user/UpdateUserDto.cs         ║
  ║    - UserDetailDto: Backend/dtos/user/UserDetailDto.cs         ║
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ──────────────────────────────────────
   DATA STORE
────────────────────────────────────── */
const AVATAR_COLORS = ['#1D4ED8','#10B981','#F59E0B','#8B5CF6','#EF4444','#0891B2','#0F766E','#B45309'];
let users = [
  { id:1, name:'Robert Hayes',    email:'robert.hayes@evaluai.com',  role:'Admin',        department:'HR',          joined:'2024-01-10', status:'active',   phone:'+92 300 1234567' },
  { id:2, name:'Amir Habib',      email:'amir.habib@evaluai.com',    role:'Employee',     department:'Development', joined:'2024-03-15', status:'active',   phone:'+92 321 9876543' },
  { id:3, name:'Sara Ahmed',      email:'sara.ahmed@evaluai.com',    role:'Line Manager', department:'QA',          joined:'2024-02-20', status:'active',   phone:'+92 333 1122334' },
  { id:4, name:'Nauman Manzoor',  email:'nauman.m@evaluai.com',      role:'HR Manager',   department:'HR',          joined:'2024-04-05', status:'inactive', phone:'+92 345 6677889' },
  { id:5, name:'Ahmed Mujtaba',   email:'ahmed.m@evaluai.com',       role:'Employee',     department:'BA',          joined:'2024-05-01', status:'active',   phone:'+92 311 2233445' },
  { id:6, name:'Omer Yar',        email:'omer.yar@evaluai.com',      role:'Employee',     department:'Development', joined:'2024-03-22', status:'active',   phone:'+92 300 9988776' },
  { id:7, name:'Fatima Malik',    email:'fatima.m@evaluai.com',      role:'Line Manager', department:'Development', joined:'2024-06-10', status:'inactive', phone:'+92 322 5544332' },
  { id:8, name:'Asif Khan',       email:'asif.khan@evaluai.com',     role:'Employee',     department:'PM',          joined:'2024-07-18', status:'active',   phone:'+92 312 6677001' },
];
let nextId = 9;

let filteredUsers = [...users];
let selectedIds   = new Set();
let deleteTargetId = null;
let editTargetId   = null;
let viewTargetId   = null;
let sortKey = null, sortDir = 1;
const PAGE_SIZE = 6;
let currentPage = 1;

/* ──────────────────────────────────────
   RENDER
────────────────────────────────────── */
function getInitials(name){ return name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function getColor(id){ return AVATAR_COLORS[(id-1) % AVATAR_COLORS.length]; }

function roleBadge(role){
  const map = {
    'Admin':        'badge-admin',
    'HR Manager':   'badge-hr',
    'Line Manager': 'badge-manager',
    'Employee':     'badge-employee'
  };
  return `<span class="badge ${map[role]||'badge-employee'}">${role}</span>`;
}

function fmtDate(d){ const dt=new Date(d); return dt.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}); }

function renderTable(){
  const start = (currentPage-1)*PAGE_SIZE;
  const page  = filteredUsers.slice(start, start+PAGE_SIZE);
  const tbody = document.getElementById('tableBody');
  if(!page.length){
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-faint);">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;margin:0 auto 10px;display:block;opacity:.4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1m8 0a4 4 0 014-4h1a4 4 0 014 4v1M13 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      No users found matching your filters.
    </td></tr>`;
    renderPagination();
    updateStats();
    return;
  }
  tbody.innerHTML = page.map(u => `
    <tr class="${selectedIds.has(u.id)?'selected':''}" id="row-${u.id}">
      <td class="cb-cell">
        <input type="checkbox" class="cb row-cb" data-id="${u.id}"
          ${selectedIds.has(u.id)?'checked':''} onchange="toggleRow(${u.id},this)"/>
      </td>
      <td>
        <div class="user-cell">
          <div class="user-av" style="background:${getColor(u.id)}">${getInitials(u.name)}</div>
          <div class="user-info">
            <div class="u-name">${u.name}</div>
            <div class="u-email">${u.email}</div>
          </div>
        </div>
      </td>
      <td>${roleBadge(u.role)}</td>
      <td style="color:var(--text-mid);font-weight:500">${u.department}</td>
      <td style="color:var(--text-light)">${fmtDate(u.joined)}</td>
      <td>
        <div class="status-cell">
          <label class="toggle-switch">
            <input type="checkbox" ${u.status==='active'?'checked':''}
              onchange="toggleStatus(${u.id},this)"/>
            <span class="toggle-slider"></span>
          </label>
          <span class="status-label ${u.status==='active'?'active':''}" id="stlbl-${u.id}">
            ${u.status==='active'?'Active':'Inactive'}
          </span>
        </div>
      </td>
      <td>
        <div class="action-btns">
          <button class="act-btn view" title="View" onclick="openViewModal(${u.id})">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
          <button class="act-btn edit" title="Edit" onclick="openEditModal(${u.id})">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="act-btn del" title="Delete" onclick="openDeleteModal(${u.id})">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  renderPagination();
  updateStats();
  syncSelectAll();
}

function renderPagination(){
  const total = filteredUsers.length;
  const pages = Math.ceil(total/PAGE_SIZE);
  const start = Math.min((currentPage-1)*PAGE_SIZE+1, total);
  const end   = Math.min(currentPage*PAGE_SIZE, total);
  document.getElementById('pgShowing').textContent = total ? `${start}–${end}` : '0';
  document.getElementById('pgTotal').textContent   = total;
  const ctrl = document.getElementById('pgControls');
  let html = `<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
  </button>`;
  for(let i=1;i<=pages;i++){
    html += `<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===pages||!pages?'disabled':''}>
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
  </button>`;
  ctrl.innerHTML = html;
}

function goPage(p){
  const pages = Math.ceil(filteredUsers.length/PAGE_SIZE);
  if(p<1||p>pages) return;
  currentPage = p;
  renderTable();
}

function updateStats(){
  const active   = users.filter(u=>u.status==='active').length;
  const inactive = users.filter(u=>u.status==='inactive').length;
  document.getElementById('stat-total').textContent    = users.length;
  document.getElementById('stat-active').textContent   = active;
  document.getElementById('stat-inactive').textContent = inactive;
}

/* ──────────────────────────────────────
   SEARCH / FILTER / SORT
────────────────────────────────────── */
function applyFilters(){
  const q    = document.getElementById('searchInput').value.toLowerCase();
  const role = document.getElementById('roleFilter').value;
  const dept = document.getElementById('deptFilter').value;
  const stat = document.getElementById('statusFilter').value;
  filteredUsers = users.filter(u =>
    (!q    || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
    (!role || u.role === role) &&
    (!dept || u.department === dept) &&
    (!stat || u.status === stat)
  );
  if(sortKey) doSort();
  currentPage = 1;
  renderTable();
}

function resetFilters(){
  document.getElementById('searchInput').value  = '';
  document.getElementById('roleFilter').value   = '';
  document.getElementById('deptFilter').value   = '';
  document.getElementById('statusFilter').value = '';
  filteredUsers = [...users];
  sortKey = null; sortDir = 1;
  currentPage = 1;
  renderTable();
}

function sortTable(key){
  if(sortKey===key) sortDir*=-1; else { sortKey=key; sortDir=1; }
  doSort();
  renderTable();
}
function doSort(){
  filteredUsers.sort((a,b)=>{
    let av=a[sortKey]||'', bv=b[sortKey]||'';
    return av.localeCompare(bv)*sortDir;
  });
}

/* ──────────────────────────────────────
   CHECKBOXES
────────────────────────────────────── */
function toggleRow(id, cb){
  if(cb.checked) selectedIds.add(id); else selectedIds.delete(id);
  const row = document.getElementById(`row-${id}`);
  if(row) row.classList.toggle('selected', cb.checked);
  syncSelectAll();
  updateBulkBtn();
}
function toggleAll(cb){
  const page = filteredUsers.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);
  page.forEach(u=>{ if(cb.checked) selectedIds.add(u.id); else selectedIds.delete(u.id); });
  renderTable();
  updateBulkBtn();
}
function syncSelectAll(){
  const page  = filteredUsers.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);
  const allCB = document.getElementById('selectAll');
  if(!allCB||!page.length){ if(allCB) allCB.checked=false; return; }
  allCB.checked = page.every(u=>selectedIds.has(u.id));
  allCB.indeterminate = !allCB.checked && page.some(u=>selectedIds.has(u.id));
}
function updateBulkBtn(){
  const btn = document.getElementById('bulkDelBtn');
  document.getElementById('selectedCount').textContent = selectedIds.size;
  btn.classList.toggle('show', selectedIds.size>0);
}

/* ──────────────────────────────────────
   STATUS TOGGLE
────────────────────────────────────── */
function toggleStatus(id, cb){
  const u = users.find(u=>u.id===id);
  if(!u) return;
  u.status = cb.checked ? 'active' : 'inactive';
  const lbl = document.getElementById(`stlbl-${id}`);
  if(lbl){ lbl.textContent = u.status==='active'?'Active':'Inactive'; lbl.className=`status-label${u.status==='active'?' active':''}`; }
  updateStats();
  showToast(u.status==='active'?'success':'info',
    `${u.name} is now ${u.status==='active'?'Active':'Inactive'}.`);
}

/* ──────────────────────────────────────
   ADD MODAL
────────────────────────────────────── */
function openAddModal(){
  editTargetId = null;
  clearForm();
  document.getElementById('modalTitle').textContent = 'Add New User';
  document.getElementById('saveBtn').textContent    = 'Add User';
  document.getElementById('pwGroup').style.display  = '';
  openModal('userModal');
}

/* ──────────────────────────────────────
   EDIT MODAL
────────────────────────────────────── */
function openEditModal(id){
  const u = users.find(u=>u.id===id);
  if(!u) return;
  editTargetId = id;
  clearForm();
  document.getElementById('modalTitle').textContent = 'Edit User';
  document.getElementById('saveBtn').textContent    = 'Save Changes';
  document.getElementById('pwGroup').style.display  = 'none';
  document.getElementById('f-name').value   = u.name;
  document.getElementById('f-email').value  = u.email;
  document.getElementById('f-role').value   = u.role;
  document.getElementById('f-dept').value   = u.department;
  document.getElementById('f-status').value = u.status;
  document.getElementById('f-phone').value  = u.phone||'';
  openModal('userModal');
}

function editFromView(){
  closeModal('viewModal');
  if(viewTargetId) openEditModal(viewTargetId);
}

/* ──────────────────────────────────────
   SAVE USER (Add/Edit)
────────────────────────────────────── */
function saveUser(){
  const name  = document.getElementById('f-name').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const role  = document.getElementById('f-role').value;
  const dept  = document.getElementById('f-dept').value;
  const pass  = document.getElementById('f-pass').value;
  const status= document.getElementById('f-status').value;
  const phone = document.getElementById('f-phone').value.trim();
  let valid = true;

  const setErr=(id,show)=>{ document.getElementById(id).classList.toggle('show',show); document.getElementById(id.replace('err-','f-')).classList.toggle('input-error',show); };
  setErr('err-name',  !name);   if(!name)  valid=false;
  setErr('err-email', !email||!/\S+@\S+\.\S+/.test(email)); if(!email||!/\S+@\S+\.\S+/.test(email)) valid=false;
  setErr('err-role',  !role);   if(!role)  valid=false;
  setErr('err-dept',  !dept);   if(!dept)  valid=false;
  if(!editTargetId){ setErr('err-pass', pass.length<8); if(pass.length<8) valid=false; }
  if(!valid) return;

  if(editTargetId){
    const u = users.find(u=>u.id===editTargetId);
    Object.assign(u, { name, email, role, department:dept, status, phone });
    showToast('success', `${name}'s profile updated successfully.`);
  } else {
    users.push({ id:nextId++, name, email, role, department:dept,
                 joined: new Date().toISOString().slice(0,10), status, phone });
    showToast('success', `${name} added to the system.`);
  }
  filteredUsers = [...users];
  applyFilters();
  closeModal('userModal');
}

/* ──────────────────────────────────────
   DELETE
────────────────────────────────────── */
function openDeleteModal(id){
  const u = users.find(u=>u.id===id);
  if(!u) return;
  deleteTargetId = id;
  document.getElementById('delUserName').textContent = `"${u.name}"`;
  openModal('deleteModal');
}
function confirmDelete(){
  const u = users.find(u=>u.id===deleteTargetId);
  const name = u ? u.name : 'User';
  users = users.filter(u=>u.id!==deleteTargetId);
  selectedIds.delete(deleteTargetId);
  applyFilters();
  closeModal('deleteModal');
  updateBulkBtn();
  showToast('error', `${name} has been removed.`);
}
function openBulkDeleteModal(){
  document.getElementById('bulkCount').textContent = selectedIds.size;
  openModal('bulkDeleteModal');
}
function confirmBulkDelete(){
  const count = selectedIds.size;
  users = users.filter(u=>!selectedIds.has(u.id));
  selectedIds.clear();
  applyFilters();
  closeModal('bulkDeleteModal');
  updateBulkBtn();
  showToast('error', `${count} user${count>1?'s':''} deleted.`);
}

/* ──────────────────────────────────────
   VIEW MODAL
────────────────────────────────────── */
function openViewModal(id){
  const u = users.find(u=>u.id===id);
  if(!u) return;
  viewTargetId = id;
  document.getElementById('viewAv').textContent          = getInitials(u.name);
  document.getElementById('viewAv').style.background     = getColor(u.id);
  document.getElementById('viewName').textContent        = u.name;
  document.getElementById('viewEmail').textContent       = u.email;
  document.getElementById('viewDetails').innerHTML = `
    <div class="view-row"><span class="view-key">Role</span>${roleBadge(u.role)}</div>
    <div class="view-row"><span class="view-key">Department</span><span class="view-val">${u.department}</span></div>
    <div class="view-row"><span class="view-key">Status</span><span class="badge ${u.status==='active'?'badge-hr':'badge-employee'}" style="font-size:12px">${u.status==='active'?'Active':'Inactive'}</span></div>
    <div class="view-row"><span class="view-key">Date Joined</span><span class="view-val">${fmtDate(u.joined)}</span></div>
    <div class="view-row"><span class="view-key">Phone</span><span class="view-val">${u.phone||'—'}</span></div>
    <div class="view-row"><span class="view-key">User ID</span><span class="view-val" style="font-family:monospace;font-size:12px">USR-00${u.id}</span></div>
  `;
  openModal('viewModal');
}

/* ──────────────────────────────────────
   MODAL HELPERS
────────────────────────────────────── */
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function clearForm(){
  ['f-name','f-email','f-pass','f-phone'].forEach(id=>{
    document.getElementById(id).value='';
    document.getElementById(id).classList.remove('input-error');
  });
  ['f-role','f-dept'].forEach(id=>{ document.getElementById(id).value=''; document.getElementById(id).classList.remove('input-error'); });
  document.getElementById('f-status').value='active';
  ['err-name','err-email','err-role','err-dept','err-pass'].forEach(id=>document.getElementById(id).classList.remove('show'));
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(ov=>{
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.classList.remove('open'); });
});

/* ──────────────────────────────────────
   TOAST
────────────────────────────────────── */
function showToast(type, msg){
  const icons = {
    success:`<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    error:  `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    info:   `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${icons[type]||icons.info}<span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 400); }, 3200);
}

/* ──────────────────────────────────────
   INIT
────────────────────────────────────── */
applyFilters();
