/* ===================== Mi Horario — lógica de la app ===================== */
/* Todos los datos se guardan solo en este dispositivo (localStorage). */

const STORAGE_KEY = 'miHorario_data_v1';
/* Rellena esto con tu Client ID de Google Cloud (termina en .apps.googleusercontent.com) */
const GOOGLE_CLIENT_ID = '292792599906-9m3t841hk507s1k042193tjuigoe1svb.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar.events';
const DRIVE_FILE_NAME = 'mi-horario-sync.json';
const DRIVE_PHOTOS_FILE_NAME = 'mi-horario-fotos.json';
const APP_VERSION = '2026-08-22-85';
const DOW = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const DOW_SHORT = ['L','M','X','J','V','S','D'];
const SUBJECT_COLORS = ['#457B9D','#E76F51','#2A9D8F','#E9C46A','#7B6D8E','#D65A5A','#6A8D73','#9C6644','#3A86FF','#B5838D'];
const IEDUCA_SITE_BASE = 'https://projektoscio-png.github.io/MyClassSchedule';
const IEDUCA_BOOKMARKLETS = {
  volcar: `javascript:(function(){var s=document.createElement('script');s.src='${IEDUCA_SITE_BASE}/ieduca-bookmarklet.js?t='+Date.now();document.body.appendChild(s);})();`,
  leer: `javascript:(function(){var s=document.createElement('script');s.src='${IEDUCA_SITE_BASE}/ieduca-bookmarklet-leer.js?t='+Date.now();document.body.appendChild(s);})();`,
  pagos: `javascript:(function(){var s=document.createElement('script');s.src='${IEDUCA_SITE_BASE}/ieduca-bookmarklet-pagos.js?t='+Date.now();document.body.appendChild(s);})();`,
};
/* Devuelve un color de texto legible (oscuro o blanco) según lo clara u oscura que sea la
   asignatura, para poder pintar el calendario con el color elegido directamente, sin diluirlo. */
function contrastTextColor(hex){
  const c = (hex||'#999999').replace('#','');
  const r = parseInt(c.substr(0,2),16)||0, g = parseInt(c.substr(2,2),16)||0, b = parseInt(c.substr(4,2),16)||0;
  const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
  return luminance > 0.62 ? '#22283A' : '#ffffff';
}

const ICONS = {
  calendar:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
  clipboard:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2.5"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11.5l2 2 4-4.5"/></svg>',
  flag:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4.5s1.5-1.3 4-1.3 4 1.6 6.5 1.6 4-1.3 4-1.3v9.7s-1.5 1.3-4 1.3-4-1.6-6.5-1.6-4 1.3-4 1.3"/></svg>',
  gear:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3.5a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 5.14 8.5a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.6a1.7 1.7 0 0 0 1-1.55V2.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V8.6a1.7 1.7 0 0 0 1.55 1H20.5a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"/></svg>',
  pencil:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-.8 13.2A2 2 0 0 1 16.2 21H7.8a2 2 0 0 1-2-1.8L5 6"/></svg>',
  x:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  chevL:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  download:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5"/><path d="M4 19.5h16"/></svg>',
  upload:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V7m0 0 4.5 4.5M12 7 7.5 11.5"/><path d="M4 19.5h16"/></svg>',
  bell:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  mapPin:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  user:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>',
  clock:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  sun:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>',
  chart:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>',
  book:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h13v15.5"/><path d="M6 21.5h13V17H6a2 2 0 0 0 0 4.5Z"/></svg>',
  calSmall:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px;"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
  examDoc:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h7L19 8v12.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V8h5"/><path d="m9 14 2 2 4-4.5"/></svg>',
  listIcon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="6" height="6" rx="1.5"/><rect x="3.5" y="14" width="6" height="6" rx="1.5"/><path d="M12.5 6h8M12.5 18h8"/></svg>',
  chevR:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  cloud:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17.2 8.1 4 4 0 0 1 17 16H7Z"/></svg>',
};

/* ---------- state ---------- */
let state = loadState();
let ui = { tab:'calendar', viewMode:'week', day: mondayIndex(new Date()), weekAnchor: todayISO(), subjectFilter:null, ieducaBmOpen:false };

function defaultState(){
  return { subjects:[], classes:[], items:[], holidays:[], students:[], records:[], boardRounds:[], settings:{ notified:[], weekMode:'full', lastModified:0, notificationsEnabled:true } };
}
function migrateState(st){
  // Compatibilidad con copias antiguas: una clase por día (campo "day") -> varios días en un mismo registro ("days")
  (st.classes||[]).forEach(c=>{
    if(!Array.isArray(c.days)){
      c.days = (typeof c.day==='number') ? [c.day] : [0];
    }
  });
  st.settings = Object.assign({ notified:[], weekMode:'full', lastModified:0, notificationsEnabled:true }, st.settings||{});
  if(!Array.isArray(st.students)) st.students = [];
  if(!Array.isArray(st.records)) st.records = [];
  if(!Array.isArray(st.boardRounds)) st.boardRounds = [];
  // Deberes ya existentes de antes de que se guardara la marca de sincronización con Calendar:
  // se marcan como "ya sincronizados" para que un borrado hecho directamente en Google Calendar
  // se detecte correctamente ya en la primera sincronización, en vez de reescribirse una vez más.
  (st.items||[]).forEach(i=>{
    if(i.type==='task' && i.kind==='deberes' && typeof i.calendarSyncedText!=='string'){
      i.calendarSyncedText = i.notes || i.title || '';
    }
  });
  return st;
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return migrateState(Object.assign(defaultState(), parsed));
  }catch(e){ return defaultState(); }
}
function saveState(){
  state.settings.lastModified = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleDriveUpload();
}
/* Para cambios puramente internos y de poca importancia (como qué avisos ya se han
   mostrado), que no merece la pena que decidan cuál de los dispositivos tiene "la
   copia más reciente" al sincronizar. Se guarda en este aparato, pero no se toca la
   marca de sincronización ni se sube nada a Drive por este cambio. */
function saveStateLocalOnly(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function mondayIndex(d){ const n=d.getDay(); return n===0?6:n-1; } // 0=Mon..6=Sun
function todayISO(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function parseISO(s){ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function fmtDateHuman(iso){
  const d = parseISO(iso);
  return d.toLocaleDateString('es-ES',{weekday:'short', day:'numeric', month:'short'});
}
function daysBetween(aISO,bISO){
  const a=parseISO(aISO), b=parseISO(bISO);
  return Math.round((b-a)/86400000);
}
function toISO(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function addDaysISO(iso, n){ const d=parseISO(iso); d.setDate(d.getDate()+n); return toISO(d); }
function mondayOfWeekISO(iso){ const d=parseISO(iso); const dow=d.getDay(); const diff = dow===0? -6 : 1-dow; d.setDate(d.getDate()+diff); return toISO(d); }
function weekDatesFrom(mondayIso){ const arr=[]; for(let i=0;i<7;i++) arr.push(addDaysISO(mondayIso,i)); return arr; }
function isoWeekNumber(iso){
  const d = parseISO(iso);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNr = (target.getDay()+6)%7;
  target.setDate(target.getDate()-dayNr+3);
  const firstThursday = new Date(target.getFullYear(),0,4);
  const diff = target - firstThursday;
  return 1 + Math.round(diff/(7*86400000));
}
function classActiveOnDate(c, dateISO){
  if(c.dateStart && dateISO < c.dateStart) return false;
  if(c.dateEnd && dateISO > c.dateEnd) return false;
  return true;
}
function holidayForDate(dateISO){
  return state.holidays.find(h=> dateISO>=h.start && dateISO<=h.end) || null;
}
function fmtWeekLabel(mondayIso){
  const sunday = addDaysISO(mondayIso,6);
  const md = parseISO(mondayIso), sd = parseISO(sunday);
  const sameMonth = md.getMonth()===sd.getMonth() && md.getFullYear()===sd.getFullYear();
  const startStr = sameMonth
    ? md.toLocaleDateString('es-ES',{day:'numeric'})
    : md.toLocaleDateString('es-ES',{day:'numeric', month:'short'});
  const endStr = sd.toLocaleDateString('es-ES',{day:'numeric', month:'short'});
  return `${startStr} – ${endStr} ${sd.getFullYear()}`;
}
function minTimeToStr(m){
  m = Math.max(0, Math.min(23*60+59, m));
  return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
}
function firstFridayOfJune(year){
  const d = new Date(year, 5, 1); // junio = mes índice 5
  while(d.getDay()!==5){ d.setDate(d.getDate()+1); }
  return toISO(d);
}
function defaultCourseEndDate(startIso){
  const d = parseISO(startIso);
  const month = d.getMonth()+1; // 1-12
  const targetYear = (month>=7) ? d.getFullYear()+1 : d.getFullYear();
  return firstFridayOfJune(targetYear);
}
function getSubject(id){ return state.subjects.find(s=>s.id===id); }
function getOrCreateSubject(name){
  name=(name||'').trim();
  if(!name) return null;
  let s = state.subjects.find(s=>s.name.toLowerCase()===name.toLowerCase());
  if(s) return s;
  s = { id:uid(), name, color: SUBJECT_COLORS[state.subjects.length % SUBJECT_COLORS.length] };
  state.subjects.push(s);
  return s;
}

/* ---------- toast ---------- */
let toastTimer=null;
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
}

/* ---------- nav ---------- */
const TABS = [
  {id:'calendar', label:'Calendario', icon:ICONS.calendar},
  {id:'subjects', label:'Clases', icon:ICONS.listIcon},
  {id:'board', label:'Pizarra', icon:ICONS.book},
  {id:'tasks', label:'Tareas', icon:ICONS.clipboard},
  {id:'exams', label:'Exámenes', icon:ICONS.examDoc},
  {id:'holidays', label:'Festivos', icon:ICONS.flag},
  {id:'settings', label:'Ajustes', icon:ICONS.gear},
];

function renderNav(){
  const nav=document.getElementById('bottomnav');
  nav.innerHTML = TABS.map(t=>`
    <button class="navbtn ${ui.tab===t.id?'active':''}" data-tab="${t.id}">
      ${t.icon}
      <span>${t.label}</span>
    </button>`).join('');
  nav.querySelectorAll('.navbtn').forEach(b=>{
    b.onclick=()=>{ ui.tab=b.dataset.tab; if(b.dataset.tab!=='tasks' && b.dataset.tab!=='exams'){ ui.subjectFilter=null; } render(); };
  });
}

/* ---------- header ---------- */
function renderHeader(){
  const titles = {
    calendar:'Tu horario semanal', subjects:'Tus clases', tasks:'Tareas', exams:'Exámenes', holidays:'Vacaciones y festivos', settings:'Ajustes y copia de seguridad'
  };
  document.getElementById('viewTitle').textContent = titles[ui.tab];
  const d = new Date();
  document.getElementById('dateToday').textContent = d.toLocaleDateString('es-ES',{weekday:'long', day:'numeric', month:'long'});
  document.getElementById('fabBtn').style.display = ui.tab==='settings' ? 'none':'flex';
}


/* ==================================================================
   HORARIO
   ================================================================== */
function visibleDayCount(){ return (state.settings.weekMode==='weekdays') ? 5 : 7; }

function renderScheduleNav(){
  const wrap = document.getElementById('dayChipsWrap');
  if(ui.tab!=='calendar'){ wrap.innerHTML=''; return; }
  const monday = mondayOfWeekISO(ui.weekAnchor);
  const isCurrentWeek = monday === mondayOfWeekISO(todayISO());
  const N = visibleDayCount();

  wrap.innerHTML = `
    <div class="week-nav">
      <button class="wn-btn" id="wnPrev" aria-label="Semana anterior">${ICONS.chevL}</button>
      <div class="wn-mid">
        <button type="button" class="wn-label" id="wnDateBtn">${ICONS.calSmall} Semana ${isoWeekNumber(monday)} · ${fmtWeekLabel(monday)}</button>
        <input type="date" id="wnDate" value="${ui.weekAnchor}">
      </div>
      <button class="wn-btn" id="wnNext" aria-label="Semana siguiente">${ICONS.chevL}</button>
    </div>
    <div class="wn-row2">
      ${isCurrentWeek?'':'<button class="wn-today" id="wnToday">Ir a hoy</button>'}
      <div class="view-toggle" id="viewToggle">
        <button data-v="week" class="${ui.viewMode==='week'?'active':''}">Semana</button>
        <button data-v="day" class="${ui.viewMode==='day'?'active':''}">Día</button>
      </div>
    </div>
    ${ui.viewMode==='day' ? `<div class="day-chips">${weekDatesFrom(monday).slice(0,N).map((dateIso,i)=>{
      const count = state.classes.filter(c=>c.days.includes(i) && classActiveOnDate(c,dateIso)).length;
      const isToday = dateIso===todayISO();
      const isHoliday = !!holidayForDate(dateIso);
      const dNum = parseISO(dateIso).getDate();
      return `<div class="day-chip ${ui.day===i?'active':''} ${isToday?'today':''} ${isHoliday?'holiday':''}" data-day="${i}">
        <span class="dow">${DOW_SHORT[i]}</span>
        <span class="dcount">${isHoliday?'🚩':dNum}</span>
      </div>`;
    }).join('')}</div>` : ''}
  `;

  document.getElementById('wnPrev').onclick=()=>{ ui.weekAnchor = addDaysISO(monday,-7); render(); };
  document.getElementById('wnNext').onclick=()=>{ ui.weekAnchor = addDaysISO(monday,7); render(); };
  document.getElementById('wnDate').onchange=(e)=>{ if(e.target.value){ ui.weekAnchor = e.target.value; render(); } };
  document.getElementById('wnDateBtn').onclick=()=>{
    const inp = document.getElementById('wnDate');
    if(inp.showPicker){ try{ inp.showPicker(); return; }catch(e){} }
    inp.focus();
    inp.click();
  };
  const wnToday = document.getElementById('wnToday');
  if(wnToday) wnToday.onclick=()=>{ ui.weekAnchor = todayISO(); ui.day = mondayIndex(new Date()); render(); };
  wrap.querySelectorAll('#viewToggle button').forEach(b=>{
    b.onclick=()=>{ ui.viewMode = b.dataset.v; render(); };
  });
  wrap.querySelectorAll('.day-chip').forEach(el=>{
    el.onclick=()=>{ ui.day=Number(el.dataset.day); render(); };
  });
}

function timeToMin(t){ const [h,m]=t.split(':').map(Number); return h*60+m; }

function renderSchedule(){
  return ui.viewMode==='week' ? renderScheduleWeekGrid() : renderScheduleDay();
}

function renderScheduleDay(){
  const monday = mondayOfWeekISO(ui.weekAnchor);
  const dateIso = addDaysISO(monday, ui.day);
  const holiday = holidayForDate(dateIso);
  if(holiday){
    return `<div class="holiday-fullday">
      ${ICONS.flag}
      <div class="hf-label">Festivo</div>
      <div class="hf-name">${escapeHtml(holiday.name)}</div>
      <div class="hf-dates">${fmtDateHuman(holiday.start)}${holiday.end!==holiday.start?' – '+fmtDateHuman(holiday.end):''}</div>
    </div>`;
  }
  const list = state.classes.filter(c=>c.days.includes(ui.day) && classActiveOnDate(c,dateIso)).sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));
  if(list.length===0){
    return `<div class="empty-state">
      <span class="emoji">🗓️</span>
      <div class="et">Nada para ${DOW[ui.day].toLowerCase()}</div>
      <div class="es">Toca el botón + para añadir una clase este día.</div>
    </div>`;
  }
  return list.map(c=>{
    const subj = getSubject(c.subjectId);
    const color = subj?subj.color:'#999';
    const metaParts = [c.room, c.teacher].filter(Boolean);
    if(c.days.length>1){ metaParts.push(c.days.slice().sort((a,b)=>a-b).map(d=>DOW_SHORT[d]).join('/')); }
    let periodLabel = '';
    if(c.dateStart || c.dateEnd){
      const df = iso=> iso ? parseISO(iso).toLocaleDateString('es-ES',{day:'numeric',month:'short'}) : '…';
      periodLabel = `📅 ${df(c.dateStart)} – ${df(c.dateEnd)}`;
    }
    const hasObs = state.items.some(i=>i.type==='task' && (i.kind==='observacion'||!i.kind) && i.subjectId===c.subjectId && i.date===dateIso && (i.classId ? i.classId===c.id : true));
    const hasDeb = state.items.some(i=>i.type==='task' && i.kind==='deberes' && i.subjectId===c.subjectId && i.date===dateIso && (i.classId ? i.classId===c.id : true));
    const hasExam = state.items.some(i=>i.type==='exam' && i.subjectId===c.subjectId && i.date===dateIso && (i.classId ? i.classId===c.id : true));
    return `<div class="card class-card" data-open-class="${c.id}" data-date="${dateIso}">
      <div class="class-bar" style="background:${color}"></div>
      <div class="class-body">
        <div class="class-time">${c.start}<small>${c.end}</small></div>
        <div class="class-info">
          <div class="class-name">${escapeHtml(subj?subj.name:'(sin nombre)')} ${hasExam?'📕':`${hasDeb?'📚':''}${hasObs?'📝':''}`}</div>
          <div class="class-meta">${metaParts.join(' · ')||'&nbsp;'}</div>
          ${periodLabel?`<div class="class-meta" style="color:var(--primary)">${periodLabel}</div>`:''}
        </div>
        <button class="chev-btn" data-open-class="${c.id}" data-date="${dateIso}">${ICONS.pencil}</button>
      </div>
    </div>`;
  }).join('');
}

function renderScheduleWeekGrid(){
  const monday = mondayOfWeekISO(ui.weekAnchor);
  const dates = weekDatesFrom(monday).slice(0, visibleDayCount());
  const weekClasses = [];
  dates.forEach((dateIso,i)=>{
    state.classes.filter(c=>c.days.includes(i) && classActiveOnDate(c,dateIso)).forEach(c=>weekClasses.push(c));
  });

  if(weekClasses.length===0){
    return `<div class="empty-state">
      <span class="emoji">🗓️</span>
      <div class="et">Nada esta semana</div>
      <div class="es">Toca el botón + para añadir una clase, o cambia de semana con las flechas de arriba.</div>
    </div>`;
  }

  let minStart = Math.min(...weekClasses.map(c=>timeToMin(c.start)));
  let maxEnd = Math.max(...weekClasses.map(c=>timeToMin(c.end)));
  minStart = Math.max(0, Math.floor(minStart/60)*60 - 30);
  maxEnd = Math.ceil(maxEnd/60)*60;
  const totalMin = Math.max(maxEnd - minStart, 60);
  const PX_PER_HOUR = 56;
  const gridHeight = (totalMin/60)*PX_PER_HOUR;

  const hourMarks = [];
  for(let m = Math.ceil(minStart/60)*60; m<=maxEnd; m+=60) hourMarks.push(m);

  const labelsHtml = hourMarks.map(m=>{
    const top = ((m-minStart)/totalMin)*gridHeight;
    return `<div class="grid-hourlabel" style="top:${top}px">${String(Math.floor(m/60)).padStart(2,'0')}:00</div>`;
  }).join('');
  const linesHtml = hourMarks.map(m=>{
    const top = ((m-minStart)/totalMin)*gridHeight;
    return `<div class="grid-hourline" style="top:${top}px"></div>`;
  }).join('');

  const todayIso = todayISO();
  const dayCols = dates.map((dateIso,i)=>{
    const holiday = holidayForDate(dateIso);
    const isToday = dateIso===todayIso;
    if(holiday){
      return `<div class="grid-daycol holiday ${isToday?'today':''}" style="height:${gridHeight}px">
        <div class="grid-holiday-fill" data-open-holiday="${holiday.id}">
          ${ICONS.flag}
          <div class="ghf-name">${escapeHtml(holiday.name)}</div>
        </div>
      </div>`;
    }
    const dayClasses = state.classes.filter(c=>c.days.includes(i) && classActiveOnDate(c,dateIso));
    const blocks = dayClasses.map(c=>{
      const subj = getSubject(c.subjectId);
      const color = subj?subj.color:'#999';
      const s=timeToMin(c.start), e=Math.max(timeToMin(c.end), s+20);
      const top = ((s-minStart)/totalMin)*gridHeight;
      const height = Math.max(((e-s)/totalMin)*gridHeight, 22);
      const hasObs = state.items.some(it=>it.type==='task' && (it.kind==='observacion'||!it.kind) && it.subjectId===c.subjectId && it.date===dateIso && (it.classId ? it.classId===c.id : true));
      const hasDeb = state.items.some(it=>it.type==='task' && it.kind==='deberes' && it.subjectId===c.subjectId && it.date===dateIso && (it.classId ? it.classId===c.id : true));
      const hasExam = state.items.some(it=>it.type==='exam' && it.subjectId===c.subjectId && it.date===dateIso && (it.classId ? it.classId===c.id : true));
      const isShort = height <= 34;
      const textColor = contrastTextColor(color);
      return `<div class="grid-block" data-open-class="${c.id}" data-date="${dateIso}" style="top:${top}px;height:${height}px;background:${color};border-left:3px solid ${color};color:${textColor};">
        ${hasExam?`<div class="grid-block-icon-exam">📕</div>`:''}
        ${hasDeb?`<div class="grid-block-icon-deb">📚</div>`:''}
        ${hasObs?`<div class="grid-block-icon-obs">📝</div>`:''}
        ${isShort ? `
          <div class="grid-block-inline-row">
            <span class="grid-block-name">${escapeHtml(subj?subj.name:'')}</span>
            ${c.room ? `<span class="grid-block-room-inline">${escapeHtml(c.room)}</span>` : ''}
          </div>
        ` : `
          <div class="grid-block-name">${escapeHtml(subj?subj.name:'')}</div>
          ${c.room ? `<div class="grid-block-room">${escapeHtml(c.room)}</div>` : ''}
        `}
      </div>`;
    }).join('');
    return `<div class="grid-daycol ${isToday?'today':''}" style="height:${gridHeight}px">${linesHtml}${blocks}</div>`;
  }).join('');

  const dayHeaders = dates.map((dateIso,i)=>{
    const isToday = dateIso===todayIso;
    const holiday = holidayForDate(dateIso);
    return `<div class="grid-dayhead ${isToday?'today':''} ${holiday?'holiday':''}" data-day-jump="${i}">
      <span class="gdow">${DOW_SHORT[i]}</span><span class="gdnum">${parseISO(dateIso).getDate()}</span>
    </div>`;
  }).join('');

  return `
    <div class="week-grid-wrap">
      <div class="grid-headrow">
        <div class="grid-corner"></div>
        ${dayHeaders}
      </div>
      <div class="grid-scrollarea">
        <div class="grid-timecol" style="height:${gridHeight}px">${labelsHtml}</div>
        <div class="grid-daycols" style="height:${gridHeight}px">${dayCols}</div>
      </div>
    </div>
  `;
}

/* ==================================================================
   CLASES (asignaturas) — cada una con sus tramos horarios
   ================================================================== */
function renderSubjectsList(){
  if(state.subjects.length===0){
    return `<div class="empty-state">
      <span class="emoji">📖</span>
      <div class="et">Todavía no hay clases</div>
      <div class="es">Toca el botón + para crear tu primera clase (asignatura). Luego podrás añadirle uno o varios tramos horarios.</div>
    </div>`;
  }
  const sorted = [...state.subjects].sort((a,b)=>a.name.localeCompare(b.name));
  return sorted.map(s=>{
    const slots = state.classes.filter(c=>c.subjectId===s.id);
    let subtitle;
    if(slots.length===0){
      subtitle = 'Sin tramos horarios todavía';
    } else {
      subtitle = slots
        .slice().sort((a,b)=>timeToMin(a.start)-timeToMin(b.start))
        .map(sl=>`${sl.days.slice().sort((a,b)=>a-b).map(d=>DOW_SHORT[d]).join('')} ${sl.start}–${sl.end}`)
        .join(' · ');
    }
    const studentCount = state.students.filter(st=>st.subjectId===s.id).length;
    return `<div class="card subject-row" data-open-subject="${s.id}">
      <span class="subject-dot" style="background:${s.color}"></span>
      <div class="subject-row-main">
        <div class="subject-row-name">${escapeHtml(s.name)}</div>
        <div class="subject-row-sub">${escapeHtml(subtitle)}${studentCount?` · 🧑‍🎓 ${studentCount}`:''}<span data-photo-count-for="${s.id}"></span></div>
      </div>
      <span class="subject-row-count">${slots.length}</span>
      ${ICONS.chevR}
    </div>`;
  }).join('');
}

/* Rellena "· 📷 N" junto a cada clase con el nº de alumnos que tienen foto real (no genérica). */
async function fillSubjectPhotoCounts(root){
  const nodes = (root||document).querySelectorAll('[data-photo-count-for]');
  if(nodes.length===0) return;
  const counts = {};
  await Promise.all(state.students.map(async s=>{
    const has = !!(await getPhoto(s.id));
    if(has) counts[s.subjectId] = (counts[s.subjectId]||0) + 1;
  }));
  nodes.forEach(el=>{
    const sid = el.dataset.photoCountFor;
    if(counts[sid]) el.textContent = ` · 📷 ${counts[sid]}`;
  });
}

function openNewSubjectModal(){
  const nextColor = SUBJECT_COLORS[state.subjects.length % SUBJECT_COLORS.length];
  openModal(`
    <div class="modal-head"><div class="modal-title">Nueva clase</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div class="field"><label>Nombre</label><input type="text" id="fSubjName" placeholder="Ej. Matemáticas 2n ESO"></div>
    <div class="field">
      <label>Color</label>
      <input type="color" id="fSubjColor" value="${nextColor}" style="width:100%; height:46px; padding:4px; border-radius:12px; border:1.5px solid var(--line); cursor:pointer; background:var(--paper);">
    </div>
    <button class="btn btn-primary" id="fSubjSave">${ICONS.pencil} Crear clase</button>
  `);
  document.getElementById('fSubjSave').onclick=()=>{
    const name = document.getElementById('fSubjName').value.trim();
    if(!name){ toast('Escribe un nombre'); return; }
    const subject = getOrCreateSubject(name);
    subject.color = document.getElementById('fSubjColor').value;
    saveState(); closeModal(); toast('Clase creada');
    openSubjectDetailModal(subject.id);
  };
}

function openSubjectDetailModal(subjectId){
  const subj = getSubject(subjectId);
  if(!subj){ return; }
  const slots = state.classes.filter(c=>c.subjectId===subjectId).sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));
  const students = state.students.filter(s=>s.subjectId===subjectId).sort((a,b)=>a.name.localeCompare(b.name,'es'));

  openModal(`
    <div class="modal-head">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="subject-dot" style="background:${subj.color};width:16px;height:16px;"></span>
        <div class="modal-title">${escapeHtml(subj.name)}</div>
      </div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button>
    </div>
    <div class="field">
      <label>Color de la asignatura</label>
      <input type="color" id="fSubjColorPicker" value="${subj.color}" style="width:100%; height:46px; padding:4px; border-radius:12px; border:1.5px solid var(--line); cursor:pointer; background:var(--paper);">
    </div>
    <div class="field">
      <label>Tramos horarios</label>
      ${slots.length ? slots.map(sl=>{
        const daysLabel = sl.days.slice().sort((a,b)=>a-b).map(d=>DOW[d]).join(', ');
        let periodLabel = '';
        if(sl.dateStart || sl.dateEnd){
          const df = iso=> iso ? parseISO(iso).toLocaleDateString('es-ES',{day:'numeric',month:'short'}) : '…';
          periodLabel = `<div class="class-meta" style="color:var(--primary);margin-top:2px;">📅 ${df(sl.dateStart)} – ${df(sl.dateEnd)}</div>`;
        }
        return `<div class="card" style="padding:12px 14px;margin-bottom:8px;cursor:pointer;" data-open-slot="${sl.id}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div>
              <div style="font-weight:700;font-size:14px;">${daysLabel}</div>
              <div class="class-meta">${sl.start}–${sl.end}${sl.room?' · '+escapeHtml(sl.room):''}${sl.teacher?' · '+escapeHtml(sl.teacher):''}</div>
              ${periodLabel}
            </div>
            <span class="chev-btn">${ICONS.pencil}</span>
          </div>
        </div>`;
      }).join('') : `<div style="font-size:13px;color:var(--ink-faint);margin-bottom:6px;">Esta clase todavía no tiene ningún tramo horario.</div>`}
    </div>
    <button class="btn btn-ghost" id="btnAddSlot">${ICONS.pencil} Añadir tramo horario</button>
    <div style="height:1px;background:var(--line);margin:16px 0;"></div>
    <div class="field">
      <label>Calendario de Google vinculado (opcional)</label>
      <input type="text" id="fCalendarId" placeholder="ID del calendario, ej. abc123@group.calendar.google.com" value="${escapeHtml(subj.calendarId||'')}">
      <div style="font-size:11.5px;color:var(--ink-faint);margin-top:6px;">Si lo rellenas, los deberes que añadas para esta clase se escribirán también en ese calendario de Google, en el hueco horario correspondiente de ese día. Lo encuentras en Google Calendar → ajustes de ese calendario → "Integrar calendario" → "ID de calendario".</div>
      <button class="btn btn-ghost" id="btnSaveCalendarId" style="margin-top:8px;">Guardar</button>
      ${subj.calendarId ? `<button class="btn btn-ghost" id="btnSyncDeberes" style="margin-top:8px;">🔄 Sincronizar deberes ya existentes con este calendario</button>` : ''}
    </div>
    <div style="height:1px;background:var(--line);margin:16px 0;"></div>
    <div class="field">
      <label>Alumnos (${students.length})</label>
      ${students.length ? `<div class="student-list">${students.map((s,idx)=>`
        <div class="student-list-row" data-open-student="${s.id}">
          <span class="student-list-num">${idx+1}</span>
          <div class="student-avatar" data-photo-for="${s.id}" data-edit-photo="${s.id}" title="Toca para añadir/cambiar foto">${escapeHtml((s.name.replace(/,.*/, '').trim()[0]||'?').toUpperCase())}</div>
          <span class="student-list-name">${escapeHtml(s.name)}</span>
          <span title="${s.dossierPaid?'Dossier pagado':'Dossier sin pagar'}" style="font-size:15px;flex-shrink:0;">${s.dossierPaid?'💰':'<span style=\"opacity:.25;\">💰</span>'}</span>
          <button data-edit-student="${s.id}" aria-label="Editar nombre" class="student-list-del" style="color:var(--ink-soft);">${ICONS.pencil}</button>
          <button data-del-student="${s.id}" aria-label="Eliminar" class="student-list-del">${ICONS.x}</button>
        </div>
      `).join('')}</div>` : `<div style="font-size:13px;color:var(--ink-faint);">Todavía no hay alumnos en esta clase.</div>`}
      <div class="btn-row" style="margin-top:10px;">
        <button class="btn btn-ghost" id="btnAddStudent">${ICONS.pencil} Añadir alumno</button>
        <button class="btn btn-ghost" id="btnImportCsv" style="margin-top:0">${ICONS.upload} Importar CSV</button>
      </div>
      <button class="btn btn-ghost" id="btnImportPhotos" style="margin-top:8px;" ${students.length===0?'disabled style="opacity:.5;cursor:default;margin-top:8px;"':''}>📷 Importar fotos (ZIP)</button>
      <input type="file" id="csvStudentsInput" accept=".csv,text/csv,text/plain" style="display:none">
      <input type="file" id="photosZipInput" accept=".zip,application/zip" style="display:none">
    </div>
    <button class="btn btn-primary" id="btnDailyRecord" ${students.length===0?'disabled style="opacity:.5;cursor:default;"':''}>${ICONS.clipboard} Registro diario de esta clase</button>
    <button class="btn btn-ghost" id="btnExportRecord" style="margin-top:8px;" ${students.length===0?'disabled style="opacity:.5;cursor:default;margin-top:8px;"':''}>${ICONS.download} Exportar registro a Excel</button>
    <div style="height:1px;background:var(--line);margin:16px 0;"></div>
    <button class="btn btn-ghost" id="btnViewSubjTasks2">${ICONS.clipboard} Ver tareas de esta clase</button>
    <button class="btn btn-danger" id="btnDeleteSubject" style="margin-top:8px;">${ICONS.trash} Eliminar esta clase</button>
  `);
  fillPhotoPlaceholders(document.querySelector('.modal-sheet'));

  document.querySelectorAll('[data-del-student]').forEach(el=>{
    el.onclick=(e)=>{
      e.stopPropagation();
      const sid = el.dataset.delStudent;
      state.students = state.students.filter(s=>s.id!==sid);
      state.records = state.records.filter(r=>r.studentId!==sid);
      deletePhoto(sid);
      saveState(); render(); openSubjectDetailModal(subjectId); toast('Alumno eliminado');
    };
  });
  document.querySelectorAll('[data-edit-student]').forEach(el=>{
    el.onclick=(e)=>{ e.stopPropagation(); openEditStudentNameModal(el.dataset.editStudent, subjectId); };
  });
  document.querySelectorAll('[data-open-student]').forEach(el=>{
    el.onclick=()=>{ closeModal(); openDailyRecordScreen(subjectId, todayISO(), el.dataset.openStudent); };
  });
  document.querySelectorAll('[data-edit-photo]').forEach(el=>{
    el.onclick=(e)=>{
      e.stopPropagation();
      pickAndSaveStudentPhoto(el.dataset.editPhoto, ()=>openSubjectDetailModal(subjectId));
    };
  });
  document.getElementById('fSubjColorPicker').addEventListener('input', (e)=>{
    subj.color = e.target.value;
    saveState(); render();
  });
  document.getElementById('btnSaveCalendarId').onclick=()=>{
    subj.calendarId = document.getElementById('fCalendarId').value.trim();
    saveState(); toast(subj.calendarId ? 'Calendario vinculado' : 'Calendario desvinculado');
    openSubjectDetailModal(subjectId);
  };
  const btnSyncDeberes = document.getElementById('btnSyncDeberes');
  if(btnSyncDeberes) btnSyncDeberes.onclick=()=>openSyncDeberesModal(subjectId);
  document.getElementById('btnAddStudent').onclick=()=>openAddStudentModal(subjectId);
  document.getElementById('btnImportCsv').onclick=()=>document.getElementById('csvStudentsInput').click();
  document.getElementById('csvStudentsInput').onchange=(e)=>importStudentsCsv(e, subjectId);
  const btnImportPhotos = document.getElementById('btnImportPhotos');
  if(students.length) btnImportPhotos.onclick=()=>document.getElementById('photosZipInput').click();
  document.getElementById('photosZipInput').onchange=(e)=>importStudentPhotosZip(e, subjectId);
  const btnDaily = document.getElementById('btnDailyRecord');
  if(students.length){
    btnDaily.onclick=()=>{ closeModal(); openDailyRecordScreen(subjectId, todayISO(), students[0].id); };
  }
  const btnExport = document.getElementById('btnExportRecord');
  if(students.length){
    btnExport.onclick=()=>openExportRangeModal(subjectId);
  }

  document.querySelectorAll('[data-open-slot]').forEach(el=>{
    el.onclick=()=>openClassModal(el.dataset.openSlot, { presetSubjectId:subjectId, afterSave:()=>openSubjectDetailModal(subjectId) });
  });
  document.getElementById('btnAddSlot').onclick=()=>{
    openClassModal(null, { presetSubjectId:subjectId, afterSave:()=>openSubjectDetailModal(subjectId) });
  };
  document.getElementById('btnViewSubjTasks2').onclick=()=>{
    closeModal(); ui.tab='tasks'; ui.subjectFilter=subjectId; render();
  };
  document.getElementById('btnDeleteSubject').onclick=()=>{
    openModal(`
      <div class="modal-head"><div class="modal-title">¿Eliminar esta clase?</div>
        <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
      <p style="font-size:13.5px;color:var(--ink-soft);line-height:1.5;">Se eliminará "${escapeHtml(subj.name)}" y todos sus tramos horarios (${slots.length}). Los exámenes y tareas que tenía asociados no se borrarán, mas quedarán sin asignatura. Esta acción no se puede deshacer.</p>
      <div class="btn-row">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-danger" id="fConfirmDeleteSubject" style="margin-top:0">Eliminar</button>
      </div>
    `);
    document.getElementById('fConfirmDeleteSubject').onclick=()=>{
      state.classes = state.classes.filter(c=>c.subjectId!==subjectId);
      state.items.forEach(i=>{ if(i.subjectId===subjectId) i.subjectId=null; });
      const studentIds = state.students.filter(s=>s.subjectId===subjectId).map(s=>s.id);
      studentIds.forEach(sid=>deletePhoto(sid));
      state.students = state.students.filter(s=>s.subjectId!==subjectId);
      state.records = state.records.filter(r=>!studentIds.includes(r.studentId));
      state.subjects = state.subjects.filter(s=>s.id!==subjectId);
      saveState(); closeModal(); render(); toast('Clase eliminada');
    };
  };
}

/* ==================================================================
   ALUMNOS Y REGISTRO DIARIO
   ================================================================== */
function openAddStudentModal(subjectId){
  openModal(`
    <div class="modal-head"><div class="modal-title">Añadir alumno</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div class="row2">
      <div class="field"><label>Apellidos</label><input type="text" id="fStudentSurname" placeholder="Ghailany"></div>
      <div class="field"><label>Nombre</label><input type="text" id="fStudentFirstname" placeholder="Chams"></div>
    </div>
    <button class="btn btn-primary" id="fStudentSave">${ICONS.pencil} Añadir</button>
  `);
  const inpSur = document.getElementById('fStudentSurname');
  const inpName = document.getElementById('fStudentFirstname');
  inpSur.focus();
  document.getElementById('fStudentSave').onclick=()=>{
    const surname = inpSur.value.trim();
    const firstname = inpName.value.trim();
    if(!surname && !firstname){ toast('Escribe al menos el nombre o los apellidos'); return; }
    const name = surname && firstname ? `${surname}, ${firstname}` : (surname || firstname);
    state.students.push({ id:uid(), subjectId, name });
    saveState(); render(); closeModal(); openSubjectDetailModal(subjectId); toast('Alumno añadido');
  };
  [inpSur, inpName].forEach(el=> el.addEventListener('keydown', (e)=>{ if(e.key==='Enter') document.getElementById('fStudentSave').click(); }));
}

/* Editar el nombre de un alumno ya existente. Como las observaciones, faltas, fotos, etc.
   están ligadas al alumno por su id interno (no por el nombre), corregir el nombre no
   afecta a nada de lo que ya se hubiera guardado con él. */
/* Comprueba si un alumno tiene un periodo de E (interno de Mi Horario) activo en
   una fecha dada. Un periodo sin fecha de fin significa "todo el curso". */
function isStudentExemptOn(student, dateIso){
  return (student.exemptPeriods||[]).some(p=> dateIso>=p.start && (!p.end || dateIso<=p.end));
}
function addExemptPeriod(student, start, end){
  if(!student.exemptPeriods) student.exemptPeriods = [];
  student.exemptPeriods.push({ id:uid(), start, end: end||null });
  saveState();
}
function removeExemptPeriod(student, periodId){
  student.exemptPeriods = (student.exemptPeriods||[]).filter(p=>p.id!==periodId);
  saveState();
}

function openEditStudentNameModal(studentId, subjectId){
  const student = state.students.find(s=>s.id===studentId);
  if(!student) return;
  const roster = state.students.filter(s=>s.subjectId===subjectId).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const idx = roster.findIndex(s=>s.id===studentId);
  const parts = student.name.split(',');
  const currentSurname = (parts[0]||'').trim();
  const currentFirstname = (parts[1]||'').trim();
  const periods = student.exemptPeriods||[];
  openModal(`
    <div class="modal-head"><div class="modal-title">Ficha del alumno</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin:-4px 0 14px;">
      <button class="dr-nav-btn" id="fStudentPrev" ${idx<=0?'disabled style="opacity:.3;"':''}>${ICONS.chevL}</button>
      <span style="font-size:12px;color:var(--ink-faint);">${idx+1} / ${roster.length}</span>
      <button class="dr-nav-btn" id="fStudentNext" ${idx>=roster.length-1?'disabled style="opacity:.3;"':''}>${ICONS.chevR}</button>
    </div>
    <div class="row2">
      <div class="field"><label>Apellidos</label><input type="text" id="fStudentSurname" value="${escapeHtml(currentSurname)}"></div>
      <div class="field"><label>Nombre</label><input type="text" id="fStudentFirstname" value="${escapeHtml(currentFirstname)}"></div>
    </div>
    <p style="font-size:11.5px;color:var(--ink-faint);margin-top:-8px;">Las observaciones, faltas, deberes y fotos ya guardados se mantienen, solo cambia el nombre.</p>
    <button class="btn btn-primary" id="fStudentSave">${ICONS.pencil} Guardar</button>

    <div style="height:1px;background:var(--line);margin:18px 0 14px;"></div>
    <label style="font-size:13px;font-weight:700;color:var(--ink-soft);">Dossier</label>
    <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
      <span style="font-size:13px;color:var(--ink);">${student.dossierPaid ? '✅ Pagado' : '❌ No pagado'}</span>
      <button class="btn btn-ghost" id="fToggleDossier" style="padding:8px 14px;">${student.dossierPaid ? 'Marcar como no pagado' : 'Marcar como pagado'}</button>
    </div>

    <div style="height:1px;background:var(--line);margin:18px 0 14px;"></div>
    <label style="font-size:13px;font-weight:700;color:var(--ink-soft);">Periodos de E (interno, no se envía a iEduca)</label>
    <div id="exemptPeriodsList" style="margin:10px 0;">
      ${periods.length ? periods.map(p=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);font-size:13px;">
          <span>${dateLabel(p.start)} ${p.end?'– '+dateLabel(p.end):'– todo el curso'}</span>
          <button data-remove-exempt="${p.id}" class="student-list-del" aria-label="Quitar">${ICONS.x}</button>
        </div>
      `).join('') : `<div style="font-size:12.5px;color:var(--ink-faint);">Sin periodos de E puestos.</div>`}
    </div>
    <div class="row2" style="margin-bottom:8px;">
      <div class="field"><label>Desde</label><input type="date" id="fExemptStart" value="${todayISO()}"></div>
      <div class="field"><label>Hasta (vacío = todo el curso)</label><input type="date" id="fExemptEnd"></div>
    </div>
    <button class="btn btn-ghost" id="fExemptAdd">${ICONS.pencil} Añadir periodo de E</button>
  `);
  const inpSur = document.getElementById('fStudentSurname');
  const inpName = document.getElementById('fStudentFirstname');
  inpSur.focus();
  document.getElementById('fStudentSave').onclick=()=>{
    const surname = inpSur.value.trim();
    const firstname = inpName.value.trim();
    if(!surname && !firstname){ toast('Escribe al menos el nombre o los apellidos'); return; }
    student.name = surname && firstname ? `${surname}, ${firstname}` : (surname || firstname);
    saveState(); render(); closeModal(); openSubjectDetailModal(subjectId); toast('Nombre actualizado');
  };
  [inpSur, inpName].forEach(el=> el.addEventListener('keydown', (e)=>{ if(e.key==='Enter') document.getElementById('fStudentSave').click(); }));
  const fStudentPrev = document.getElementById('fStudentPrev');
  if(fStudentPrev) fStudentPrev.onclick=()=>{ if(idx>0) openEditStudentNameModal(roster[idx-1].id, subjectId); };
  const fStudentNext = document.getElementById('fStudentNext');
  if(fStudentNext) fStudentNext.onclick=()=>{ if(idx<roster.length-1) openEditStudentNameModal(roster[idx+1].id, subjectId); };
  document.getElementById('fToggleDossier').onclick=()=>{
    student.dossierPaid = !student.dossierPaid;
    saveState();
    openEditStudentNameModal(studentId, subjectId);
  };
  document.getElementById('fExemptAdd').onclick=()=>{
    const start = document.getElementById('fExemptStart').value;
    const end = document.getElementById('fExemptEnd').value;
    if(!start){ toast('Indica desde cuándo'); return; }
    if(end && end<start){ toast('La fecha de fin no puede ser anterior a la de inicio'); return; }
    addExemptPeriod(student, start, end);
    openEditStudentNameModal(studentId, subjectId);
  };
  document.querySelectorAll('[data-remove-exempt]').forEach(el=>{
    el.onclick=()=>{ removeExemptPeriod(student, el.dataset.removeExempt); openEditStudentNameModal(studentId, subjectId); };
  });
}

function splitCsvLine(line){
  // Divide una línea respetando las comillas del CSV: un campo "así, con coma"
  // no se corta por dentro aunque contenga comas.
  const result = [];
  let cur = '';
  let inQuotes = false;
  for(let i=0; i<line.length; i++){
    const c = line[i];
    if(inQuotes){
      if(c === '"'){
        if(line[i+1] === '"'){ cur += '"'; i++; }
        else { inQuotes = false; }
      } else { cur += c; }
    } else {
      if(c === '"'){ inQuotes = true; }
      else if(c === ',' || c === ';' || c === '\t'){ result.push(cur); cur=''; }
      else { cur += c; }
    }
  }
  result.push(cur);
  return result.map(p=>p.trim()).filter(Boolean);
}

/* ==================================================================
   FOTOS DE ALUMNOS
   Se guardan en IndexedDB (no en localStorage) porque pueden pesar mucho.
   Viven solo en este dispositivo/navegador: no se incluyen en la copia
   de seguridad ni en la sincronización con Drive.
   ================================================================== */
const PHOTO_DB_NAME = 'miHorarioPhotos';
const PHOTO_STORE = 'photos';
let _photoDbPromise = null;
function openPhotoDB(){
  if(_photoDbPromise) return _photoDbPromise;
  _photoDbPromise = new Promise((resolve, reject)=>{
    if(!('indexedDB' in window)){ reject(new Error('Este navegador no admite guardar fotos')); return; }
    const req = indexedDB.open(PHOTO_DB_NAME, 1);
    req.onupgradeneeded = ()=>{ req.result.createObjectStore(PHOTO_STORE); };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
  return _photoDbPromise;
}
let _photoCache = {};
async function savePhoto(studentId, dataUrl){
  _photoCache[studentId] = dataUrl;
  const db = await openPhotoDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(PHOTO_STORE, 'readwrite');
    tx.objectStore(PHOTO_STORE).put(dataUrl, studentId);
    tx.oncomplete = ()=>resolve();
    tx.onerror = ()=>reject(tx.error);
  });
}
async function getPhoto(studentId){
  if(Object.prototype.hasOwnProperty.call(_photoCache, studentId)) return _photoCache[studentId];
  try{
    const db = await openPhotoDB();
    const val = await new Promise((resolve)=>{
      const tx = db.transaction(PHOTO_STORE, 'readonly');
      const req = tx.objectStore(PHOTO_STORE).get(studentId);
      req.onsuccess = ()=>resolve(req.result || null);
      req.onerror = ()=>resolve(null);
    });
    // Si mientras esperábamos esta lectura alguien ya guardó una foto más reciente
    // en la caché (p.ej. una carga manual), no la pisamos con este valor antiguo.
    if(!Object.prototype.hasOwnProperty.call(_photoCache, studentId)){
      _photoCache[studentId] = val;
    }
    return val;
  }catch(e){ return null; }
}
async function deletePhoto(studentId){
  delete _photoCache[studentId];
  try{
    const db = await openPhotoDB();
    return new Promise((resolve)=>{
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).delete(studentId);
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>resolve();
    });
  }catch(e){}
}
function blobToDataUrl(blob){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=>resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
/* Reduce el tamaño de la foto (máx. 220px de lado, JPEG) antes de guardarla, para que
   ocupe poco tanto en el dispositivo como al sincronizarla con Drive. */
function compressImageBlob(blob, maxDim, quality){
  return new Promise((resolve, reject)=>{
    if(typeof Image==='undefined' || typeof document==='undefined' || !document.createElement){
      blobToDataUrl(blob).then(resolve).catch(reject);
      return;
    }
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = ()=>{
      try{
        let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        w = Math.max(1, Math.round(w*scale));
        h = Math.max(1, Math.round(h*scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', quality));
      }catch(e){ URL.revokeObjectURL(url); reject(e); }
    };
    img.onerror = ()=>{ URL.revokeObjectURL(url); reject(new Error('No se pudo procesar la imagen')); };
    img.src = url;
  });
}

/* Carga manual de una foto para un alumno concreto (por si falta en el ZIP importado). */
/* Muestra una foto de alumno en grande, a pantalla casi completa. Se cierra tocando en cualquier sitio. */
function showPhotoLightbox(url){
  const old = document.getElementById('photoLightbox');
  if(old) old.remove();
  const box = document.createElement('div');
  box.id = 'photoLightbox';
  box.className = 'photo-lightbox';
  box.innerHTML = `<img src="${url}" alt="">`;
  box.onclick = ()=> box.remove();
  document.body.appendChild(box);
}

function pickAndSaveStudentPhoto(studentId, onDone){
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.style.display = 'none';
  document.body.appendChild(inp);
  inp.onchange = async ()=>{
    const file = inp.files[0];
    if(inp.parentNode) inp.parentNode.removeChild(inp);
    if(!file) return;
    try{
      let dataUrl;
      try{ dataUrl = await compressImageBlob(file, 220, 0.72); }
      catch(e){ dataUrl = await blobToDataUrl(file); }
      await savePhoto(studentId, dataUrl);
      schedulePhotosDriveUpload();
      toast('Foto guardada');
      render();
      if(onDone) onDone();
    }catch(e){
      toast('No se pudo guardar la foto: '+e.message);
    }
  };
  inp.click();
}
function normalizeName(s){ return (s||'').trim().replace(/\s+/g,' ').toLowerCase(); }

/* ---------- Sincronización de fotos con Google Drive ---------- */
function getAllLocalPhotos(){
  return openPhotoDB().then(db => new Promise((resolve, reject)=>{
    const tx = db.transaction(PHOTO_STORE, 'readonly');
    const store = tx.objectStore(PHOTO_STORE);
    const result = {};
    const req = store.openCursor();
    req.onsuccess = (e)=>{
      const cursor = e.target.result;
      if(cursor){ result[cursor.key] = cursor.value; cursor.continue(); }
      else resolve(result);
    };
    req.onerror = ()=>reject(req.error);
  })).catch(()=>({}));
}

let _photosUploadTimer = null;
function schedulePhotosDriveUpload(){
  if(!driveConfigured() || !driveIsConnected()) return;
  clearTimeout(_photosUploadTimer);
  _photosUploadTimer = setTimeout(drivePhotosUpload, 2000);
}

/* Sube todas las fotos guardadas localmente a un archivo propio en Drive. */
async function drivePhotosUpload(){
  if(!driveConfigured() || !driveIsConnected()) return;
  try{
    const photos = await getAllLocalPhotos();
    if(Object.keys(photos).length===0) return;
    const token = await driveGetToken(true);
    const remote = await driveFindFile(token, DRIVE_PHOTOS_FILE_NAME);
    const payload = { lastModified: Date.now(), photos };
    await driveUpload(token, remote ? remote.id : null, payload, DRIVE_PHOTOS_FILE_NAME);
    localStorage.setItem('drivePhotosPushedModified', String(payload.lastModified));
  }catch(e){ /* silencioso: se reintentará en la próxima sincronización */ }
}

/* Al abrir la app: si hay fotos más recientes en Drive que las que ya se bajaron aquí, las trae. */
async function drivePhotosDownloadIfNewer(){
  if(!driveConfigured() || !driveIsConnected()) return;
  try{
    const token = await driveGetToken(true);
    const remote = await driveFindFile(token, DRIVE_PHOTOS_FILE_NAME);
    if(!remote) return;
    const data = await driveDownload(token, remote.id);
    const remoteModified = data.lastModified || 0;
    const localKnown = Number(localStorage.getItem('drivePhotosDownloadedModified')||0);
    if(remoteModified > localKnown){
      const entries = Object.entries(data.photos||{});
      for(const [studentId, dataUrl] of entries){ await savePhoto(studentId, dataUrl); }
      localStorage.setItem('drivePhotosDownloadedModified', String(remoteModified));
      fillPhotoPlaceholders(document);
      if(ui.tab==='subjects') fillSubjectPhotoCounts(document);
    }
  }catch(e){ /* silencioso */ }
}

/* Rellena todos los <div data-photo-for="studentId"> visibles con la foto guardada (async). */
function fillPhotoPlaceholders(root){
  const nodes = (root||document).querySelectorAll('[data-photo-for]');
  const pending = [];
  nodes.forEach(el=>{
    const sid = el.dataset.photoFor;
    if(Object.prototype.hasOwnProperty.call(_photoCache, sid)){
      const url = _photoCache[sid];
      if(url){ el.innerHTML = `<img src="${url}" alt="">`; el.classList.add('has-photo'); }
      return;
    }
    pending.push(el);
  });
  if(pending.length===0) return Promise.resolve();
  return Promise.all(pending.map(async el=>{
    const sid = el.dataset.photoFor;
    const url = await getPhoto(sid);
    if(url){ el.innerHTML = `<img src="${url}" alt="">`; el.classList.add('has-photo'); }
  }));
}

async function importStudentPhotosZip(e, subjectId){
  const file = e.target.files[0];
  if(!file) return;
  if(typeof JSZip==='undefined'){ toast('No se pudo cargar el lector de ZIP. Revisa tu conexión.'); e.target.value=''; return; }
  toast('Leyendo el archivo ZIP...');
  try{
    const zip = await JSZip.loadAsync(file);
    const students = state.students.filter(s=>s.subjectId===subjectId);
    const byName = {};
    students.forEach(s=> byName[normalizeName(s.name)] = s);

    const entries = Object.values(zip.files).filter(f=>!f.dir && /\.(jpe?g|png|gif|webp)$/i.test(f.name));
    const matchedNames = [];
    const unmatchedFiles = [];

    for(const entry of entries){
      const base = entry.name.split('/').pop();
      const m = base.match(/^\s*[\w-]+\s*-\s*(.+)\.\w+$/i);
      const namePart = m ? m[1].trim() : base.replace(/\.\w+$/,'').trim();
      const student = byName[normalizeName(namePart)];
      if(student){
        const arrayBuffer = await entry.async('arraybuffer');
        const blob = new Blob([arrayBuffer]);
        let dataUrl;
        try{ dataUrl = await compressImageBlob(blob, 220, 0.72); }
        catch(e){ dataUrl = await blobToDataUrl(blob); }
        await savePhoto(student.id, dataUrl);
        matchedNames.push(student.name);
      } else {
        unmatchedFiles.push(base);
      }
    }
    const missingStudents = students.filter(s=>!matchedNames.includes(s.name)).map(s=>s.name);

    openModal(`
      <div class="modal-head"><div class="modal-title">Fotos importadas</div>
        <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
      <p style="font-size:13.5px;color:var(--ink);margin-bottom:12px;"><b>${matchedNames.length}</b> fotos asignadas correctamente.</p>
      ${unmatchedFiles.length ? `<div class="field"><label>Archivos del ZIP que no coinciden con ningún alumno de esta clase (${unmatchedFiles.length})</label>
        <div style="max-height:140px;overflow-y:auto;background:var(--bg);border-radius:12px;padding:10px 14px;font-size:12.5px;color:var(--ink-soft);">${unmatchedFiles.map(n=>escapeHtml(n)).join('<br>')}</div></div>` : ''}
      ${missingStudents.length ? `<div class="field"><label>Alumnos de esta clase sin foto (${missingStudents.length})</label>
        <div style="max-height:140px;overflow-y:auto;background:var(--bg);border-radius:12px;padding:10px 14px;font-size:12.5px;color:var(--ink-soft);">${missingStudents.map(n=>escapeHtml(n)).join('<br>')}</div></div>` : ''}
      <button class="btn btn-primary" id="fPhotosDone" style="margin-top:6px;">Aceptar</button>
    `);
    document.getElementById('fPhotosDone').onclick=()=>{ closeModal(); render(); openSubjectDetailModal(subjectId); };
    if(matchedNames.length) schedulePhotosDriveUpload();
  }catch(err){
    toast('No se pudo leer el archivo ZIP: '+err.message);
  }
  e.target.value='';
}

function parseStudentsCsv(text){
  return text.split(/\r?\n/)
    .map(line=>line.trim())
    .filter(Boolean)
    .map(line=>{
      // Dos columnas -> se interpretan como "Apellidos,Nombre" y se guardan como "Apellidos, Nombre".
      // Una sola columna (aunque ya contenga una coma protegida entre comillas) -> se deja tal cual.
      const parts = splitCsvLine(line);
      if(parts.length===2) return `${parts[0]}, ${parts[1]}`;
      return parts.join(' ').replace(/\s+/g,' ').trim();
    })
    .filter(name => name && name.toLowerCase() !== 'nombre' && name.toLowerCase() !== 'alumno' && name.toLowerCase()!=='alumno/a' && name.toLowerCase()!=='apellidos, nombre');
}

function importStudentsCsv(e, subjectId){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    const names = parseStudentsCsv(String(reader.result));
    if(names.length===0){ toast('No se encontró ningún nombre en el archivo'); e.target.value=''; return; }
    openModal(`
      <div class="modal-head"><div class="modal-title">Importar alumnos</div>
        <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
      <p style="font-size:13.5px;color:var(--ink-soft);line-height:1.5;">Se van a añadir <b>${names.length}</b> alumnos a esta clase:</p>
      <div style="max-height:200px;overflow-y:auto;background:var(--bg);border-radius:12px;padding:10px 14px;font-size:13px;color:var(--ink);margin-bottom:14px;">
        ${names.map(n=>escapeHtml(n)).join('<br>')}
      </div>
      <div class="btn-row">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="fConfirmCsv" style="margin-top:0">Importar</button>
      </div>
    `);
    document.getElementById('fConfirmCsv').onclick=()=>{
      names.forEach(name=> state.students.push({ id:uid(), subjectId, name }));
      saveState(); render(); closeModal(); openSubjectDetailModal(subjectId); toast(`${names.length} alumnos añadidos`);
    };
    e.target.value='';
  };
  reader.readAsText(file);
}

const ACTITUD_OPTIONS = [
  {v:'AV', label:'AV', title:'Una observació'},
  {v:'2AV', label:'2AV', title:'Dues observacions'},
  {v:'CC', label:'CC', title:'Una falta lleu'},
  {v:'2CC', label:'2CC', title:'Dues faltes lleus'},
  {v:'FG', label:'FG', title:'Falta greu'},
];

function getOrCreateRecord(studentId, dateIso){
  let rec = state.records.find(r=>r.studentId===studentId && r.date===dateIso);
  if(!rec){
    rec = { id:uid(), studentId, date:dateIso, assistencia:[], actitud:null, actitudNota:'', deures:null, participacio:null, gestio:null, _new:true };
  }
  return rec;
}
function persistRecord(rec){
  const isEmpty = rec.assistencia.length===0 && !rec.actitud && !rec.actitudNota.trim() && rec.deures==null && rec.participacio==null && rec.gestio==null;
  const idx = state.records.findIndex(r=>r.id===rec.id);
  if(isEmpty){
    if(idx>=0) state.records.splice(idx,1);
  } else if(idx>=0){
    state.records[idx] = rec;
  } else {
    delete rec._new;
    state.records.push(rec);
  }
  saveState();
}

/* ==================================================================
   PIZARRA: rondas de turnos para salir a resolver ejercicios de deberes.
   Una ronda pertenece a una clase (asignatura + tramo horario) concreta,
   empieza un día determinado, y mientras esté abierta cada alumno solo
   puede tener UN turno (aunque ese turno incluya varios ejercicios). La
   nota de cada turno (0/1/2) se escribe siempre como Participació del
   alumno en el día en que EMPEZÓ la ronda, aunque el turno en sí se
   resuelva en un día posterior.
   ================================================================== */
/* Se busca por ASIGNATURA (no por tramo horario concreto): igual que con los
   deberes, si esta clase se da varios días a la semana, una ronda abierta en un
   tramo tiene que seguir viéndose aunque hoy se esté usando otro tramo distinto. */
function getOpenRound(subjectId, classId){
  return state.boardRounds.find(r=>r.subjectId===subjectId && r.status==='open') || null;
}
function getRoundsForClass(subjectId, classId){
  return state.boardRounds.filter(r=>r.subjectId===subjectId).sort((a,b)=>b.startDate.localeCompare(a.startDate));
}
function startNewRound(subjectId, classId, startDate){
  state.boardRounds.forEach(r=>{ if(r.subjectId===subjectId && r.status==='open') r.status='closed'; });
  const round = { id:uid(), subjectId, classId, startDate, status:'open', turns:[], teacherDone:[] };
  state.boardRounds.push(round);
  saveState();
  return round;
}
function closeRound(round){
  round.status = 'closed';
  saveState();
}
function deleteRound(round){
  // Deshacemos las notas de Participació que hubiera puesto esta ronda, solo si nadie
  // las ha cambiado por otra cosa distinta desde entonces.
  round.turns.forEach(t=>{
    if(t.score!=null){
      const rec = state.records.find(r=>r.studentId===t.studentId && r.date===round.startDate);
      if(rec && rec.participacio===t.score){ rec.participacio = null; persistRecord(rec); }
    }
  });
  state.boardRounds = state.boardRounds.filter(r=>r.id!==round.id);
  saveState();
}
function addTeacherDone(round, exercises){
  if(!round.teacherDone) round.teacherDone = [];
  round.teacherDone.push({ id:uid(), exercises, doneDate: todayISO() });
  saveState();
}
function addTurn(round, studentId, exercises){
  const turn = { id:uid(), studentId, exercises, score:null, turnDate: todayISO() };
  round.turns.push(turn);
  saveState();
  return turn;
}
function removeTurn(round, turnId){
  const turn = round.turns.find(t=>t.id===turnId);
  round.turns = round.turns.filter(t=>t.id!==turnId);
  saveState();
  // Si esa nota ya se había volcado a Participació, la quitamos también de ahí
  // (solo si nadie más ha vuelto a poner otra cosa distinta desde entonces).
  if(turn && turn.score!=null){
    const rec = state.records.find(r=>r.studentId===turn.studentId && r.date===round.startDate);
    if(rec && rec.participacio===turn.score){ rec.participacio = null; persistRecord(rec); }
  }
}
function setTurnScore(round, turnId, score){
  const turn = round.turns.find(t=>t.id===turnId);
  if(!turn) return;
  turn.score = score;
  const rec = getOrCreateRecord(turn.studentId, round.startDate);
  rec.participacio = score;
  persistRecord(rec);
  saveState();
}

/* Pantalla de la pestaña Pizarra: elegir clase, ver/gestionar la ronda abierta. */
/* Interpreta el texto de deberes con el formato "pàg. N, ex. A, B, C d, e, pàg. M, ex. ..."
   y lo convierte en una lista de ejercicios seleccionables, separando los apartados
   (a, b, c) de un mismo ejercicio en entradas independientes. Si el texto no sigue
   este patrón (ejercicios sin página, "cinc exercicis de...", etc.), devuelve una
   lista vacía, y el profesor puede escribirlo a mano igualmente. */
/* Marca ejercicios de un día de deberes concreto como "ya hechos" (asignados a un
   alumno o resueltos por el profesor en la pizarra sin asignar a nadie), para que
   dejen de aparecer en la lista de pendientes. */
function markExercisesUsed(subjectId, classId, entries){
  // entries: [{date, key}, ...] -- pueden venir de días de deberes distintos a la vez.
  // Se busca por asignatura (no por tramo horario), por el mismo motivo que al leerlos.
  if(!entries || entries.length===0) return;
  const byDate = {};
  entries.forEach(e=>{ (byDate[e.date] = byDate[e.date]||[]).push(e.key); });
  Object.keys(byDate).forEach(date=>{
    const item = state.items.find(i=>i.type==='task' && i.kind==='deberes' && i.subjectId===subjectId && i.date===date);
    if(!item) return;
    const set = new Set(item.usedExerciseKeys||[]);
    byDate[date].forEach(k=>set.add(k));
    item.usedExerciseKeys = [...set];
  });
  saveState();
}
function unmarkExerciseUsed(subjectId, classId, deberesDate, key){
  const item = state.items.find(i=>i.type==='task' && i.kind==='deberes' && i.subjectId===subjectId && i.date===deberesDate);
  if(!item || !item.usedExerciseKeys) return;
  item.usedExerciseKeys = item.usedExerciseKeys.filter(k=>k!==key);
  saveState();
}

function parseDeberesExercises(text){
  if(!text) return [];
  const out = [];
  // Buscamos cada bloque "pàg. N ... ex. <lista>" hasta el siguiente "pàg." o el final.
  const pageRe = /p[àa]g\.?\s*(\d+)[.,]?\s*ex\.?\s*([^]*?)(?=p[àa]g\.?\s*\d+|$)/gi;
  let m;
  while((m = pageRe.exec(text)) !== null){
    const page = m[1];
    const list = m[2];
    // Separamos por comas, pero unas van justo antes de la lista de otra página: cortamos
    // también si aparece un punto seguido (fin de frase) para no arrastrar texto de más.
    const tokens = list.split(/[,;]/).map(t=>t.trim()).filter(Boolean);
    let currentNum = null;
    tokens.forEach(tok=>{
      const mFull = tok.match(/^(\d+)\s*([a-zà-ÿ])?\.?$/i);
      if(mFull){
        currentNum = mFull[1];
        out.push({ page, num: currentNum, letter: mFull[2]||null });
      } else {
        const mLetter = tok.match(/^([a-zà-ÿ])\.?$/i);
        if(mLetter && currentNum){
          out.push({ page, num: currentNum, letter: mLetter[1] });
        }
        // Si no encaja ni como número ni como letra suelta, se ignora ese trozo
        // (probablemente sea texto explicativo, no un ejercicio).
      }
    });
  }
  return out.map(e=>({
    label: `pàg. ${e.page}, ex. ${e.num}${e.letter?e.letter:''}`,
    key: `${e.page}-${e.num}${e.letter||''}`,
  }));
}

function renderBoardTab(){
  const subjects = [...state.subjects].sort((a,b)=>a.name.localeCompare(b.name,'es'));
  if(subjects.length===0){
    return `<div class="empty-state"><span class="emoji">📚</span><div class="et">Todavía no hay clases</div><div class="es">Crea una clase primero en la pestaña Clases.</div></div>`;
  }
  if(!ui.boardSubjectId || !subjects.some(s=>s.id===ui.boardSubjectId)) ui.boardSubjectId = subjects[0].id;
  const subj = getSubject(ui.boardSubjectId);
  if(!ui.boardDay) ui.boardDay = todayISO();

  // El tramo horario se deduce del día elegido: si esta asignatura solo tiene una
  // clase ese día de la semana, se selecciona sola; si tiene varias, hay que elegir.
  const daySlots = state.classes.filter(c=>c.subjectId===ui.boardSubjectId && c.days.includes(mondayIndex(parseISO(ui.boardDay))) && classActiveOnDate(c, ui.boardDay));
  if(daySlots.length===1){
    ui.boardClassId = daySlots[0].id;
  } else if(daySlots.length>1){
    if(!ui.boardClassId || !daySlots.some(s=>s.id===ui.boardClassId)) ui.boardClassId = daySlots[0].id;
  } else {
    ui.boardClassId = null;
  }
  const cls = ui.boardClassId ? state.classes.find(c=>c.id===ui.boardClassId) : null;
  const students = state.students.filter(s=>s.subjectId===ui.boardSubjectId).sort((a,b)=>a.name.localeCompare(b.name,'es'));

  const subjectSelect = `<div class="field">
    <label>Clase</label>
    <select id="boardSubjectSelect">${subjects.map(s=>`<option value="${s.id}" ${s.id===ui.boardSubjectId?'selected':''}>${escapeHtml(s.name)}</option>`).join('')}</select>
  </div>`;
  const daySelect = `<div class="field">
    <label>Día</label>
    <input type="date" id="boardDaySelect" value="${ui.boardDay}">
  </div>`;
  const slotSelect = daySlots.length>1 ? `<div class="field">
    <label>Tramo horario (esta asignatura tiene varios ese día)</label>
    <select id="boardSlotSelect">${daySlots.map(s=>`<option value="${s.id}" ${s.id===ui.boardClassId?'selected':''}>${s.start}–${s.end}${s.room?' · '+escapeHtml(s.room):''}</option>`).join('')}</select>
  </div>` : '';

  if(!cls){
    return `${subjectSelect}${daySelect}${slotSelect}<div class="empty-state"><span class="emoji">📚</span><div class="et">Esta asignatura no tiene clase ese día</div><div class="es">Elige otro día, o revisa los tramos horarios de esta clase.</div></div>`;
  }
  if(students.length===0){
    return `${subjectSelect}${daySelect}${slotSelect}<div class="empty-state"><span class="emoji">📚</span><div class="et">Esta clase todavía no tiene alumnos</div></div>`;
  }

  const round = getOpenRound(ui.boardSubjectId, ui.boardClassId);
  const pastRounds = getRoundsForClass(ui.boardSubjectId, ui.boardClassId).filter(r=>r.status==='closed');

  let roundHtml;
  if(!round){
    roundHtml = `
      <div class="card" style="padding:16px;">
        <div style="font-size:13.5px;color:var(--ink-soft);margin-bottom:10px;">No hay ninguna ronda abierta para esta clase.</div>
        <div class="field" style="margin-bottom:10px;"><label>Día en que empieza</label><input type="date" id="boardNewRoundDate" value="${ui.boardDay}"></div>
        <button class="btn btn-primary" id="boardStartRound">${ICONS.pencil} Empezar ronda nueva</button>
      </div>`;
  } else {
    const wentIds = new Set(round.turns.map(t=>t.studentId));
    const remaining = students.filter(s=>!wentIds.has(s.id));
    const turnsHtml = round.turns.map(t=>{
      const st = state.students.find(s=>s.id===t.studentId);
      return `<div class="card" style="padding:11px 13px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <b style="font-size:13.5px;">${escapeHtml(st?st.name:'?')}</b>
            <div style="font-size:12.5px;color:var(--ink-soft);margin-top:2px;white-space:pre-wrap;">${escapeHtml(t.exercises)}</div>
            <div style="font-size:10.5px;color:var(--ink-faint);margin-top:3px;">Turno del ${dateLabel(t.turnDate)}</div>
          </div>
          <button data-remove-turn="${t.id}" class="student-list-del" aria-label="Eliminar turno" style="flex-shrink:0;">${ICONS.x}</button>
        </div>
        <div class="dr-chips" style="margin-top:8px;">
          ${['0','1','2'].map(v=>`<button type="button" class="board-score-chip ${String(t.score)===v?'active':''}" data-turn="${t.id}" data-score="${v}">${v}</button>`).join('')}
        </div>
      </div>`;
    }).join('');

    roundHtml = `
      <div class="field">
        <label>Ronda abierta desde el ${dateLabel(round.startDate)}</label>
        ${turnsHtml || `<div style="font-size:13px;color:var(--ink-faint);margin-bottom:10px;">Todavía no ha salido nadie en esta ronda.</div>`}
      </div>
      ${remaining.length ? `
      <div class="card" style="padding:14px;margin-bottom:10px;">
        <div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin-bottom:8px;">Añadir turno</div>
        <div class="field" style="margin-bottom:8px;">
          <select id="boardTurnStudent">
            <option value="__teacher__">— Yo, el profesor (sin asignar a nadie) —</option>
            ${remaining.map(s=>`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}
          </select>
        </div>
        ${(()=>{
          // Se juntan los ejercicios pendientes de TODOS los días de deberes hasta el
          // día actual de la ronda (los deberes se van acumulando: puede que hoy se
          // estén corrigiendo restos de un día anterior junto a los de hoy mismo).
          // Buscamos por ASIGNATURA (no por tramo horario concreto): si esta clase se
          // da varios días a la semana, el deberes puesto en un tramo tiene que
          // seguir apareciendo aunque hoy se esté usando otro tramo distinto.
          // Usamos la fecha de HOY de verdad (no el selector de arriba, que es solo
          // para encontrar/abrir la ronda): si la ronda lleva varios días abierta,
          // los deberes que se han ido mandando mientras tanto tienen que seguir
          // apareciendo, sin tener que acordarte de mover ese selector cada día.
          const deberesItems = state.items.filter(i=>i.type==='task' && i.kind==='deberes' && i.subjectId===ui.boardSubjectId && i.date<=todayISO()).sort((a,b)=>a.date.localeCompare(b.date));
          if(deberesItems.length===0) return '';
          let anyFormatted = false;
          const pendingHtml = deberesItems.map(item=>{
            const allExercises = parseDeberesExercises(item.notes||item.title);
            if(allExercises.length===0) return '';
            anyFormatted = true;
            const usedKeys = new Set(item.usedExerciseKeys||[]);
            const exercises = allExercises.filter(e=>!usedKeys.has(e.key));
            const doneExercises = allExercises.filter(e=>usedKeys.has(e.key));
            return `
            <div style="margin-bottom:8px;">
              <div style="font-size:10.5px;font-weight:700;color:var(--ink-faint);margin-bottom:4px;">${dateLabel(item.date)}</div>
              ${exercises.length ? `<div class="dr-chips board-exercise-chips">${exercises.map(e=>`<button type="button" data-ex="${escapeHtml(e.label)}" data-exkey="${escapeHtml(e.key)}" data-exdate="${item.date}">${escapeHtml(e.label)}</button>`).join('')}</div>` : `<div style="font-size:11px;color:var(--ink-faint);">Ya no quedan ejercicios pendientes de este día.</div>`}
              ${doneExercises.length ? `<div style="font-size:10px;color:var(--ink-faint);margin-top:4px;">Ya hechos (sin alumno): ${doneExercises.map(e=>`<span data-undo-done="${escapeHtml(e.key)}" data-undo-date="${item.date}" style="text-decoration:underline;cursor:pointer;">${escapeHtml(e.label)}</span>`).join(', ')}</div>` : ''}
            </div>`;
          }).join('');
          if(!anyFormatted) return `<div style="font-size:11.5px;color:var(--ink-faint);margin-bottom:8px;">Los deberes de esta clase no siguen el formato de página/ejercicio, escríbelos abajo a mano.</div>`;
          return `
          <div class="field" style="margin-bottom:4px;">
            <label style="font-size:11px;">Ejercicios pendientes (toca los que le toquen)</label>
            ${pendingHtml}
          </div>
          `;
        })()}
        <textarea id="boardTurnExercises" placeholder="Puedes escribir aquí a mano ejercicios que no salgan arriba (o todos, si no siguen ese formato)" style="min-height:50px;margin-bottom:8px;"></textarea>
        <button class="btn btn-ghost" id="boardAddTurn">${ICONS.pencil} Añadir</button>
      </div>` : `<div style="font-size:12.5px;color:var(--ink-faint);margin-bottom:10px;">Ya han salido todos los alumnos en esta ronda.</div>`}
      <button class="btn btn-danger" id="boardCloseRound">${ICONS.trash} Cerrar esta ronda y empezar otra</button>
      <button class="btn btn-ghost" id="boardDeleteRound" style="margin-top:8px;color:var(--danger);">Eliminar esta ronda por completo (p.ej. si era el grupo equivocado)</button>
    `;
  }

  const pastHtml = pastRounds.length ? `
    <div style="height:1px;background:var(--line);margin:20px 0 14px;"></div>
    <div style="font-size:13px;font-weight:700;color:var(--ink-soft);margin-bottom:10px;">Rondas anteriores</div>
    ${pastRounds.map(r=>{
      const isOpenDetail = ui.boardExpandedPastRound===r.id;
      const teacherDone = r.teacherDone||[];
      const turnsDetail = r.turns.map(t=>{
        const st = state.students.find(s=>s.id===t.studentId);
        return `<div style="padding:8px 0;border-bottom:1px solid var(--line);">
          <b style="font-size:12.5px;">${escapeHtml(st?st.name:'?')}</b>
          <div style="font-size:12px;color:var(--ink-soft);margin-top:2px;white-space:pre-wrap;">${escapeHtml(t.exercises)}</div>
          <div style="font-size:11px;color:var(--ink-faint);margin-top:2px;">Nota: ${t.score==null?'sin poner':t.score} · turno del ${dateLabel(t.turnDate)}</div>
        </div>`;
      }).join('');
      const teacherDetail = teacherDone.map(td=>`<div style="padding:8px 0;border-bottom:1px solid var(--line);">
        <b style="font-size:12.5px;">👨‍🏫 Hecho por el profesor</b>
        <div style="font-size:12px;color:var(--ink-soft);margin-top:2px;white-space:pre-wrap;">${escapeHtml(td.exercises)}</div>
        <div style="font-size:11px;color:var(--ink-faint);margin-top:2px;">${dateLabel(td.doneDate)}</div>
      </div>`).join('');
      const detail = (turnsDetail+teacherDetail) || `<div style="font-size:12px;color:var(--ink-faint);padding:8px 0;">No queda ningún detalle guardado de esta ronda.</div>`;
      return `<div class="card" style="padding:0;margin-bottom:8px;overflow:hidden;">
        <div data-toggle-past-round="${r.id}" style="padding:11px 13px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12.5px;color:var(--ink-soft);">Del ${dateLabel(r.startDate)} · ${r.turns.length} turno(s)${teacherDone.length?' · '+teacherDone.length+' hecho(s) por el profesor':''}</span>
          <span style="color:var(--ink-faint);transform:rotate(${isOpenDetail?'90deg':'0deg'});">${ICONS.chevR}</span>
        </div>
        ${isOpenDetail ? `<div style="padding:0 13px 11px;">${detail}</div>` : ''}
      </div>`;
    }).join('')}
  ` : '';

  return `${subjectSelect}${daySelect}${slotSelect}${roundHtml}${pastHtml}`;
}

function openExportRangeModal(subjectId){
  const allSubjects = [...state.subjects].filter(s=> state.students.some(st=>st.subjectId===s.id)).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  if(allSubjects.length===0){
    openModal(`<div class="modal-head"><div class="modal-title">Exportar lista del día</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
      <p style="font-size:13.5px;color:var(--ink-soft);">Todavía no tienes alumnos añadidos en ninguna clase. Ve a Clases → entra en una → Añadir alumno.</p>`);
    return;
  }
  if(!subjectId || !allSubjects.some(s=>s.id===subjectId)) subjectId = allSubjects[0].id;

  openModal(`
    <div class="modal-head"><div class="modal-title">Exportar lista del día</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <p style="font-size:13px;color:var(--ink-soft);margin-bottom:14px;">Elige la clase y el día. Se generará un Excel con una fila por alumno de ese curso.</p>
    <div class="field">
      <label>Curso</label>
      <select id="expSubject">${allSubjects.map(s=>`<option value="${s.id}" ${s.id===subjectId?'selected':''}>${escapeHtml(s.name)}</option>`).join('')}</select>
    </div>
    <div class="field">
      <label>Día</label>
      <input type="date" id="expDay" value="${todayISO()}">
    </div>
    <button class="btn btn-primary" id="expGo">${ICONS.download} Descargar Excel</button>
  `);

  document.getElementById('expGo').onclick=()=>{
    const sid = document.getElementById('expSubject').value;
    const day = document.getElementById('expDay').value;
    if(!day){ toast('Indica un día'); return; }
    exportDayXlsx(sid, day);
    closeModal();
  };
}

function buildDayRows(subjectId, dateIso){
  const students = state.students.filter(s=>s.subjectId===subjectId).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  return students.map(s=>{
    const rec = state.records.find(r=>r.studentId===s.id && r.date===dateIso);
    return {
      'Alumnes': s.name,
      'Astc.': rec ? rec.assistencia.join(' + ') : '',
      'Actitud': rec && rec.actitud ? rec.actitud : '',
      'Deures': rec && rec.deures!=null ? rec.deures : '',
      'Participació': rec && rec.participacio!=null ? rec.participacio : '',
      'Gestió': rec && rec.gestio!=null ? rec.gestio : '',
    };
  });
}

/* Prepara los datos de asistencia/actitud/deberes de un día para volcarlos en iEduca
   mediante el marcador (bookmarklet). Solo incluye lo que SÍ se traslada a iEduca:
   F, R, m (asistencia), CC (actitud) y Deures=0. Expulsión y Justificada son solo
   internos de Mi Horario y no se envían.
   Usamos las LETRAS (F, R, m, C, D) tal como se ven en los botones de iEduca, en vez
   de números internos, porque esos números pueden ser distintos según el grupo/curso. */
function copyDayForIeduca(subjectId, dateIso){
  const subj = getSubject(subjectId);
  const students = state.students.filter(s=>s.subjectId===subjectId).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  if(students.length===0){ toast('Esta clase todavía no tiene alumnos'); return; }
  const payload = { app:'MiHorario', v:2, date:dateIso, subject:subj?subj.name:'', students:[] };
  students.forEach(s=>{
    const rec = state.records.find(r=>r.studentId===s.id && r.date===dateIso);
    if(!rec) return;
    const codes = [];
    (rec.assistencia||[]).forEach(a=>{ if(a==='F'||a==='R'||a==='m') codes.push(a); });
    if(rec.actitud==='CC') codes.push('C');
    if(rec.deures===0) codes.push('D');
    // La nota escrita en Mi Horario viaja siempre que haya texto, se haya marcado
    // CC o no (por ejemplo, con AV, o sin ningún código de asistencia).
    const obsText = (rec.actitudNota && rec.actitudNota.trim()) ? rec.actitudNota.trim() : null;
    if(codes.length || obsText){
      const entry = { name:s.name, codes };
      if(obsText) entry.obsText = obsText;
      payload.students.push(entry);
    }
  });
  if(payload.students.length===0){ toast('No hay nada que trasladar a iEduca para ese día (ni F/R/m, ni CC, ni Deures=0)'); return; }
  const text = JSON.stringify(payload);
  const finish = ()=>{
    openModal(`
      <div class="modal-head"><div class="modal-title">Copiado para iEduca</div>
        <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
      <p style="font-size:13.5px;color:var(--ink);line-height:1.6;">
        Se ha copiado al portapapeles la información de <b>${payload.students.length}</b> alumno(s) para el ${dateLabel(dateIso)}.<br><br>
        Ahora ve a la pestaña de iEduca donde pasas lista de <b>${escapeHtml(subj?subj.name:'')}</b> ese mismo día, y pulsa el marcador "Volcar a iEduca" que tienes guardado en tu navegador.
      </p>
      <button class="btn btn-primary" id="ieducaCopyDone">Entendido</button>
    `);
    document.getElementById('ieducaCopyDone').onclick=()=>closeModal();
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(finish).catch(()=>{
      toast('No se pudo copiar automáticamente. Revisa los permisos del navegador.');
    });
  } else {
    toast('Tu navegador no permite copiar automáticamente aquí.');
  }
}
function dateLabel(dateIso){ return parseISO(dateIso).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'}); }

/* Trae de vuelta lo que el marcador "Leer de iEduca" copió al portapapeles: para cada
   alumno emparejado, muestra qué se propone cambiar en el registro diario de Mi
   Horario, y solo aplica tras confirmar. F/R/m se sincronizan tal cual (añadiendo o
   quitando, sin tocar J/E que son solo de Mi Horario); C solo añade CC si no había ya
   otra actitud puesta; D solo pone Deures=0 si no había ya otro valor puesto; la nota
   solo se copia si Mi Horario no tenía ya una escrita (si hay una distinta, se marca
   como conflicto y no se toca, para no perder nada). */
function normalizeNameForMatch(s){
  return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();
}
function nameMatchScore(a, b){
  const wa = normalizeNameForMatch(a).split(' ').filter(Boolean);
  const wb = normalizeNameForMatch(b).split(' ').filter(Boolean);
  if(wa.length===0) return 0;
  let hits = 0; wa.forEach(w=>{ if(wb.includes(w)) hits++; });
  return hits/wa.length;
}

async function pasteDayFromIeduca(subjectId, dateIso){
  let raw;
  try{ raw = await navigator.clipboard.readText(); }
  catch(e){ toast('No se pudo leer el portapapeles. Revisa los permisos del navegador.'); return; }
  let payload;
  try{ payload = JSON.parse(raw); if(payload.app!=='MiHorario' || payload.mode!=='import') throw 0; }
  catch(e){ toast('No hay ningún dato copiado desde el marcador "Leer de iEduca". Cópialo primero allí.'); return; }

  const subj = getSubject(subjectId);
  const students = state.students.filter(s=>s.subjectId===subjectId);
  const plan = payload.students.map(st=>{
    let best = null, bestScore = 0;
    students.forEach(s=>{ const sc = nameMatchScore(st.name, s.name); if(sc>bestScore){ bestScore=sc; best=s; } });
    const matched = (best && bestScore>=0.5) ? best : null;
    const rec = matched ? (state.records.find(r=>r.studentId===matched.id && r.date===dateIso) || null) : null;
    const changes = [];
    let conflict = null;
    if(matched){
      if(st.codes.includes('C') && rec?.actitud && rec.actitud!=='CC') conflict = `Ya tiene Actitud=${rec.actitud} en Mi Horario`;
      if(st.obsText && rec?.actitudNota && rec.actitudNota.trim() && rec.actitudNota.trim()!==st.obsText.trim()){
        conflict = (conflict?conflict+'; ':'') + 'ya hay una nota distinta escrita';
      }
      if(st.codes.includes('F')) changes.push('Falta');
      if(st.codes.includes('R')) changes.push('Retraso');
      if(st.codes.includes('m')) changes.push('Material');
      if(st.codes.includes('E')) changes.push('E (Exempt/Expulsió en iEduca)');
      if(st.codes.includes('C') && (!rec || !rec.actitud || rec.actitud==='CC')) changes.push('Actitud CC');
      if(st.codes.includes('D') && (!rec || rec.deures==null || rec.deures===0)) changes.push('Deures=0');
      if(st.obsText && (!rec || !rec.actitudNota || !rec.actitudNota.trim())) changes.push('Nota: "'+(st.obsText.length>50?st.obsText.slice(0,50)+'…':st.obsText)+'"');
    }
    return { ieducaName: st.name, matched, changes, conflict, codes:st.codes, obsText:st.obsText };
  });

  const rows = plan.map(p=>{
    if(!p.matched) return `<div class="card" style="padding:10px 12px;margin-bottom:6px;"><b style="color:var(--danger);">${escapeHtml(p.ieducaName)}</b><div style="font-size:12px;color:var(--ink-faint);">Sin coincidencia clara en esta clase, no se tocará.</div></div>`;
    return `<div class="card" style="padding:10px 12px;margin-bottom:6px;">
      <b>${escapeHtml(p.matched.name)}</b>
      <div style="font-size:12.5px;color:var(--ink-soft);margin-top:2px;">${p.changes.length?escapeHtml(p.changes.join(' · ')):'Sin cambios'}</div>
      ${p.conflict?`<div style="font-size:11.5px;color:var(--danger);margin-top:2px;">⚠ ${escapeHtml(p.conflict)} — no se tocará</div>`:''}
    </div>`;
  }).join('');

  openModal(`
    <div class="modal-head"><div class="modal-title">Pegar desde iEduca</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <p style="font-size:13px;color:var(--ink-soft);margin-bottom:6px;">Buscando coincidencias entre los <b>${students.length}</b> alumnos de <b>${escapeHtml(subj?subj.name:'?')}</b>. Si esperabas otra clase, cierra y vuelve a elegirla arriba.</p>
    <p style="font-size:13px;color:var(--ink-soft);margin-bottom:12px;">Revisa antes de aplicar. Lo que salga en rojo o con conflicto no se tocará.</p>
    <div style="max-height:50vh;overflow-y:auto;">${rows}</div>
    <button class="btn btn-primary" id="ieducaPasteApply" style="margin-top:10px;">Aplicar</button>
  `);

  document.getElementById('ieducaPasteApply').onclick=()=>{
    let applied = 0;
    plan.forEach(p=>{
      if(!p.matched || p.conflict) return;
      let rec = state.records.find(r=>r.studentId===p.matched.id && r.date===dateIso);
      if(!rec){ rec = { id:uid(), studentId:p.matched.id, date:dateIso, assistencia:[], actitud:null, actitudNota:'', deures:null, participacio:null, gestio:null }; state.records.push(rec); }
      // F/R/m/E se sincronizan tal cual (sin tocar J, que es solo de Mi Horario)
      rec.assistencia = (rec.assistencia||[]).filter(a=>a!=='F'&&a!=='R'&&a!=='m'&&a!=='E');
      ['F','R','m','E'].forEach(c=>{ if(p.codes.includes(c)) rec.assistencia.push(c); });
      if(p.codes.includes('C') && (!rec.actitud || rec.actitud==='CC')) rec.actitud = 'CC';
      if(p.codes.includes('D') && (rec.deures==null || rec.deures===0)) rec.deures = 0;
      if(p.obsText && (!rec.actitudNota || !rec.actitudNota.trim())) rec.actitudNota = p.obsText;
      applied++;
    });
    saveState(); render(); closeModal();
    toast(`Aplicado a ${applied} alumno(s) desde iEduca`);
  };
}

/* Trae de vuelta lo que el marcador "Leer pagos de iEduca" copió: una lista de
   TODOS los alumnos de TODOS los cursos con su estado de pago. Se emparejan por
   nombre contra los alumnos de Mi Horario (de cualquier asignatura, ya que la
   lista de iEduca mezcla todos los cursos), y se muestra el plan antes de aplicar. */
async function pasteDossierFromIeduca(){
  let raw;
  try{ raw = await navigator.clipboard.readText(); }
  catch(e){ toast('No se pudo leer el portapapeles. Revisa los permisos del navegador.'); return; }
  let payload;
  try{ payload = JSON.parse(raw); if(payload.app!=='MiHorario' || payload.mode!=='dossier') throw 0; }
  catch(e){ toast('No hay ningún dato copiado desde el marcador "Leer pagos de iEduca". Cópialo primero allí.'); return; }

  const allStudents = state.students;
  const plan = payload.students.map(st=>{
    let best = null, bestScore = 0;
    allStudents.forEach(s=>{ const sc = nameMatchScore(st.name, s.name); if(sc>bestScore){ bestScore=sc; best=s; } });
    const matched = (best && bestScore>=0.5) ? best : null;
    const changes = matched && matched.dossierPaid !== st.paid;
    return { ieducaName: st.name, matched, paid: st.paid, changes };
  });

  const changesCount = plan.filter(p=>p.matched && p.changes).length;
  const unmatchedCount = plan.filter(p=>!p.matched).length;
  const rows = plan.filter(p=>p.matched && p.changes).map(p=>`
    <div class="card" style="padding:9px 12px;margin-bottom:6px;display:flex;justify-content:space-between;">
      <b style="font-size:13px;">${escapeHtml(p.matched.name)}</b>
      <span style="font-size:12.5px;font-weight:700;color:${p.paid?'#1a9e5c':'#d64545'};">${p.paid?'PAGADO':'NO PAGADO'}</span>
    </div>`).join('');

  openModal(`
    <div class="modal-head"><div class="modal-title">Pegar pagos desde iEduca</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <p style="font-size:13px;color:var(--ink-soft);margin-bottom:6px;">${payload.students.length} alumno(s) leídos. <b>${changesCount}</b> cambiarán de estado.${unmatchedCount?` ${unmatchedCount} no se han encontrado en Mi Horario (no se tocan).`:''}</p>
    <div style="max-height:50vh;overflow-y:auto;">${rows || '<div style="font-size:13px;color:var(--ink-faint);">No hay ningún cambio que aplicar.</div>'}</div>
    ${changesCount ? `<button class="btn btn-primary" id="dossierPasteApply" style="margin-top:10px;">Aplicar ${changesCount} cambio(s)</button>` : ''}
  `);
  const btn = document.getElementById('dossierPasteApply');
  if(btn) btn.onclick=()=>{
    let applied = 0;
    plan.forEach(p=>{
      if(p.matched && p.changes){ p.matched.dossierPaid = p.paid; applied++; }
    });
    saveState(); render(); closeModal();
    toast(`Actualizado el pago de ${applied} alumno(s)`);
  };
}

function exportDayXlsx(subjectId, dateIso){
  if(typeof XLSX==='undefined'){ toast('No se pudo cargar el generador de Excel. Revisa tu conexión.'); return; }
  const subj = getSubject(subjectId);
  const rows = buildDayRows(subjectId, dateIso);
  if(rows.length===0){ toast('Ese curso todavía no tiene alumnos'); return; }
  const hasAnyData = rows.some(r=> r['Astc.'] || r['Actitud'] || r['Deures']!=='' || r['Participació']!=='' || r['Gestió']!=='');
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{wch:26},{wch:16},{wch:16},{wch:8},{wch:12},{wch:8}];
  const wb = XLSX.utils.book_new();
  const sheetName = (subj.name.replace(/[\\/*?:\[\]]/g,'').slice(0,31)) || 'Registro';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const safeName = subj.name.replace(/[^a-z0-9]+/gi,'_');
  XLSX.writeFile(wb, `registro-${safeName}-${dateIso}.xlsx`);
  if(hasAnyData){ toast('Excel descargado'); }
  else { toast(`Excel descargado, pero no había ningún dato registrado el ${parseISO(dateIso).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit'})} en esta clase`); }
}
function openDailyRecordScreen(subjectId, dateIso, studentId){
  const allSubjects = [...state.subjects].sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const subj = getSubject(subjectId);
  if(!subj){ return; }
  const roster = state.students.filter(s=>s.subjectId===subjectId).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  if(roster.length===0){
    openModal(`<div class="modal-head"><div class="modal-title">Sin alumnos</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
      <p style="font-size:13.5px;color:var(--ink-soft);">Esta clase todavía no tiene alumnos añadidos.</p>`);
    return;
  }
  let idx = roster.findIndex(s=>s.id===studentId);
  if(idx<0) idx = 0;
  const student = roster[idx];
  const rec = getOrCreateRecord(student.id, dateIso);
  const subjIdx = allSubjects.findIndex(s=>s.id===subjectId);
  const dateLabel = capitalize(parseISO(dateIso).toLocaleDateString('es-ES',{weekday:'long', day:'numeric', month:'short'}));
  const isExempt = isStudentExemptOn(student, dateIso);

  const chipRow = (id, options, current, multi)=> `<div class="dr-chips" id="${id}">${options.map(o=>{
    const val = typeof o==='object' ? o.v : o;
    const label = typeof o==='object' ? o.label : o;
    const title = typeof o==='object' ? o.title : '';
    const active = multi ? current.includes(val) : current===val;
    return `<button type="button" data-v="${val}" class="${active?'active':''}" title="${escapeHtml(title)}">${label}</button>`;
  }).join('')}</div>`;

  openModal(`
    <div class="modal-head">
      <button class="dr-back-btn" id="drBackToClass">${ICONS.chevL} Clase</button>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button>
    </div>

    <div class="dr-subject-row">
      <button class="dr-nav-btn" id="drPrevSubject">${ICONS.chevL}</button>
      <select id="drSubjectSelect" class="dr-subject-select">${allSubjects.map(s=>`<option value="${s.id}" ${s.id===subjectId?'selected':''}>${escapeHtml(s.name)}</option>`).join('')}</select>
      <button class="dr-nav-btn" id="drNextSubject">${ICONS.chevR}</button>
    </div>

    <div class="dr-date-row">
      <button class="dr-nav-btn" id="drPrevDate">${ICONS.chevL}</button>
      <input type="date" id="drDate" value="${dateIso}">
      <button class="dr-nav-btn" id="drNextDate">${ICONS.chevR}</button>
    </div>

    <input type="text" id="drSearch" class="dr-search" list="drStudentList" placeholder="🔍 Buscar alumno por nombre...">
    <datalist id="drStudentList">${roster.map(s=>`<option value="${escapeHtml(s.name)}">`).join('')}</datalist>

    <div class="dr-student-header">
      <button class="dr-nav-btn dr-student-arrow" id="drPrevStudent" ${idx===0?'disabled style="opacity:.3;"':''}>${ICONS.chevL}</button>
      <div class="dr-student-name-wrap">
        <div class="dr-student-avatar-lg" data-photo-for="${student.id}" data-view-photo="${student.id}" title="Toca para ver la foto en grande">${escapeHtml((student.name.replace(/,.*/, '').trim()[0]||'?').toUpperCase())}</div>
        <div class="dr-student-name"><span class="dr-student-num">${idx+1}</span>${escapeHtml(student.name)}</div>
        <div class="dr-student-pos">${idx+1} / ${roster.length} · ${escapeHtml(subj.name)} · ${dateLabel}</div>
        <div style="font-size:10.5px;font-weight:800;letter-spacing:.03em;margin-top:2px;color:${student.dossierPaid?'#1a9e5c':'#d64545'};">${student.dossierPaid?'PAGADO':'NO PAGADO'}</div>
      </div>
      <button class="dr-nav-btn dr-student-arrow" id="drNextStudent" ${idx===roster.length-1?'disabled style="opacity:.3;"':''}>${ICONS.chevR}</button>
    </div>

    <div class="dr-field">
      <label>Assistència</label>
      ${chipRow('drAssist', ['F','R','J','E','m'], (isExempt && !rec.assistencia.includes('E')) ? [...rec.assistencia,'E'] : rec.assistencia, true)}
    </div>
    <div class="dr-field">
      <label>Actitud</label>
      ${chipRow('drActitud', ACTITUD_OPTIONS, rec.actitud, false)}
      <textarea id="drActitudNota" placeholder="Justificación (opcional)">${escapeHtml(rec.actitudNota||'')}</textarea>
    </div>
    <div class="dr-field">
      <label>Deures</label>
      ${chipRow('drDeures', ['0','1','3'], rec.deures==null?'':String(rec.deures), false)}
    </div>
    <div class="dr-field">
      <label>Participació</label>
      ${chipRow('drPart', ['0','1','2'], isExempt ? '0' : (rec.participacio==null?'':String(rec.participacio)), false)}
    </div>
    <div class="dr-field">
      <label>Gestió</label>
      ${chipRow('drGestio', ['0','1','2'], isExempt ? '0' : (rec.gestio==null?'':String(rec.gestio)), false)}
    </div>
  `);

  document.getElementById('drBackToClass').onclick=()=>{ closeModal(); openSubjectDetailModal(subjectId); };

  fillPhotoPlaceholders(document.querySelector('.modal-sheet'));
  document.querySelectorAll('[data-view-photo]').forEach(el=>{
    el.onclick=async (e)=>{
      e.stopPropagation();
      const url = await getPhoto(el.dataset.viewPhoto);
      if(url) showPhotoLightbox(url);
    };
  });

  const goTo = (newSubjectId, newDateIso, newStudentId)=>{ closeModal(); openDailyRecordScreen(newSubjectId, newDateIso, newStudentId); };

  document.getElementById('drSubjectSelect').onchange=(e)=>{
    const ns = state.students.filter(s=>s.subjectId===e.target.value);
    if(ns.length===0){ toast('Esa clase todavía no tiene alumnos'); e.target.value=subjectId; return; }
    goTo(e.target.value, dateIso, ns[0].id);
  };
  document.getElementById('drPrevSubject').onclick=()=>{
    if(allSubjects.length<2) return;
    const ni = (subjIdx-1+allSubjects.length)%allSubjects.length;
    const ns = state.students.filter(s=>s.subjectId===allSubjects[ni].id);
    if(ns.length===0){ toast(`"${allSubjects[ni].name}" no tiene alumnos todavía`); return; }
    goTo(allSubjects[ni].id, dateIso, ns[0].id);
  };
  document.getElementById('drNextSubject').onclick=()=>{
    if(allSubjects.length<2) return;
    const ni = (subjIdx+1)%allSubjects.length;
    const ns = state.students.filter(s=>s.subjectId===allSubjects[ni].id);
    if(ns.length===0){ toast(`"${allSubjects[ni].name}" no tiene alumnos todavía`); return; }
    goTo(allSubjects[ni].id, dateIso, ns[0].id);
  };

  document.getElementById('drDate').onchange=(e)=>{ if(e.target.value) goTo(subjectId, e.target.value, student.id); };
  document.getElementById('drPrevDate').onclick=()=> goTo(subjectId, addDaysISO(dateIso,-1), student.id);
  document.getElementById('drNextDate').onclick=()=> goTo(subjectId, addDaysISO(dateIso,1), student.id);

  document.getElementById('drSearch').addEventListener('change', (e)=>{
    const match = roster.find(s=>s.name.toLowerCase()===e.target.value.trim().toLowerCase());
    if(match) goTo(subjectId, dateIso, match.id);
  });

  document.getElementById('drPrevStudent').onclick=()=>{ if(idx>0) goTo(subjectId, dateIso, roster[idx-1].id); };
  document.getElementById('drNextStudent').onclick=()=>{ if(idx<roster.length-1) goTo(subjectId, dateIso, roster[idx+1].id); };

  document.querySelectorAll('#drAssist button').forEach(b=>{
    b.onclick=()=>{
      const v = b.dataset.v;
      if(rec.assistencia.includes(v)) rec.assistencia = rec.assistencia.filter(x=>x!==v);
      else rec.assistencia.push(v);
      b.classList.toggle('active');
      persistRecord(rec);
    };
  });
  document.querySelectorAll('#drActitud button').forEach(b=>{
    b.onclick=()=>{
      const v = b.dataset.v;
      rec.actitud = (rec.actitud===v) ? null : v;
      document.querySelectorAll('#drActitud button').forEach(x=>x.classList.toggle('active', x===b && rec.actitud===v));
      persistRecord(rec);
    };
  });
  document.getElementById('drActitudNota').addEventListener('input', (e)=>{ rec.actitudNota = e.target.value; });
  document.getElementById('drActitudNota').addEventListener('blur', ()=> persistRecord(rec));

  function wireSingleNumeric(containerId, field){
    document.querySelectorAll(`#${containerId} button`).forEach(b=>{
      b.onclick=()=>{
        const v = Number(b.dataset.v);
        rec[field] = (rec[field]===v) ? null : v;
        document.querySelectorAll(`#${containerId} button`).forEach(x=>x.classList.toggle('active', x===b && rec[field]===v));
        persistRecord(rec);
      };
    });
  }
  wireSingleNumeric('drDeures','deures');
  wireSingleNumeric('drPart','participacio');
  wireSingleNumeric('drGestio','gestio');
}

/* ==================================================================
   EXÁMENES Y TAREAS
   ================================================================== */
/* Pestaña Tareas: observaciones y deberes en dos columnas, alineando en la misma fila
   lo que sea de la misma asignatura, mismo día y mismo tramo horario. */
function renderTasksSplitByKind(){
  let items = state.items.filter(i=>i.type==='task');
  if(ui.subjectFilter){ items = items.filter(i=>i.subjectId===ui.subjectFilter); }

  // Agrupar por ocurrencia: misma asignatura + mismo día + mismo tramo horario (classId)
  const groups = {};
  const order = [];
  items.forEach(i=>{
    const key = `${i.subjectId||'-'}|${i.date}|${i.classId||'-'}`;
    if(!groups[key]){ groups[key] = { subjectId:i.subjectId, date:i.date, obs:null, deb:null }; order.push(key); }
    if(i.kind==='deberes') groups[key].deb = i;
    else groups[key].obs = i; // observación (o dato antiguo sin "kind")
  });
  const rows = order.map(k=>groups[k]).sort((a,b)=> a.date===b.date ? 0 : a.date.localeCompare(b.date));

  const usedSubjectIds = [...new Set(state.items.filter(i=>i.type==='task').map(i=>i.subjectId).filter(Boolean))];
  const usedSubjects = usedSubjectIds.map(id=>getSubject(id)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
  let filterHtml = '';
  if(usedSubjects.length){
    filterHtml = `<div class="subject-filter">
      <button data-sf="" class="${!ui.subjectFilter?'active':''}">Todas</button>
      ${usedSubjects.map(s=>`<button data-sf="${s.id}" class="${ui.subjectFilter===s.id?'active':''}" style="${ui.subjectFilter===s.id?`background:${s.color};border-color:${s.color};`:''}">${escapeHtml(s.name)}</button>`).join('')}
    </div>`;
  }

  if(rows.length===0){
    return `${filterHtml}<div class="empty-state"><span class="emoji">📝</span><div class="et">Sin observaciones ni deberes</div><div class="es">Se irán añadiendo desde el Calendario, al tocar una clase.</div></div>`;
  }

  function renderCell(item){
    if(!item) return `<div class="tareas-cell tareas-cell-empty">—</div>`;
    const subj = item.subjectId ? getSubject(item.subjectId) : null;
    const dateLabel = capitalize(parseISO(item.date).toLocaleDateString('es-ES',{weekday:'short', day:'numeric', month:'short'}));
    return `<div class="tareas-cell card task-full-card" data-open-item="${item.id}">
      <div class="task-full-header">
        <span class="task-full-date">${dateLabel}</span>
        ${subj?`<span class="task-full-subject" style="background:${subj.color}22;color:${subj.color}">${escapeHtml(subj.name)}</span>`:''}
      </div>
      <div class="task-full-text">${escapeHtml(item.notes||item.title)}</div>
    </div>`;
  }

  const rowsHtml = rows.map(g=> renderCell(g.obs) + renderCell(g.deb)).join('');

  return `
    ${filterHtml}
    <div class="tareas-grid">
      <div class="tareas-col-title">📝 Observaciones</div>
      <div class="tareas-col-title">📚 Deberes</div>
      ${rowsHtml}
    </div>
  `;
}

function renderItemsList(filterType){
  const today = todayISO();
  let items = state.items.filter(i=>i.type===filterType);
  if(ui.subjectFilter){ items = items.filter(i=>i.subjectId===ui.subjectFilter); }
  items = items.sort((a,b)=> a.date===b.date ? (a.time||'').localeCompare(b.time||'') : a.date.localeCompare(b.date));
  const upcoming = items.filter(i=> daysBetween(today,i.date) >= 0 && daysBetween(today,i.date) <= (i.remindDays||2));

  const usedSubjectIds = [...new Set(state.items.filter(i=>i.type===filterType).map(i=>i.subjectId).filter(Boolean))];
  const usedSubjects = usedSubjectIds.map(id=>getSubject(id)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
  let filterHtml = '';
  if(usedSubjects.length){
    filterHtml = `<div class="subject-filter">
      <button data-sf="" class="${!ui.subjectFilter?'active':''}">Todas</button>
      ${usedSubjects.map(s=>`<button data-sf="${s.id}" class="${ui.subjectFilter===s.id?'active':''}" style="${ui.subjectFilter===s.id?`background:${s.color};border-color:${s.color};`:''}">${escapeHtml(s.name)}</button>`).join('')}
    </div>`;
  }

  let html = filterHtml;
  if(upcoming.length){
    html += `<div class="upcoming-banner">${ICONS.bell}<div>
      <div class="ut">Próximamente</div>
      <div class="ud">${upcoming.map(i=>`${filterType==='exam'?'📕':'📝'} ${escapeHtml(i.title)} — ${fmtDateHuman(i.date)}`).join('<br>')}</div>
    </div></div>`;
  }

  if(items.length===0){
    html += `<div class="empty-state">
      <span class="emoji">${filterType==='exam'?'📕':'📝'}</span>
      <div class="et">${filterType==='exam'?'Sin exámenes':'Sin tareas'}${ui.subjectFilter?' en esta asignatura':''}</div>
      <div class="es">Añade uno con el botón + para no olvidarlo.</div>
    </div>`;
    return html;
  }

  html += items.map(i=>{
    const subj = i.subjectId? getSubject(i.subjectId): null;
    const diff = daysBetween(today, i.date);
    const overdue = diff < 0;
    const d = parseISO(i.date);
    let tagHtml;
    if(overdue) tagHtml = `<span class="item-tag overdue">Pasado</span>`;
    else if(diff===0) tagHtml = `<span class="item-tag ${i.type}">Hoy</span>`;
    else if(diff===1) tagHtml = `<span class="item-tag ${i.type}">Mañana</span>`;
    else tagHtml = `<span class="item-tag ${i.type}">En ${diff} días</span>`;
    return `<div class="card item-card" data-open-item="${i.id}">
      <div class="item-badge ${i.type}"><span class="d">${d.getDate()}</span><span>${d.toLocaleDateString('es-ES',{month:'short'}).replace('.','')}</span></div>
      <div class="item-main">
        <div class="item-title">${escapeHtml(i.title)}</div>
        <div class="item-sub">${[subj?subj.name:null, i.time].filter(Boolean).join(' · ')||'&nbsp;'}</div>
        ${tagHtml}
      </div>
    </div>`;
  }).join('');
  return html;
}

/* ==================================================================
   FESTIVOS
   ================================================================== */
function renderHolidays(){
  const today = todayISO();
  const list = [...state.holidays].sort((a,b)=>a.start.localeCompare(b.start));
  if(list.length===0){
    return `<div class="empty-state">
      <span class="emoji">🌴</span>
      <div class="et">Sin festivos guardados</div>
      <div class="es">Añade vacaciones o días libres con el botón +.</div>
    </div>`;
  }
  return list.map(h=>{
    const inProgress = today>=h.start && today<=h.end;
    const past = today>h.end;
    const diff = daysBetween(today,h.start);
    let status = inProgress? 'En curso' : past? 'Pasado' : (diff===0?'Hoy':`En ${diff} días`);
    return `<div class="card holiday-card" data-open-holiday="${h.id}">
      <div class="holiday-icon">${ICONS.flag}</div>
      <div class="holiday-main">
        <div class="holiday-name">${escapeHtml(h.name)}</div>
        <div class="holiday-dates">${fmtDateHuman(h.start)} — ${fmtDateHuman(h.end)}</div>
      </div>
      <div class="holiday-status" style="${past?'background:#EEE;color:#999':''}">${status}</div>
    </div>`;
  }).join('');
}

/* ==================================================================
   AJUSTES
   ================================================================== */function renderSettings(){
  const notifState = ('Notification' in window) ? Notification.permission : 'unsupported';
  const notifEnabled = state.settings.notificationsEnabled !== false;
  const weekMode = state.settings.weekMode || 'full';
  let notifDesc, notifControl;
  if(notifState==='denied'){
    notifDesc = 'Bloqueadas en el navegador. Actívalas desde los ajustes del sitio en tu navegador.';
    notifControl = '';
  } else if(notifState==='granted'){
    notifDesc = notifEnabled ? 'Avisos de exámenes y tareas próximas mientras la app está abierta' : 'Desactivadas';
    notifControl = `<div class="switch ${notifEnabled?'on':''}" id="notifSwitch" role="button" aria-label="Activar o desactivar notificaciones"><div class="switch-knob"></div></div>`;
  } else {
    notifDesc = 'Avisos de exámenes y tareas próximas mientras la app está abierta';
    notifControl = `<button class="settings-action" id="btnNotif">Activar</button>`;
  }
  return `
  <div class="card">
    <div class="settings-item">
      <div class="settings-icon">${ICONS.calSmall}</div>
      <div class="settings-text">
        <div class="settings-title">Días de la semana en el horario</div>
        <div class="settings-desc">Elige si el Calendario muestra solo días lectivos o la semana completa</div>
      </div>
    </div>
    <div style="padding:0 14px 14px;">
      <div class="seg" id="weekModeSeg">
        <button type="button" data-wm="weekdays" class="${weekMode==='weekdays'?'active':''}">Lunes a viernes</button>
        <button type="button" data-wm="full" class="${weekMode==='full'?'active':''}">Lunes a domingo</button>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="settings-item">
      <div class="settings-icon">${ICONS.cloud}</div>
      <div class="settings-text">
        <div class="settings-title">Sincronización con Google Drive</div>
        <div class="settings-desc">${
          !driveConfigured() ? 'Todavía no configurada'
          : driveIsConnected() ? (
              localStorage.getItem('driveNeedsReconnect')
                ? '⚠️ Sesión caducada, pulsa Sincronizar para reconectar'
                : ('Conectado' + (localStorage.getItem('driveLastSync') ? ' · última sync ' + new Date(Number(localStorage.getItem('driveLastSync'))).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}) : ''))
            )
          : 'Mantén tus datos iguales entre dispositivos'
        }</div>
      </div>
      <button class="settings-action" id="btnDriveConnect">${driveIsConnected() ? 'Desconectar' : 'Conectar'}</button>
    </div>
    ${driveIsConnected() ? `<div style="height:1px;background:var(--line)"></div>
    <div class="settings-item">
      <div class="settings-icon">${ICONS.download}</div>
      <div class="settings-text">
        <div class="settings-title">Sincronizar ahora</div>
        <div class="settings-desc">Comprueba si hay cambios nuevos en Drive</div>
      </div>
      <button class="settings-action" id="btnDriveSyncNow">Sincronizar</button>
    </div>` : ''}
  </div>
  <div class="card">
    <div class="settings-item">
      <div class="settings-icon">${ICONS.bell}</div>
      <div class="settings-text">
        <div class="settings-title">Notificaciones</div>
        <div class="settings-desc">${notifDesc}</div>
      </div>
      ${notifControl}
    </div>
  </div>
  <div class="card">
    <div class="settings-item">
      <div class="settings-icon">${ICONS.download}</div>
      <div class="settings-text">
        <div class="settings-title">Exportar copia de seguridad</div>
        <div class="settings-desc">Descarga un archivo .json con todos tus datos</div>
      </div>
      <button class="settings-action" id="btnExport">Exportar</button>
    </div>
    <div style="height:1px;background:var(--line)"></div>
    <div class="settings-item">
      <div class="settings-icon">${ICONS.upload}</div>
      <div class="settings-text">
        <div class="settings-title">Importar copia de seguridad</div>
        <div class="settings-desc">Admite archivos .json de Mi Horario o exportaciones .sqlite/.db de la app antigua</div>
      </div>
      <button class="settings-action" id="btnImport">Importar</button>
      <input type="file" id="fileImport" accept=".json,application/json,.sqlite,.db,.sqlite3,application/octet-stream,application/vnd.sqlite3,application/x-sqlite3" style="display:none">
    </div>
    <div style="height:1px;background:var(--line)"></div>
    <div class="settings-item">
      <div class="settings-icon">${ICONS.clipboard}</div>
      <div class="settings-text">
        <div class="settings-title">Exportar registro diario</div>
        <div class="settings-desc">Elige clase y día, y descarga un Excel con assistència, actitud, deures...</div>
      </div>
      <button class="settings-action" id="btnExportAllRecords">Exportar</button>
    </div>
  </div>
  <div class="card">
    <div class="settings-item" id="ieducaBmHeader" style="cursor:pointer;">
      <div class="settings-icon">${ICONS.clipboard}</div>
      <div class="settings-text">
        <div class="settings-title">Marcadores para iEduca</div>
        <div class="settings-desc">Toca para ${ui.ieducaBmOpen?'plegar':'ver los códigos y copiarlos'}</div>
      </div>
      <span style="color:var(--ink-faint);transform:rotate(${ui.ieducaBmOpen?'90deg':'0deg'});transition:transform .15s;">${ICONS.chevR}</span>
    </div>
    ${ui.ieducaBmOpen ? `
    <div style="padding:0 16px 16px 52px;">
      <div style="font-size:11.5px;color:var(--ink-faint);margin-bottom:12px;">Toca un código para copiarlo, y pégalo como URL al crear un marcador nuevo en tu navegador (nombre libre).</div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin-bottom:4px;">Volcar a iEduca (escribir)</div>
        <code class="ieduca-bm-code" data-bm="volcar" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:var(--bg);padding:10px 12px;border-radius:8px;font-size:11px;cursor:pointer;">${escapeHtml(IEDUCA_BOOKMARKLETS.volcar)}</code>
      </div>
      <div>
        <div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin-bottom:4px;">Leer de iEduca</div>
        <code class="ieduca-bm-code" data-bm="leer" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:var(--bg);padding:10px 12px;border-radius:8px;font-size:11px;cursor:pointer;">${escapeHtml(IEDUCA_BOOKMARKLETS.leer)}</code>
      </div>
      <div>
        <div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin-bottom:4px;">Leer pagos de iEduca</div>
        <code class="ieduca-bm-code" data-bm="pagos" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:var(--bg);padding:10px 12px;border-radius:8px;font-size:11px;cursor:pointer;">${escapeHtml(IEDUCA_BOOKMARKLETS.pagos)}</code>
        <button class="btn btn-ghost" id="ieducaPasteDossierBtn" style="margin-top:8px;">📥 Pegar pagos desde iEduca</button>
      </div>
      ${(()=>{
        const subjects = [...state.subjects].sort((a,b)=>a.name.localeCompare(b.name,'es'));
        if(subjects.length===0) return '';
        if(!ui.ieducaCopySubjectId || !subjects.some(s=>s.id===ui.ieducaCopySubjectId)) ui.ieducaCopySubjectId = subjects[0].id;
        if(!ui.ieducaCopyDay) ui.ieducaCopyDay = todayISO();
        return `
        <div style="height:1px;background:var(--line);margin:16px 0;"></div>
        <div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin-bottom:8px;">Copiar / pegar datos de un día</div>
        <div class="field" style="margin-bottom:8px;">
          <select id="ieducaCopySubject">${subjects.map(s=>`<option value="${s.id}" ${s.id===ui.ieducaCopySubjectId?'selected':''}>${escapeHtml(s.name)}</option>`).join('')}</select>
        </div>
        <div class="field" style="margin-bottom:10px;">
          <input type="date" id="ieducaCopyDay" value="${ui.ieducaCopyDay}">
        </div>
        <button class="btn btn-ghost" id="ieducaCopyBtn" style="margin-bottom:8px;">📋 Copiar para iEduca</button>
        <button class="btn btn-ghost" id="ieducaPasteBtn">📥 Pegar desde iEduca</button>
        `;
      })()}
    </div>` : ''}
  </div>
  <div class="card">
    <div class="settings-item">
      <div class="settings-icon">${ICONS.chart}</div>
      <div class="settings-text">
        <div class="settings-title">Tus datos</div>
        <div class="settings-desc">${state.classes.length} clases · ${state.items.length} exámenes/tareas · ${state.holidays.length} festivos</div>
      </div>
    </div>
  </div>
  <button class="btn btn-danger" id="btnReset">${ICONS.trash} Borrar todos los datos</button>
  <p style="text-align:center; font-size:11.5px; color:var(--ink-faint); margin-top:18px;">Mi Horario · los datos se guardan solo en este dispositivo</p>
  <p style="text-align:center; font-size:11px; color:var(--ink-faint); margin-top:4px;">Versión: <b>${APP_VERSION}</b></p>
  `;
}

/* ==================================================================
   RENDER PRINCIPAL
   ================================================================== */
function render(){
  renderNav();
  renderHeader();
  renderScheduleNav();
  renderInstallHint();
  renderDriveHint();
  const content = document.getElementById('content');
  if(ui.tab==='calendar') content.innerHTML = renderSchedule();
  else if(ui.tab==='subjects'){ content.innerHTML = renderSubjectsList(); fillSubjectPhotoCounts(content); }
  else if(ui.tab==='board') content.innerHTML = renderBoardTab();
  else if(ui.tab==='tasks') content.innerHTML = renderTasksSplitByKind();
  else if(ui.tab==='exams') content.innerHTML = renderItemsList('exam');
  else if(ui.tab==='holidays') content.innerHTML = renderHolidays();
  else content.innerHTML = renderSettings();

  bindContentEvents();
  if(ui.tab==='calendar' && ui.viewMode==='week'){
    requestAnimationFrame(alignWeekGridHeader);
  }
}

function alignWeekGridHeader(){
  const wrap = document.querySelector('.week-grid-wrap');
  if(!wrap) return;
  const scrollArea = wrap.querySelector('.grid-scrollarea');
  const headRow = wrap.querySelector('.grid-headrow');
  if(!scrollArea || !headRow) return;
  const sbWidth = scrollArea.offsetWidth - scrollArea.clientWidth;
  headRow.style.paddingRight = (sbWidth>0 ? sbWidth : 0) + 'px';
}

function bindContentEvents(){
  document.querySelectorAll('[data-open-class]').forEach(el=>{
    el.onclick=(e)=>{ e.stopPropagation(); openClassOccurrenceModal(el.dataset.openClass, el.dataset.date); };
  });
  const boardSubjectSelect = document.getElementById('boardSubjectSelect');
  if(boardSubjectSelect) boardSubjectSelect.onchange=(e)=>{ ui.boardSubjectId = e.target.value; ui.boardClassId = null; render(); };
  const boardDaySelect = document.getElementById('boardDaySelect');
  if(boardDaySelect) boardDaySelect.onchange=(e)=>{ ui.boardDay = e.target.value; ui.boardClassId = null; render(); };
  const boardSlotSelect = document.getElementById('boardSlotSelect');
  if(boardSlotSelect) boardSlotSelect.onchange=(e)=>{ ui.boardClassId = e.target.value; render(); };
  const boardStartRound = document.getElementById('boardStartRound');
  if(boardStartRound) boardStartRound.onclick=()=>{
    const d = document.getElementById('boardNewRoundDate').value || todayISO();
    startNewRound(ui.boardSubjectId, ui.boardClassId, d);
    render();
  };
  document.querySelectorAll('.board-exercise-chips button').forEach(el=>{
    el.onclick=()=>{ el.classList.toggle('active'); };
  });
  const boardAddTurn = document.getElementById('boardAddTurn');
  if(boardAddTurn) boardAddTurn.onclick=()=>{
    const studentId = document.getElementById('boardTurnStudent').value;
    const selectedEls = [...document.querySelectorAll('.board-exercise-chips button.active')];
    const selectedChips = selectedEls.map(b=>b.dataset.ex);
    const selectedEntries = selectedEls.map(b=>({ date:b.dataset.exdate, key:b.dataset.exkey }));
    const manual = document.getElementById('boardTurnExercises').value.trim();
    const parts = [...selectedChips];
    if(manual) parts.push(manual);
    const exercises = parts.join(', ');
    if(!exercises){ toast('Elige algún ejercicio o escríbelo a mano'); return; }
    if(studentId==='__teacher__'){
      // Los ha hecho el propio profesor: no se asigna a ningún alumno, solo se
      // marcan como hechos para que dejen de salir en la lista de pendientes, y se
      // dejan anotados en esta ronda para poder consultarlos luego.
      const round = getOpenRound(ui.boardSubjectId, ui.boardClassId);
      if(round) addTeacherDone(round, exercises);
      markExercisesUsed(ui.boardSubjectId, ui.boardClassId, selectedEntries);
      toast('Marcado como hecho por el profesor');
    } else {
      const round = getOpenRound(ui.boardSubjectId, ui.boardClassId);
      if(round) addTurn(round, studentId, exercises);
      markExercisesUsed(ui.boardSubjectId, ui.boardClassId, selectedEntries);
    }
    render();
  };
  document.querySelectorAll('[data-undo-done]').forEach(el=>{
    el.onclick=()=>{
      unmarkExerciseUsed(ui.boardSubjectId, ui.boardClassId, el.dataset.undoDate, el.dataset.undoDone);
      render();
    };
  });
  const boardCloseRound = document.getElementById('boardCloseRound');
  if(boardCloseRound) boardCloseRound.onclick=()=>{
    const round = getOpenRound(ui.boardSubjectId, ui.boardClassId);
    if(round) closeRound(round);
    render();
  };
  const boardDeleteRound = document.getElementById('boardDeleteRound');
  if(boardDeleteRound) boardDeleteRound.onclick=()=>{
    const round = getOpenRound(ui.boardSubjectId, ui.boardClassId);
    if(!round) return;
    openModal(`
      <div class="modal-head"><div class="modal-title">Eliminar ronda</div>
        <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
      <p style="font-size:13.5px;color:var(--ink);line-height:1.5;">Se eliminará esta ronda entera (con sus ${round.turns.length} turno(s) y las notas de Participació que hubiera puesto). No se puede deshacer.</p>
      <button class="btn btn-danger" id="confirmDeleteRound">${ICONS.trash} Eliminar de todas formas</button>
    `);
    document.getElementById('confirmDeleteRound').onclick=()=>{
      deleteRound(round);
      closeModal();
      render();
      toast('Ronda eliminada');
    };
  };
  document.querySelectorAll('[data-toggle-past-round]').forEach(el=>{
    el.onclick=()=>{
      const id = el.dataset.togglePastRound;
      ui.boardExpandedPastRound = ui.boardExpandedPastRound===id ? null : id;
      render();
    };
  });
  document.querySelectorAll('[data-remove-turn]').forEach(el=>{
    el.onclick=()=>{
      const round = getOpenRound(ui.boardSubjectId, ui.boardClassId);
      if(round) removeTurn(round, el.dataset.removeTurn);
      render();
    };
  });
  document.querySelectorAll('.board-score-chip').forEach(el=>{
    el.onclick=()=>{
      const round = getOpenRound(ui.boardSubjectId, ui.boardClassId);
      if(round) setTurnScore(round, el.dataset.turn, Number(el.dataset.score));
      render();
    };
  });
  document.querySelectorAll('[data-open-item]').forEach(el=>{
    el.onclick=()=>{
      const item = state.items.find(i=>i.id===el.dataset.openItem);
      if(item && item.kind==='deberes'){
        openDeberesModal(item.id, item.subjectId, item.date, item.classId);
      } else if(item && item.type==='task' && (item.kind==='observacion' || !item.kind)){
        openObservationModal(item.id, item.subjectId, item.date, item.classId);
      } else {
        openItemModal(el.dataset.openItem);
      }
    };
  });
  document.querySelectorAll('[data-open-holiday]').forEach(el=>{
    el.onclick=()=>openHolidayModal(el.dataset.openHoliday);
  });
  document.querySelectorAll('[data-day-jump]').forEach(el=>{
    el.onclick=()=>{ ui.day=Number(el.dataset.dayJump); ui.viewMode='day'; render(); };
  });
  document.querySelectorAll('[data-open-subject]').forEach(el=>{
    el.onclick=()=>openSubjectDetailModal(el.dataset.openSubject);
  });
  document.querySelectorAll('[data-sf]').forEach(el=>{
    el.onclick=()=>{ ui.subjectFilter = el.dataset.sf || null; render(); };
  });

  const btnNotif = document.getElementById('btnNotif');
  if(btnNotif) btnNotif.onclick = requestNotifPermission;
  const notifSwitch = document.getElementById('notifSwitch');
  if(notifSwitch) notifSwitch.onclick = ()=>{
    const currentlyEnabled = state.settings.notificationsEnabled !== false;
    state.settings.notificationsEnabled = !currentlyEnabled;
    saveState(); render();
  };
  const btnExport = document.getElementById('btnExport');
  if(btnExport) btnExport.onclick = exportData;
  const btnImport = document.getElementById('btnImport');
  if(btnImport) btnImport.onclick = ()=>document.getElementById('fileImport').click();
  const fileImport = document.getElementById('fileImport');
  if(fileImport) fileImport.onchange = importData;
  const btnExportAllRecords = document.getElementById('btnExportAllRecords');
  if(btnExportAllRecords) btnExportAllRecords.onclick = ()=>openExportRangeModal(null);
  const ieducaBmHeader = document.getElementById('ieducaBmHeader');
  if(ieducaBmHeader) ieducaBmHeader.onclick = ()=>{ ui.ieducaBmOpen = !ui.ieducaBmOpen; render(); };
  document.querySelectorAll('.ieduca-bm-code').forEach(el=>{
    el.onclick=(e)=>{
      e.stopPropagation();
      const text = IEDUCA_BOOKMARKLETS[el.dataset.bm];
      navigator.clipboard.writeText(text).then(()=>toast('Copiado. Pégalo como URL al crear el marcador.')).catch(()=>toast('No se pudo copiar'));
    };
  });
  const ieducaCopySubject = document.getElementById('ieducaCopySubject');
  if(ieducaCopySubject) ieducaCopySubject.onclick=(e)=>e.stopPropagation();
  if(ieducaCopySubject) ieducaCopySubject.onchange=(e)=>{ ui.ieducaCopySubjectId = e.target.value; };
  const ieducaCopyDay = document.getElementById('ieducaCopyDay');
  if(ieducaCopyDay) ieducaCopyDay.onclick=(e)=>e.stopPropagation();
  if(ieducaCopyDay) ieducaCopyDay.onchange=(e)=>{ ui.ieducaCopyDay = e.target.value; };
  const ieducaCopyBtn = document.getElementById('ieducaCopyBtn');
  if(ieducaCopyBtn) ieducaCopyBtn.onclick=(e)=>{
    e.stopPropagation();
    if(!ui.ieducaCopyDay){ toast('Indica un día'); return; }
    copyDayForIeduca(ui.ieducaCopySubjectId, ui.ieducaCopyDay);
  };
  const ieducaPasteBtn = document.getElementById('ieducaPasteBtn');
  if(ieducaPasteBtn) ieducaPasteBtn.onclick=(e)=>{
    e.stopPropagation();
    if(!ui.ieducaCopyDay){ toast('Indica un día'); return; }
    pasteDayFromIeduca(ui.ieducaCopySubjectId, ui.ieducaCopyDay);
  };
  const ieducaPasteDossierBtn = document.getElementById('ieducaPasteDossierBtn');
  if(ieducaPasteDossierBtn) ieducaPasteDossierBtn.onclick=(e)=>{
    e.stopPropagation();
    pasteDossierFromIeduca();
  };
  const btnReset = document.getElementById('btnReset');
  if(btnReset) btnReset.onclick = confirmReset;
  const weekModeSeg = document.getElementById('weekModeSeg');
  if(weekModeSeg) weekModeSeg.querySelectorAll('button').forEach(b=>{
    b.onclick=()=>{
      state.settings.weekMode = b.dataset.wm;
      saveState();
      if(state.settings.weekMode==='weekdays' && ui.day>4){ ui.day=0; }
      render();
    };
  });
  const btnDriveConnect = document.getElementById('btnDriveConnect');
  if(btnDriveConnect) btnDriveConnect.onclick = ()=>{ driveIsConnected() ? driveDisconnect() : driveConnect(); };
  const btnDriveSyncNow = document.getElementById('btnDriveSyncNow');
  if(btnDriveSyncNow) btnDriveSyncNow.onclick = ()=>{ driveSyncUpload({showToast:true, interactive:true}); drivePhotosDownloadIfNewer(); drivePhotosUpload(); };
}

document.getElementById('fabBtn').onclick = ()=>{
  if(ui.tab==='calendar') openClassModal(null);
  else if(ui.tab==='subjects') openNewSubjectModal();
  else if(ui.tab==='tasks') openItemModal(null, {type:'task', subjectId:ui.subjectFilter});
  else if(ui.tab==='exams') openItemModal(null, {type:'exam', subjectId:ui.subjectFilter});
  else if(ui.tab==='holidays') openHolidayModal(null);
};

function updateNotifBellIcon(){
  const btn = document.getElementById('notifBtn');
  if(!btn) return;
  const notifState = ('Notification' in window) ? Notification.permission : 'unsupported';
  const enabled = notifState==='granted' && state.settings.notificationsEnabled !== false;
  btn.style.opacity = enabled ? '1' : '0.5';
}

document.getElementById('notifBtn').onclick = ()=>{
  const notifState = ('Notification' in window) ? Notification.permission : 'unsupported';
  if(notifState==='denied'){ toast('Notificaciones bloqueadas en el navegador. Actívalas desde sus ajustes.'); return; }
  if(notifState!=='granted'){ requestNotifPermission(); return; }
  const currentlyEnabled = state.settings.notificationsEnabled !== false;
  state.settings.notificationsEnabled = !currentlyEnabled;
  saveState();
  toast(state.settings.notificationsEnabled ? 'Notificaciones activadas' : 'Notificaciones desactivadas');
  updateNotifBellIcon();
  if(ui.tab==='settings') render();
};

/* ==================================================================
   MODAL helpers
   ================================================================== */
const overlay = document.getElementById('modalOverlay');
const sheet = document.getElementById('modalSheet');
let modalCloseGuard = null;
function openModal(html){ modalCloseGuard = null; sheet.innerHTML = `<div class="modal-handle"></div>${html}`; overlay.classList.add('open'); }
function closeModal(){
  if(modalCloseGuard){
    const guard = modalCloseGuard;
    modalCloseGuard = null;
    if(guard()===false) return; // el propio formulario ha decidido no cerrar todavía (p.ej. hay un conflicto que corregir)
  }
  overlay.classList.remove('open');
}
overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeModal(); });

/* En los cuadros de texto largos (deberes, observaciones...), cada "muesca" de la rueda del
   ratón desplaza solo 1-2 líneas en vez del salto grande (varias líneas) que pone el navegador
   por defecto, para que sea más fácil leer con calma mientras se desplaza. */
document.addEventListener('wheel', (e)=>{
  const el = e.target && e.target.closest ? e.target.closest('textarea') : null;
  if(!el) return;
  e.preventDefault();
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
  const direction = e.deltaY > 0 ? 1 : -1;
  el.scrollTop += direction * lineHeight * 1.4;
}, { passive:false });

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* ---------- Class occurrence (día concreto): observaciones + acceso a editar horario ---------- */
function openClassOccurrenceModal(classId, dateIso){
  const cls = state.classes.find(c=>c.id===classId);
  if(!cls){ return; }
  dateIso = dateIso || todayISO();
  const subj = getSubject(cls.subjectId);
  const baseFilter = i=>i.subjectId===cls.subjectId && i.date===dateIso && (i.classId ? i.classId===classId : true);
  const existingObs = state.items.find(i=>i.type==='task' && (i.kind==='observacion' || !i.kind) && baseFilter(i)) || null;
  const existingDeb = state.items.find(i=>i.type==='task' && i.kind==='deberes' && baseFilter(i)) || null;
  const existingExam = state.items.find(i=>i.type==='exam' && baseFilter(i)) || null;
  const hasCalendar = !!(subj && subj.calendarId);
  const dateLabel = dateIso ? capitalize(parseISO(dateIso).toLocaleDateString('es-ES',{weekday:'long', day:'numeric', month:'long', year:'numeric'})) : '';

  // Examen y deberes/observación son excluyentes entre sí. Si ya hay uno de los dos lados,
  // solo se muestra ese lado; si no hay nada todavía, se puede elegir cualquiera de los dos.
  const hasExam = !!existingExam;
  const hasDebOrObs = !!(existingDeb || existingObs);
  const showExamField = hasExam || !hasDebOrObs;
  const showDebObsFields = hasDebOrObs || !hasExam;

  // Tramos horarios de esta misma asignatura que caen en un día concreto (para el selector de deberes).
  function slotsForDate(d){
    if(holidayForDate(d)) return [];
    const dow = mondayIndex(parseISO(d));
    return state.classes.filter(c=>c.subjectId===cls.subjectId && c.days.includes(dow) && classActiveOnDate(c, d));
  }

  openModal(`
    <div class="modal-head">
      <div>
        <div class="modal-title">${escapeHtml(subj?subj.name:'Clase')}</div>
        <div style="font-size:12.5px;color:var(--ink-soft);margin-top:2px;">${dateLabel} · ${cls.start}–${cls.end}${cls.room?' · '+escapeHtml(cls.room):''}</div>
      </div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button>
    </div>
    ${showExamField ? `<div class="field">
      <label>📕 Examen</label>
      <input type="text" id="examTitle" placeholder="Ej. Examen tema 4" value="${escapeHtml(existingExam?existingExam.title:'')}">
      ${existingExam ? `<button type="button" class="settings-action" id="btnDeleteExam" style="font-size:12px;color:var(--danger);margin-top:6px;">${ICONS.trash} Eliminar examen</button>` : ''}
    </div>` : ''}
    ${showDebObsFields ? `
    <div class="field">
      <label>📚 Deberes</label>
      <div class="row2" style="margin-bottom:8px;">
        <div class="field" style="margin-bottom:0;">
          <label style="font-size:11px;">Día para el que son</label>
          <input type="date" id="debDate" value="${dateIso}">
        </div>
        <div class="field" style="margin-bottom:0;" id="debSlotWrap">
          <label style="font-size:11px;">Hora</label>
          <select id="debSlotSelect"></select>
        </div>
      </div>
      <textarea id="debText" placeholder="¿Qué deberes hay que hacer?" style="min-height:110px;">${escapeHtml(existingDeb?(existingDeb.notes||existingDeb.title):'')}</textarea>
      ${hasCalendar ? `<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ink-soft);margin-top:8px;cursor:pointer;">
        <input type="checkbox" id="debToCalendar" checked style="width:16px;height:16px;"> Sincronizar con el calendario de Google
      </label>` : ''}
      <button type="button" class="settings-action" id="btnDeleteDeb" style="font-size:12px;color:var(--danger);margin-top:6px;display:${existingDeb?'inline-flex':'none'};">${ICONS.trash} Eliminar deberes</button>
    </div>
    <div class="field">
      <label>📝 Observación de este día</label>
      <textarea id="obsText" placeholder="¿Qué se ha hecho o explicado en esta clase?" style="min-height:130px;">${escapeHtml(existingObs?(existingObs.notes||existingObs.title):'')}</textarea>
      ${existingObs ? `<button type="button" class="settings-action" id="btnDeleteObs" style="font-size:12px;color:var(--danger);margin-top:6px;">${ICONS.trash} Eliminar observación</button>` : ''}
    </div>` : ''}
    <button class="btn btn-primary" id="btnSaveOccurrence">${ICONS.pencil} Guardar</button>
    <div style="height:1px;background:var(--line);margin:16px 0;"></div>
    <button class="btn btn-ghost" id="btnGoToRoster">${ICONS.clipboard} Pasar lista / Registro diario de esta clase</button>
    <button class="btn btn-ghost" id="btnViewSubjectTasks" style="margin-top:8px;">${ICONS.clipboard} Ver tareas de ${escapeHtml(subj?subj.name:'esta asignatura')}</button>
  `);

  // --- Selector de día/hora para los deberes ---
  let debSelectedSlot = cls;
  if(showDebObsFields){
    const debDateInput = document.getElementById('debDate');
    const debSlotSelect = document.getElementById('debSlotSelect');
    const debSlotWrap = document.getElementById('debSlotWrap');
    const debText = document.getElementById('debText');
    const btnDeleteDeb = document.getElementById('btnDeleteDeb');

    let lastValidDebDate = debDateInput.value;
    let lastValidSlotId = classId;
    function findDebItem(d, slotId){
      return state.items.find(i=>i.type==='task' && i.kind==='deberes' && i.subjectId===cls.subjectId && i.date===d && (i.classId?i.classId===slotId:true)) || null;
    }
    function refreshDebSlots(preferSlotId){
      const d = debDateInput.value;
      const slots = slotsForDate(d);
      if(slots.length===0){
        toast('Ese día no hay clase de esta asignatura. Elige otro día.');
        debDateInput.value = lastValidDebDate;
        return refreshDebSlots(lastValidSlotId);
      }
      lastValidDebDate = d;
      debSlotWrap.style.display='';
      const keep = slots.find(s=>s.id===preferSlotId) ? preferSlotId : slots[0].id;
      debSlotSelect.innerHTML = slots.map(s=>`<option value="${s.id}" ${s.id===keep?'selected':''}>${s.start}–${s.end}${s.room?' · '+escapeHtml(s.room):''}</option>`).join('');
      debSlotSelect.style.display = slots.length>1 ? '' : 'none';
      debSelectedSlot = slots.find(s=>s.id===keep);
      lastValidSlotId = debSelectedSlot.id;
      const item = findDebItem(d, debSelectedSlot.id);
      debText.value = item ? (item.notes||item.title) : '';
      btnDeleteDeb.style.display = item ? 'inline-flex' : 'none';
    }
    refreshDebSlots(classId);
    debDateInput.addEventListener('change', ()=>refreshDebSlots(null));
    debSlotSelect.addEventListener('change', ()=>refreshDebSlots(debSlotSelect.value));

    btnDeleteDeb.onclick=()=>{
      const item = findDebItem(debDateInput.value, debSelectedSlot.id);
      if(!item) return;
      state.items = state.items.filter(i=>i.id!==item.id);
      saveState(); render();
      if(hasCalendar) pushDeberesToCalendar(cls.subjectId, debDateInput.value, debSelectedSlot, '');
      else toast('Deberes eliminados');
      openClassOccurrenceModal(classId, dateIso);
    };
  }

  const btnDeleteExam = document.getElementById('btnDeleteExam');
  if(btnDeleteExam) btnDeleteExam.onclick=()=>{
    state.items = state.items.filter(i=>i.id!==existingExam.id);
    saveState(); render(); toast('Examen eliminado');
    openClassOccurrenceModal(classId, dateIso);
  };
  const btnDeleteObs = document.getElementById('btnDeleteObs');
  if(btnDeleteObs) btnDeleteObs.onclick=()=>{
    state.items = state.items.filter(i=>i.id!==existingObs.id);
    saveState(); render(); toast('Observación eliminada');
    openClassOccurrenceModal(classId, dateIso);
  };

  function hasUnsavedChanges(){
    const examTitle = showExamField && document.getElementById('examTitle') ? document.getElementById('examTitle').value.trim() : '';
    const obsText = showDebObsFields && document.getElementById('obsText') ? document.getElementById('obsText').value.trim() : '';
    const debTextVal = showDebObsFields && document.getElementById('debText') ? document.getElementById('debText').value.trim() : '';
    if(showExamField && examTitle !== (existingExam?existingExam.title:'')) return true;
    if(showDebObsFields && obsText !== (existingObs?(existingObs.notes||existingObs.title):'')) return true;
    if(showDebObsFields){
      const debDateInput = document.getElementById('debDate');
      const d = debDateInput ? debDateInput.value : dateIso;
      const item = state.items.find(i=>i.type==='task' && i.kind==='deberes' && i.subjectId===cls.subjectId && i.date===d && (debSelectedSlot?i.classId===debSelectedSlot.id:true));
      if(debTextVal !== (item?(item.notes||item.title):'')) return true;
    }
    return false;
  }

  function doSave(){
    const examTitle = showExamField && document.getElementById('examTitle') ? document.getElementById('examTitle').value.trim() : '';
    const debTextVal = showDebObsFields && document.getElementById('debText') ? document.getElementById('debText').value.trim() : '';
    const obsText = showDebObsFields && document.getElementById('obsText') ? document.getElementById('obsText').value.trim() : '';
    const debDate = showDebObsFields && document.getElementById('debDate') ? document.getElementById('debDate').value : dateIso;

    if(examTitle && (debTextVal || obsText) && debDate===dateIso){
      toast('No puede haber examen a la vez que deberes u observación ese día. Deja uno de los dos en blanco.');
      return false;
    }
    if(debTextVal && debSelectedSlot){
      const examOnDebDate = state.items.find(i=>i.type==='exam' && i.subjectId===cls.subjectId && i.date===debDate && (i.classId?i.classId===debSelectedSlot.id:true));
      if(examOnDebDate){
        toast('Ese día ya hay un examen para esa clase, no se pueden poner deberes a la vez.');
        return false;
      }
    }

    // Examen (siempre en el día de esta ficha)
    if(examTitle){
      if(existingExam){ Object.assign(existingExam, {title: examTitle}); }
      else { state.items.push({ id:uid(), type:'exam', title:examTitle, date:dateIso, time:'', notes:'', remindDays:2, subjectId:cls.subjectId, classId, notified:false }); }
    } else if(existingExam && showExamField){
      state.items = state.items.filter(i=>i.id!==existingExam.id);
    }

    // Deberes (en el día/hora elegidos en su propio selector, que puede ser distinto al de esta ficha)
    if(showDebObsFields && debSelectedSlot){
      const prevItem = state.items.find(i=>i.type==='task' && i.kind==='deberes' && i.subjectId===cls.subjectId && i.date===debDate && i.classId===debSelectedSlot.id);
      const prevText = prevItem ? (prevItem.notes||prevItem.title) : '';
      const changed = debTextVal !== prevText;
      if(debTextVal){
        const title = debTextVal.split('\n')[0].slice(0,70);
        let itemRef;
        if(prevItem){ Object.assign(prevItem, {title, notes:debTextVal}); itemRef = prevItem; }
        else { itemRef = { id:uid(), type:'task', kind:'deberes', title, date:debDate, time:'', notes:debTextVal, remindDays:0, subjectId:cls.subjectId, classId:debSelectedSlot.id, notified:true }; state.items.push(itemRef); }
        if(changed){
          const toCalendar = hasCalendar && document.getElementById('debToCalendar') && document.getElementById('debToCalendar').checked;
          if(toCalendar) pushDeberesToCalendar(cls.subjectId, debDate, debSelectedSlot, debTextVal, itemRef);
        }
      } else if(prevItem){
        state.items = state.items.filter(i=>i.id!==prevItem.id);
        if(hasCalendar) pushDeberesToCalendar(cls.subjectId, debDate, debSelectedSlot, '');
      }
    }

    // Observación (siempre en el día de esta ficha)
    if(obsText){
      const title = obsText.split('\n')[0].slice(0,70);
      if(existingObs){ Object.assign(existingObs, {title, notes:obsText}); }
      else { state.items.push({ id:uid(), type:'task', kind:'observacion', title, date:dateIso, time:'', notes:obsText, remindDays:0, subjectId:cls.subjectId, classId, notified:true }); }
    } else if(existingObs && showDebObsFields){
      state.items = state.items.filter(i=>i.id!==existingObs.id);
    }

    saveState(); render(); toast('Guardado');
    return true;
  }

  document.getElementById('btnSaveOccurrence').onclick=()=>{
    if(doSave()!==false) openClassOccurrenceModal(classId, dateIso);
  };
  modalCloseGuard = ()=>{
    if(hasUnsavedChanges()) return doSave()!==false;
    return true;
  };
  document.getElementById('btnGoToRoster').onclick=()=>{
    const students = state.students.filter(s=>s.subjectId===cls.subjectId);
    if(students.length===0){ toast('Esta clase todavía no tiene alumnos. Ve a Clases → esta clase → Añadir alumno.'); return; }
    closeModal();
    openDailyRecordScreen(cls.subjectId, dateIso, students[0].id);
  };
  document.getElementById('btnViewSubjectTasks').onclick=()=>{
    closeModal(); ui.tab='tasks'; ui.subjectFilter=cls.subjectId; render();
  };
}

function openObservationModal(id, subjectId, dateIso, classId){
  const existing = id ? state.items.find(i=>i.id===id) : null;
  openModal(`
    <div class="modal-head"><div class="modal-title">${existing?'Editar observación':'Nueva observación'}</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div class="field">
      <label>¿Qué se hizo o se explicó en esta clase?</label>
      <textarea id="fObsText" placeholder="Ej. Se explicó el tema 4, se corrigieron ejercicios..." style="min-height:150px;">${existing?escapeHtml(existing.notes||existing.title||''):''}</textarea>
    </div>
    <button class="btn btn-primary" id="fObsSave">${ICONS.pencil} Guardar</button>
    ${existing?`<button class="btn btn-danger" id="fObsDelete">${ICONS.trash} Eliminar</button>`:''}
  `);

  document.getElementById('fObsSave').onclick=()=>{
    const text = document.getElementById('fObsText').value.trim();
    if(!text){ toast('Escribe algo antes de guardar'); return; }
    const title = text.split('\n')[0].slice(0,70);
    if(existing){
      Object.assign(existing, {title, notes:text});
    } else {
      state.items.push({ id:uid(), type:'task', kind:'observacion', title, date:dateIso, time:'', notes:text, remindDays:0, subjectId, classId, notified:true });
    }
    saveState(); toast('Observación guardada'); render();
    openClassOccurrenceModal(classId, dateIso);
  };
  if(existing){
    document.getElementById('fObsDelete').onclick=()=>{
      state.items = state.items.filter(i=>i.id!==existing.id);
      saveState(); toast('Eliminada'); render();
      openClassOccurrenceModal(classId, dateIso);
    };
  }
}

/* Deberes: qué ejercicios/tarea se ha mandado para esta clase, distinto de las observaciones
   (que registran qué se ha hecho en clase). */
function openDeberesModal(id, subjectId, dateIso, classId){
  const existing = id ? state.items.find(i=>i.id===id) : null;
  const subj = getSubject(subjectId);
  const hasCalendar = !!(subj && subj.calendarId);
  openModal(`
    <div class="modal-head"><div class="modal-title">${existing?'Editar deberes':'Nuevos deberes'}</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div class="field">
      <label>¿Qué deberes hay que hacer?</label>
      <textarea id="fDebText" placeholder="Ej. Ejercicios 3, 4 y 5 de la página 32..." style="min-height:150px;">${existing?escapeHtml(existing.notes||existing.title||''):''}</textarea>
    </div>
    ${hasCalendar ? `<label style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-soft);margin-bottom:14px;cursor:pointer;">
      <input type="checkbox" id="fDebToCalendar" checked style="width:16px;height:16px;">
      Escribir también en el calendario de Google vinculado a esta clase
    </label>` : ''}
    <button class="btn btn-primary" id="fDebSave">${ICONS.pencil} Guardar</button>
    ${existing?`<button class="btn btn-danger" id="fDebDelete">${ICONS.trash} Eliminar</button>`:''}
  `);

  document.getElementById('fDebSave').onclick=()=>{
    const text = document.getElementById('fDebText').value.trim();
    if(!text){ toast('Escribe algo antes de guardar'); return; }
    const title = text.split('\n')[0].slice(0,70);
    let itemRef;
    if(existing){
      Object.assign(existing, {title, notes:text});
      itemRef = existing;
    } else {
      itemRef = { id:uid(), type:'task', kind:'deberes', title, date:dateIso, time:'', notes:text, remindDays:0, subjectId, classId, notified:true };
      state.items.push(itemRef);
    }
    saveState(); toast('Deberes guardados'); render();
    const toCalendar = hasCalendar && document.getElementById('fDebToCalendar') && document.getElementById('fDebToCalendar').checked;
    if(toCalendar){
      const cls = state.classes.find(c=>c.id===classId);
      if(cls) pushDeberesToCalendar(subjectId, dateIso, cls, text, itemRef);
    }
    openClassOccurrenceModal(classId, dateIso);
  };
  if(existing){
    document.getElementById('fDebDelete').onclick=async ()=>{
      state.items = state.items.filter(i=>i.id!==existing.id);
      saveState(); render();
      let resultMsg;
      if(hasCalendar){
        const cls = state.classes.find(c=>c.id===classId);
        if(cls){
          const result = await pushDeberesToCalendar(subjectId, dateIso, cls, '');
          resultMsg = 'Eliminado en la app.\n\nResultado en el calendario: ' + (result?result.detail:'(sin respuesta)');
        } else {
          resultMsg = 'Eliminado en la app.\n\nNo se pudo actualizar el calendario: falta el dato del tramo horario (classId="'+classId+'").';
        }
      } else {
        resultMsg = 'Eliminado en la app.\n\nEsta clase no tiene calendario vinculado (calendarId="'+((getSubject(subjectId)||{}).calendarId)+'").';
      }
      openModal(`
        <div class="modal-head"><div class="modal-title">Resultado</div>
          <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
        <p style="font-size:13.5px;color:var(--ink);line-height:1.6;white-space:pre-wrap;">${escapeHtml(resultMsg)}</p>
        <button class="btn btn-primary" id="fDebDeleteResultOk">Aceptar</button>
      `);
      document.getElementById('fDebDeleteResultOk').onclick=()=>{ closeModal(); openClassOccurrenceModal(classId, dateIso); };
    };
  }
}
function capitalize(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }

/* ---------- Class modal ---------- */
function openClassModal(id, opts){
  opts = opts || {};
  const existing = id ? state.classes.find(c=>c.id===id) : null;
  const lockSubjectId = opts.presetSubjectId || null;
  const lockedSubject = lockSubjectId ? getSubject(lockSubjectId) : null;
  const subj = existing ? getSubject(existing.subjectId) : lockedSubject;
  const chosenColor = existing ? (subj?subj.color:SUBJECT_COLORS[0]) : (lockedSubject?lockedSubject.color:SUBJECT_COLORS[state.subjects.length % SUBJECT_COLORS.length]);
  const initialDays = existing ? existing.days.slice() : [];
  const req = '<span style="color:var(--danger)">*</span>';

  openModal(`
    <div class="modal-head"><div class="modal-title">${existing?'Editar tramo horario':'Nuevo tramo horario'}</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div class="field" id="fieldSubject">
      <label>Asignatura ${req}</label>
      ${lockSubjectId
        ? `<div style="display:flex;align-items:center;gap:8px;padding:11px 13px;border-radius:12px;background:var(--bg);border:1.5px solid var(--line);font-weight:700;font-size:14.5px;">
             <span style="width:12px;height:12px;border-radius:50%;background:${lockedSubject?lockedSubject.color:'#999'};flex-shrink:0;"></span>
             ${escapeHtml(lockedSubject?lockedSubject.name:'')}
           </div>`
        : `<input type="text" id="fSubject" list="subjectList" placeholder="Ej. Matemáticas" value="${existing?escapeHtml(subj?subj.name:''):''}">
           <datalist id="subjectList">${state.subjects.map(s=>`<option value="${escapeHtml(s.name)}">`).join('')}</datalist>`
      }
      <div class="field-error" id="errSubject">Escribe el nombre de la asignatura</div>
    </div>
    <div class="field" id="fieldDays">
      <label>Días ${req}</label>
      <div class="daypick" id="fDay">${DOW_SHORT.map((d,i)=>`<button type="button" data-d="${i}" class="${initialDays.includes(i)?'active':''}">${d}</button>`).join('')}</div>
      <div style="font-size:11.5px;color:var(--ink-faint);margin-top:6px;">Puedes marcar varios días si la clase es a la misma hora, por ejemplo Lunes y Miércoles.</div>
      <div class="field-error" id="errDays">Selecciona al menos un día</div>
    </div>
    <div class="row2">
      <div class="field" id="fieldStart"><label>Hora inicio ${req}</label><input type="time" id="fStart" value="${existing?existing.start:''}"><div class="field-error" id="errStart">Obligatorio</div></div>
      <div class="field" id="fieldEnd"><label>Hora fin ${req}</label><input type="time" id="fEnd" value="${existing?existing.end:''}"><div class="field-error" id="errEnd">Obligatorio</div></div>
    </div>
    <div class="row2">
      <div class="field" id="fieldRoom"><label>Aula ${req}</label><input type="text" id="fRoom" placeholder="Ej. A-204" value="${existing?escapeHtml(existing.room||''):''}"><div class="field-error" id="errRoom">Obligatorio</div></div>
      <div class="field"><label>Profesor/a</label><input type="text" id="fTeacher" placeholder="Opcional" value="${existing?escapeHtml(existing.teacher||''):''}"></div>
    </div>
    <div class="field" id="fieldPeriod">
      <label>Periodo del curso ${req}</label>
      <div class="row2" style="margin-top:0">
        <div class="field" style="margin-bottom:0"><input type="date" id="fDateStart" value="${existing?(existing.dateStart||''):''}"></div>
        <div class="field" style="margin-bottom:0"><input type="date" id="fDateEnd" value="${existing?(existing.dateEnd||''):''}"></div>
      </div>
      <div style="font-size:11.5px;color:var(--ink-faint);margin-top:6px;">Por ejemplo, del inicio al final del curso, o solo un trimestre concreto.</div>
      <div class="field-error" id="errPeriod">Indica fecha de inicio y de fin</div>
    </div>
    <button class="btn btn-primary" id="fSave">${ICONS.pencil} Guardar</button>
    ${existing?`<button class="btn btn-danger" id="fDelete">${ICONS.trash} Eliminar este tramo</button>`:''}
  `);

  let selDays = initialDays.slice(), selColor = chosenColor;
  let endManuallyEdited = false, dateEndManuallyEdited = false;
  document.querySelectorAll('#fDay button').forEach(b=>{
    b.onclick=()=>{
      const d = Number(b.dataset.d);
      if(selDays.includes(d)){
        selDays = selDays.filter(x=>x!==d);
      } else {
        selDays.push(d);
      }
      b.classList.toggle('active');
      if(selDays.length) clearFieldError('fieldDays','errDays');
    };
  });


  const fStartEl = document.getElementById('fStart'), fEndEl = document.getElementById('fEnd');
  fEndEl.addEventListener('input', ()=>{ endManuallyEdited = true; if(fEndEl.value) clearFieldError('fieldEnd','errEnd'); });
  fStartEl.addEventListener('input', ()=>{
    if(fStartEl.value) clearFieldError('fieldStart','errStart');
    if(endManuallyEdited) return;
    if(!fStartEl.value) return;
    const s = timeToMin(fStartEl.value);
    fEndEl.value = minTimeToStr(s + 60);
    if(fEndEl.value) clearFieldError('fieldEnd','errEnd');
  });

  const fRoomEl = document.getElementById('fRoom');
  fRoomEl.addEventListener('input', ()=>{ if(fRoomEl.value.trim()) clearFieldError('fieldRoom','errRoom'); });

  const fSubjectEl = document.getElementById('fSubject');
  if(fSubjectEl) fSubjectEl.addEventListener('input', ()=>{ if(fSubjectEl.value.trim()) clearFieldError('fieldSubject','errSubject'); });

  const fDateStartEl = document.getElementById('fDateStart'), fDateEndEl = document.getElementById('fDateEnd');
  fDateEndEl.addEventListener('input', ()=>{ dateEndManuallyEdited = true; if(fDateStartEl.value && fDateEndEl.value) clearFieldError('fieldPeriod','errPeriod'); });
  fDateStartEl.addEventListener('input', ()=>{
    if(!dateEndManuallyEdited && fDateStartEl.value){ fDateEndEl.value = defaultCourseEndDate(fDateStartEl.value); }
    if(fDateStartEl.value && fDateEndEl.value) clearFieldError('fieldPeriod','errPeriod');
  });

  function clearFieldError(fieldId, errId){
    if(fieldId) document.getElementById(fieldId).classList.remove('invalid');
    document.getElementById(errId).classList.remove('show');
  }
  function markFieldError(fieldId, errId){
    if(fieldId) document.getElementById(fieldId).classList.add('invalid');
    document.getElementById(errId).classList.add('show');
  }

  document.getElementById('fSave').onclick=()=>{
    let hasErrors = false;
    let name = '';
    if(!lockSubjectId){
      name = document.getElementById('fSubject').value.trim();
      if(!name){ markFieldError('fieldSubject','errSubject'); hasErrors = true; } else { clearFieldError('fieldSubject','errSubject'); }
    }
    if(selDays.length===0){ markFieldError('fieldDays','errDays'); hasErrors = true; } else { clearFieldError('fieldDays','errDays'); }
    const start = fStartEl.value;
    if(!start){ markFieldError('fieldStart','errStart'); hasErrors = true; } else { clearFieldError('fieldStart','errStart'); }
    const end = fEndEl.value;
    if(!end){ markFieldError('fieldEnd','errEnd'); hasErrors = true; } else { clearFieldError('fieldEnd','errEnd'); }
    const room = fRoomEl.value.trim();
    if(!room){ markFieldError('fieldRoom','errRoom'); hasErrors = true; } else { clearFieldError('fieldRoom','errRoom'); }
    let dateStart = fDateStartEl.value || '';
    let dateEnd = fDateEndEl.value || '';
    if(!dateStart || !dateEnd){ markFieldError('fieldPeriod','errPeriod'); hasErrors = true; } else { clearFieldError('fieldPeriod','errPeriod'); }

    if(hasErrors){ toast('Completa los campos obligatorios marcados en rojo'); return; }

    let subject;
    if(lockSubjectId){
      subject = getSubject(lockSubjectId);
      if(!subject){ toast('No se encontró la asignatura'); return; }
    } else {
      subject = getOrCreateSubject(name);
    }
    const teacher = document.getElementById('fTeacher').value.trim();
    if(dateEnd < dateStart){ const t=dateStart; dateStart=dateEnd; dateEnd=t; }
    subject.color = selColor;
    const days = selDays.slice().sort((a,b)=>a-b);
    if(existing){
      Object.assign(existing, {subjectId:subject.id, days, start, end, room, teacher, dateStart, dateEnd});
    } else {
      state.classes.push({ id:uid(), subjectId:subject.id, days, start, end, room, teacher, dateStart, dateEnd });
    }
    saveState(); toast('Guardado');
    if(opts.afterSave){ closeModal(); opts.afterSave(); }
    else { closeModal(); ui.tab='calendar'; ui.day=days[0]; render(); }
  };
  if(existing){
    document.getElementById('fDelete').onclick=()=>{
      state.classes = state.classes.filter(c=>c.id!==existing.id);
      saveState(); toast('Tramo eliminado');
      if(opts.afterSave){ closeModal(); opts.afterSave(); }
      else { closeModal(); render(); }
    };
  }
}

/* ---------- Item modal (exam/task) ---------- */
function openItemModal(id, defaults){
  defaults = defaults || {};
  const existing = id ? state.items.find(i=>i.id===id) : null;
  const defaultSubj = defaults.subjectId ? getSubject(defaults.subjectId) : null;
  const subj = existing && existing.subjectId ? getSubject(existing.subjectId) : defaultSubj;
  let type = existing ? existing.type : (defaults.type || 'exam');

  openModal(`
    <div class="modal-head"><div class="modal-title">${existing?'Editar':'Nuevo examen o tarea'}</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div class="field">
      <label>Tipo</label>
      <div class="seg" id="fType">
        <button type="button" data-t="exam" class="${type==='exam'?'active':''}">📕 Examen</button>
        <button type="button" data-t="task" class="${type==='task'?'active':''}">📝 Tarea</button>
      </div>
    </div>
    <div class="field"><label>Título</label><input type="text" id="fTitle" placeholder="Ej. Examen tema 4" value="${existing?escapeHtml(existing.title):''}"></div>
    <div class="field">
      <label>Asignatura (opcional)</label>
      <input type="text" id="fSubject2" list="subjectList2" placeholder="Ej. Historia" value="${subj?escapeHtml(subj.name):''}">
      <datalist id="subjectList2">${state.subjects.map(s=>`<option value="${escapeHtml(s.name)}">`).join('')}</datalist>
    </div>
    <div class="row2">
      <div class="field"><label>Fecha</label><input type="date" id="fDate" value="${existing?existing.date:(defaults.date||todayISO())}"></div>
      <div class="field"><label>Hora (opcional)</label><input type="time" id="fTime" value="${existing?(existing.time||''):''}"></div>
    </div>
    <div class="field">
      <label>Avisarme</label>
      <select id="fRemind">
        <option value="0">El mismo día</option>
        <option value="1">1 día antes</option>
        <option value="2">2 días antes</option>
        <option value="3">3 días antes</option>
        <option value="7">1 semana antes</option>
      </select>
    </div>
    <div class="field"><label>Notas (opcional)</label><textarea id="fNotes" placeholder="Detalles, temario, materiales...">${existing?escapeHtml(existing.notes||''):''}</textarea></div>
    <button class="btn btn-primary" id="fSave">${ICONS.pencil} Guardar</button>
    ${existing?`<button class="btn btn-danger" id="fDelete">${ICONS.trash} Eliminar</button>`:''}
  `);

  document.getElementById('fRemind').value = existing ? String(existing.remindDays ?? 2) : '2';
  document.querySelectorAll('#fType button').forEach(b=>b.onclick=()=>{ type=b.dataset.t; document.querySelectorAll('#fType button').forEach(x=>x.classList.toggle('active',x===b)); });

  document.getElementById('fSave').onclick=()=>{
    const title = document.getElementById('fTitle').value.trim();
    if(!title){ toast('Escribe un título'); return; }
    const date = document.getElementById('fDate').value || todayISO();
    const time = document.getElementById('fTime').value;
    const notes = document.getElementById('fNotes').value.trim();
    const remindDays = Number(document.getElementById('fRemind').value);
    const subjName = document.getElementById('fSubject2').value.trim();
    const subject = subjName ? getOrCreateSubject(subjName) : null;
    const classId = existing ? existing.classId : defaults.classId;
    if(existing){
      Object.assign(existing, {type, title, date, time, notes, remindDays, subjectId: subject?subject.id:null});
    } else {
      state.items.push({ id:uid(), type, title, date, time, notes, remindDays, subjectId: subject?subject.id:null, classId, notified:false });
    }
    saveState(); closeModal(); render();
    if(defaults.afterSave) defaults.afterSave();
    toast('Guardado');
  };
  if(existing){
    document.getElementById('fDelete').onclick=()=>{
      state.items = state.items.filter(i=>i.id!==existing.id);
      saveState(); closeModal(); render();
      if(defaults.afterSave) defaults.afterSave();
      toast('Eliminado');
    };
  }
}

/* ---------- Holiday modal ---------- */
function openHolidayModal(id){
  const existing = id ? state.holidays.find(h=>h.id===id) : null;
  openModal(`
    <div class="modal-head"><div class="modal-title">${existing?'Editar festivo':'Nuevo festivo'}</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div class="field"><label>Nombre</label><input type="text" id="fName" placeholder="Ej. Vacaciones de Navidad" value="${existing?escapeHtml(existing.name):''}"></div>
    <div class="row2">
      <div class="field"><label>Desde</label><input type="date" id="fStart" value="${existing?existing.start:todayISO()}"></div>
      <div class="field"><label>Hasta</label><input type="date" id="fEnd" value="${existing?existing.end:todayISO()}"></div>
    </div>
    <button class="btn btn-primary" id="fSave">${ICONS.pencil} Guardar</button>
    ${existing?`<button class="btn btn-danger" id="fDelete">${ICONS.trash} Eliminar</button>`:''}
  `);
  document.getElementById('fSave').onclick=()=>{
    const name = document.getElementById('fName').value.trim();
    if(!name){ toast('Escribe un nombre'); return; }
    let start = document.getElementById('fStart').value || todayISO();
    let end = document.getElementById('fEnd').value || start;
    if(end<start) end=start;
    if(existing){ Object.assign(existing,{name,start,end}); }
    else { state.holidays.push({id:uid(), name, start, end}); }
    saveState(); closeModal(); render(); toast('Guardado');
  };
  if(existing){
    document.getElementById('fDelete').onclick=()=>{
      state.holidays = state.holidays.filter(h=>h.id!==existing.id);
      saveState(); closeModal(); render(); toast('Eliminado');
    };
  }
}

/* ---------- Reset confirm ---------- */
function confirmReset(){
  openModal(`
    <div class="modal-head"><div class="modal-title">¿Borrar todo?</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <p style="font-size:13.5px;color:var(--ink-soft);line-height:1.5;">Esto eliminará permanentemente todas las clases, exámenes, tareas y festivos guardados en este dispositivo. No se puede deshacer.</p>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-danger" id="fConfirmReset" style="margin-top:0">Borrar todo</button>
    </div>
  `);
  document.getElementById('fConfirmReset').onclick=()=>{
    state = defaultState(); saveState(); closeModal(); render(); toast('Datos borrados');
  };
}

/* ==================================================================
   BACKUP: export / import
   ================================================================== */
function exportData(){
  const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = todayISO();
  a.href = url; a.download = `mi-horario-backup-${stamp}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Copia de seguridad descargada');
}
function importData(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async ()=>{
    const buf = reader.result;
    const bytes = new Uint8Array(buf);
    const isSqlite = bytesLookLikeSqlite(bytes);

    if(isSqlite){
      try{
        const parsed = await parseOldAppSqlite(bytes);
        confirmImportPreview(parsed, 'la copia de la app antigua (.sqlite)');
      }catch(err){
        console.error('Fallo importando sqlite:', err);
        if(String(err).includes('initSqlJs') || typeof initSqlJs==='undefined'){
          toast('No se pudo cargar el lector de SQLite. Revisa tu conexión a internet e inténtalo de nuevo.');
        } else {
          toast('No se pudo leer ese archivo .sqlite: '+(err && err.message ? err.message : 'formato no reconocido'));
        }
      }
      e.target.value='';
      return;
    }

    // Try as JSON text
    try{
      const text = new TextDecoder('utf-8').decode(bytes);
      const parsed = JSON.parse(text);
      if(!parsed || typeof parsed!=='object') throw new Error('formato inválido');
      confirmImportPreview(parsed, 'el archivo .json');
    }catch(err){
      console.error('Fallo importando json:', err);
      toast('El archivo no es una copia de seguridad válida (ni .json ni .sqlite)');
    }
    e.target.value='';
  };
  reader.onerror = ()=>{ toast('No se pudo leer el archivo'); e.target.value=''; };
  reader.readAsArrayBuffer(file);
}
function bytesLookLikeSqlite(bytes){
  // SQLite files start with the 16-byte header "SQLite format 3\0"
  const magic = [0x53,0x51,0x4c,0x69,0x74,0x65,0x20,0x66,0x6f,0x72,0x6d,0x61,0x74,0x20,0x33,0x00];
  if(bytes.length < magic.length) return false;
  for(let i=0;i<magic.length;i++){ if(bytes[i]!==magic[i]) return false; }
  return true;
}

function confirmImportPreview(parsed, sourceLabel, opts){
  opts = opts || {};
  const nc = (parsed.subjects||[]).length, ncl=(parsed.classes||[]).length, ni=(parsed.items||[]).length, nh=(parsed.holidays||[]).length;
  openModal(`
    <div class="modal-head"><div class="modal-title">Importar copia</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <p style="font-size:13.5px;color:var(--ink-soft);line-height:1.5;">Se encontraron en ${sourceLabel}: <b>${nc}</b> asignaturas, <b>${ncl}</b> clases, <b>${ni}</b> exámenes/tareas y <b>${nh}</b> festivos.<br><br>Esto reemplazará todos los datos actuales de la app. ¿Continuar?</p>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="fConfirmImport" style="margin-top:0">Importar</button>
    </div>
  `);
  document.getElementById('fConfirmImport').onclick=()=>{
    state = migrateState(Object.assign(defaultState(), parsed));
    if(opts.fromDrive){
      // Ya coincide con lo que hay en Drive: guardamos tal cual, sin cambiar su fecha
      // ni reprogramar una nueva subida (si no, entraría en un bucle subir-bajar-subir).
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem('driveLastSync', String(Date.now()));
    } else {
      saveState();
    }
    closeModal(); render(); toast('Datos importados');
  };
}

/* ---------- Import from old app's SQLite backup ---------- */
let _sqlJsPromise = null;
function loadSqlJs(){
  if(_sqlJsPromise) return _sqlJsPromise;
  _sqlJsPromise = initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` });
  return _sqlJsPromise;
}
function dbAll(db, sql){
  const res = db.exec(sql);
  if(!res.length) return [];
  const {columns, values} = res[0];
  return values.map(row=>{
    const o={};
    columns.forEach((c,i)=>o[c]=row[i]);
    return o;
  });
}
function androidColorToHex(c){
  if(c===null || c===undefined) return null;
  const u = (c>>>0) & 0xFFFFFF;
  return '#'+u.toString(16).toUpperCase().padStart(6,'0');
}
function tsToDate(ts){
  const d = new Date(ts*1000);
  return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');
}
function tsToTime(ts){
  const d = new Date(ts*1000);
  const h=d.getUTCHours(), m=d.getUTCMinutes();
  if(h===0 && m===0) return '';
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
}
function minutesToTime(m){
  m = m||0;
  return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
}
async function parseOldAppSqlite(bytes){
  const SQL = await loadSqlJs();
  const db = new SQL.Database(bytes);

  const subjects=[]; const courseMap={};
  dbAll(db, "SELECT * FROM courses WHERE is_deleted=0").forEach((row,idx)=>{
    const color = androidColorToHex(row.color) || SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
    subjects.push({ id: row.uuid, name: row.name || '(Sin nombre)', color });
    courseMap[row.uuid] = row.uuid;
  });

  const teacherMap={};
  dbAll(db, "SELECT * FROM teachers WHERE is_deleted=0").forEach(row=>{ teacherMap[row.uuid]=row.name; });

  const DAY_FIELDS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const classes=[];
  dbAll(db, "SELECT * FROM hours WHERE is_deleted=0").forEach(row=>{
    const subjId = courseMap[row.course_uuid];
    if(!subjId) return;
    const teacherName = row.teacher_uuid ? (teacherMap[row.teacher_uuid]||'') : '';
    const start = minutesToTime(row.from_time), end = minutesToTime(row.to_time);
    const dateStart = row.start_date ? tsToDate(row.start_date) : '';
    const dateEnd = row.end_date ? tsToDate(row.end_date) : '';
    const days = [];
    DAY_FIELDS.forEach((f,i)=>{ if(row[f]) days.push(i); });
    if(days.length===0) return;
    classes.push({ id: row.uuid, subjectId:subjId, days, start, end, room: row.room||'', teacher: teacherName||'', dateStart, dateEnd });
  });

  const items=[];
  dbAll(db, "SELECT * FROM exams WHERE is_deleted=0").forEach(row=>{
    const subjId = courseMap[row.course_uuid];
    items.push({
      id: row.uuid, type:'exam', title: row.name || 'Examen',
      date: tsToDate(row.date_time), time: tsToTime(row.date_time),
      notes: (row.text||'') + (row.room ? ' · Aula: '+row.room : ''),
      remindDays:2, subjectId: subjId||null, notified:false
    });
  });
  dbAll(db, "SELECT * FROM tasks WHERE is_deleted=0").forEach(row=>{
    const subjId = courseMap[row.course_uuid];
    const text = (row.text||'').trim();
    const title = text ? text.split('\n')[0].slice(0,70) : 'Tarea';
    items.push({
      id: row.uuid, type:'task', title,
      date: tsToDate(row.date_time), time: tsToTime(row.date_time),
      notes: text, remindDays:1, subjectId: subjId||null, notified:false
    });
  });

  const holidays=[];
  dbAll(db, "SELECT * FROM holidays WHERE is_deleted=0").forEach(row=>{
    holidays.push({ id: row.uuid, name: row.name||'Festivo', start: tsToDate(row.start_date), end: tsToDate(row.end_date) });
  });

  db.close();
  return { subjects, classes, items, holidays, settings:{notified:[]} };
}

/* ==================================================================
   NOTIFICACIONES / RECORDATORIOS
   ================================================================== */
function requestNotifPermission(){
  if(!('Notification' in window)){ toast('Este navegador no admite notificaciones'); return; }
  if(Notification.permission==='denied'){ toast('Notificaciones bloqueadas en el navegador'); return; }
  Notification.requestPermission().then(p=>{
    if(p==='granted'){ state.settings.notificationsEnabled = true; saveState(); toast('Notificaciones activadas'); }
    updateNotifBellIcon();
    if(ui.tab==='settings') render();
  });
}
/* Si a un alumno no se le ha puesto ninguna nota de Gestión en una clase concreta, y
   ya han pasado 2 días o más desde ese día, se le pone una nota por defecto: 0 si ese
   día tiene marcado Falta, Justificada o Expulsión en Asistència, y 2 en caso
   contrario (se entiende que, si no se ha anotado nada malo, la gestión ha sido
   correcta). No se toca nada que ya tenga puesta una nota explícita, y solo se mira
   hasta 30 días atrás como máximo, para no revisar todo el histórico cada vez. */
function applyDefaultGestion(){
  const today = todayISO();
  const windowStart = addDaysISO(today, -30);
  let changed = 0;
  state.classes.forEach(cls=>{
    const students = state.students.filter(s=>s.subjectId===cls.subjectId);
    if(students.length===0) return;
    for(let d=windowStart; d<today; d=addDaysISO(d,1)){
      if(daysBetween(d, today) < 2) continue;
      const dow = mondayIndex(parseISO(d));
      if(!cls.days.includes(dow)) continue;
      if(!classActiveOnDate(cls, d)) continue;
      if(holidayForDate(d)) continue;
      students.forEach(s=>{
        const rec = state.records.find(r=>r.studentId===s.id && r.date===d);
        if(!rec || rec.gestio==null){
          const r2 = getOrCreateRecord(s.id, d);
          const hasFJE = (r2.assistencia||[]).some(a=>a==='F'||a==='J'||a==='E') || isStudentExemptOn(s, d);
          r2.gestio = hasFJE ? 0 : 2;
          persistRecord(r2);
          changed++;
        }
      });
    }
  });
  return changed;
}

function checkReminders(){
  if(!('Notification' in window) || Notification.permission!=='granted') return;
  if(state.settings.notificationsEnabled === false) return;
  const today = todayISO();
  let changed = false;
  state.items.forEach(i=>{
    const diff = daysBetween(today,i.date);
    if(diff>=0 && diff<=(i.remindDays??2) && !i.notified){
      try{
        new Notification(i.type==='exam' ? '📕 Examen próximo':'📝 Tarea próxima', {
          body: `${i.title} — ${fmtDateHuman(i.date)}`,
        });
      }catch(e){}
      i.notified = true;
      changed = true;
    }
  });
  // Solo se guarda si de verdad ha habido algún aviso nuevo, nunca solo por tener la
  // app abierta sin haber cambiado nada. Se guarda con saveStateLocalOnly (no
  // saveState): qué avisos ya se han mostrado es un detalle interno sin importancia,
  // que no debería hacer que este dispositivo parezca "más reciente" que otro a la
  // hora de sincronizar y arriesgarse a sobrescribir cambios de verdad hechos en otro.
  if(changed) saveStateLocalOnly();
}

/* ==================================================================
   SINCRONIZACIÓN CON GOOGLE DRIVE
   Guarda una copia de los datos en una carpeta privada de tu Drive
   (solo visible para esta app) y la compara al abrir la app.
   ================================================================== */
let driveTokenClient = null;
let driveAccessToken = null;
let driveTokenExpiry = 0;
let driveSyncing = false;
let driveUploadTimer = null;

// Recuperar el permiso guardado de una sesión anterior (si no ha caducado),
// para no tener que pedirlo de nuevo solo por haber recargado la página.
(function restoreDriveToken(){
  try{
    const savedToken = localStorage.getItem('driveAccessTokenCache');
    const savedExpiry = Number(localStorage.getItem('driveTokenExpiryCache')||0);
    if(savedToken && savedExpiry > Date.now() + 30000){
      driveAccessToken = savedToken;
      driveTokenExpiry = savedExpiry;
    }
  }catch(e){}
})();

function driveConfigured(){ return GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID!=='PENDIENTE_CLIENT_ID'; }
function driveIsConnected(){ return !!localStorage.getItem('driveConnected'); }

function waitForGoogleIdentity(timeoutMs){
  return new Promise((resolve)=>{
    const start = Date.now();
    (function poll(){
      if(typeof google!=='undefined' && google.accounts && google.accounts.oauth2){ resolve(true); return; }
      if(Date.now()-start > timeoutMs){ resolve(false); return; }
      setTimeout(poll, 200);
    })();
  });
}

function driveEnsureTokenClient(){
  if(driveTokenClient) return driveTokenClient;
  if(typeof google==='undefined' || !google.accounts) return null;
  driveTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: DRIVE_SCOPE,
    callback: '', // se sobreescribe en cada llamada
  });
  return driveTokenClient;
}

async function driveGetToken(silent){
  if(!driveConfigured()) throw new Error('Google Drive no está configurado todavía');
  if(driveAccessToken && Date.now() < driveTokenExpiry - 30000) return driveAccessToken;
  let client = driveEnsureTokenClient();
  if(!client){
    const ready = await waitForGoogleIdentity(6000);
    if(!ready) throw new Error('No se pudo cargar el inicio de sesión de Google. Comprueba tu conexión a internet e inténtalo de nuevo en unos segundos.');
    client = driveEnsureTokenClient();
    if(!client) throw new Error('No se pudo iniciar el inicio de sesión de Google.');
  }
  const request = (promptValue)=> new Promise((resolve, reject)=>{
    client.callback = (resp)=>{
      if(resp.error){ reject(new Error(resp.error)); return; }
      driveAccessToken = resp.access_token;
      driveTokenExpiry = Date.now() + (resp.expires_in||3600)*1000;
      localStorage.setItem('driveConnected','1');
      localStorage.setItem('driveAccessTokenCache', driveAccessToken);
      localStorage.setItem('driveTokenExpiryCache', String(driveTokenExpiry));
      resolve(driveAccessToken);
    };
    client.requestAccessToken({ prompt: promptValue });
  });
  try{
    return await request('');
  }catch(e){
    if(silent) throw e;
    // Intento silencioso fallido: pedimos consentimiento explícito como último recurso
    return await request('consent');
  }
}

/* A veces el token guardado en caché PARECE que no ha caducado todavía (según el
   reloj de la propia app), pero Google ya lo ha invalidado de verdad (por ejemplo,
   al cerrar sesión y volver a entrar). Esta función hace la petición, y si Google
   responde 401, pide un token nuevo de verdad (sin usar la caché) y reintenta una
   sola vez antes de rendirse. */
async function driveFetchWithRetry(url, options){
  options = options || {};
  const doFetch = ()=> fetch(url, { ...options, headers: { ...(options.headers||{}), Authorization: `Bearer ${driveAccessToken}` } });
  let res = await doFetch();
  if(res.status === 401){
    console.log('[MiHorario/Drive] El token en caché ha resultado inválido (401): pidiendo uno nuevo de verdad.');
    driveAccessToken = null;
    localStorage.removeItem('driveAccessTokenCache');
    localStorage.removeItem('driveTokenExpiryCache');
    await driveGetToken(true);
    res = await doFetch();
  }
  return res;
}

async function driveFindFile(token, fileName){
  fileName = fileName || DRIVE_FILE_NAME;
  const q = encodeURIComponent(`name='${fileName}' and trashed=false`);
  const res = await driveFetchWithRetry(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,modifiedTime)`);
  if(!res.ok) throw new Error('No se pudo consultar Google Drive');
  const data = await res.json();
  return (data.files && data.files[0]) || null;
}

async function driveDownload(token, fileId){
  const res = await driveFetchWithRetry(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
  if(!res.ok) throw new Error('No se pudo descargar la copia de Drive');
  return res.json();
}

async function driveUpload(token, fileId, payload, fileName){
  fileName = fileName || DRIVE_FILE_NAME;
  const body = JSON.stringify(payload);
  if(fileId){
    const res = await driveFetchWithRetry(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method:'PATCH',
      headers: { 'Content-Type':'application/json' },
      body
    });
    if(!res.ok) throw new Error('No se pudo actualizar la copia en Drive');
    return res.json();
  } else {
    const metadata = { name: fileName, mimeType:'application/json' };
    const boundary = 'mihorario' + uid();
    const multipartBody =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
    const res = await driveFetchWithRetry('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method:'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: multipartBody
    });
    if(!res.ok) throw new Error('No se pudo crear la copia en Drive');
    return res.json();
  }
}

/* Sube los datos locales a Drive si son más nuevos que los remotos (o no hay copia aún). */
async function driveSyncUpload(opts){
  opts = opts || {};
  const showToast = !!opts.showToast;
  const interactive = !!opts.interactive;
  if(!driveConfigured() || !driveIsConnected() || driveSyncing) return;
  driveSyncing = true;
  try{
    const token = await driveGetToken(!interactive);
    localStorage.removeItem('driveNeedsReconnect');
    const remote = await driveFindFile(token);
    if(remote){
      const remoteData = await driveDownload(token, remote.id);
      const remoteModified = (remoteData.settings && remoteData.settings.lastModified) || 0;
      if(remoteModified > (state.settings.lastModified||0)){
        // Hay una versión más reciente en Drive: avisar en vez de sobreescribirla
        driveOfferRemoteUpdate(remoteData);
        return;
      }
      await driveUpload(token, remote.id, state);
    } else {
      await driveUpload(token, null, state);
    }
    localStorage.setItem('driveLastSync', String(Date.now()));
    if(showToast) toast('Sincronizado con Google Drive');
    renderDriveHint(); // aviso siempre visible, sin recargar el contenido de la pestaña actual
  }catch(e){
    if(!interactive){ localStorage.setItem('driveNeedsReconnect','1'); }
    if(showToast) toast('No se pudo sincronizar: '+e.message);
    renderDriveHint(); // aviso siempre visible, sin recargar el contenido de la pestaña actual
  } finally {
    driveSyncing = false;
  }
}

function scheduleDriveUpload(){
  if(!driveConfigured() || !driveIsConnected()) return;
  clearTimeout(driveUploadTimer);
  driveUploadTimer = setTimeout(()=>driveSyncUpload({showToast:false, interactive:false}), 2500);
}

function driveOfferRemoteUpdate(remoteData, onApplied){
  if(document.getElementById('driveUpdateBanner')) return;
  const t = document.createElement('div');
  t.id = 'driveUpdateBanner';
  t.className = 'drive-banner';
  t.innerHTML = `
    <span class="drive-banner-text">☁️ Hay cambios más recientes en Google Drive</span>
    <button type="button" id="driveUpdateBtn">Actualizar</button>
    <button type="button" id="driveUpdateDismiss" aria-label="Cerrar">${ICONS.x}</button>
  `;
  document.body.appendChild(t);
  document.getElementById('driveUpdateBtn').onclick = ()=>{
    t.remove();
    confirmImportPreview(remoteData, 'la copia de Google Drive', {fromDrive:true});
    // Solo ahora, con los datos ya puestos al día, es seguro seguir con sincronizaciones
    // automáticas (como la de deberes con Calendar) sin riesgo de "envejecer" por error
    // esta copia y hacer que parezca la más reciente sin serlo de verdad.
    if(onApplied) onApplied();
  };
  document.getElementById('driveUpdateDismiss').onclick = ()=> t.remove();
}

/* Comprueba Drive al abrir la app (silencioso: no pide inicio de sesión si no hace falta).
   Si hay una versión más reciente esperando a que el usuario decida actualizar, NO se
   avisa a onSafeToSync hasta que lo haga (o descarte el aviso) -- así evitamos que otras
   sincronizaciones automáticas (como la de deberes con Calendar) se ejecuten sobre una
   copia local que sabemos que está desactualizada y la hagan parecer la más reciente
   sin serlo de verdad. */
async function driveCheckOnLoad(onSafeToSync){
  if(!driveConfigured() || !driveIsConnected()){
    console.log('[MiHorario/Drive] No configurado o no conectado, se omite la comprobación.');
    if(onSafeToSync) onSafeToSync();
    return;
  }
  try{
    console.log('[MiHorario/Drive] Pidiendo token (silencioso)...');
    const token = await driveGetToken(true);
    console.log('[MiHorario/Drive] Token obtenido. Buscando archivo en Drive...');
    localStorage.removeItem('driveNeedsReconnect');
    const remote = await driveFindFile(token);
    if(!remote){
      console.log('[MiHorario/Drive] No hay archivo en Drive todavía.');
      if(onSafeToSync) onSafeToSync();
      return;
    }
    console.log('[MiHorario/Drive] Archivo encontrado, descargando para comparar...');
    const remoteData = await driveDownload(token, remote.id);
    const remoteModified = (remoteData.settings && remoteData.settings.lastModified) || 0;
    console.log('[MiHorario/Drive] Comparando fechas -> local:', state.settings.lastModified||0, 'remoto:', remoteModified);
    if(remoteModified > (state.settings.lastModified||0)){
      console.log('[MiHorario/Drive] El remoto es más reciente: mostrando aviso de actualización.');
      driveOfferRemoteUpdate(remoteData, onSafeToSync);
    } else {
      if((state.settings.lastModified||0) > remoteModified){
        console.log('[MiHorario/Drive] El local es más reciente: guardando copia de seguridad de lo que hay en Drive antes de sobrescribir, y subiendo.');
        try{ await driveUpload(token, null, remoteData, 'mi-horario-backup-auto-'+Date.now()+'.json'); }
        catch(e){ console.log('[MiHorario/Drive] No se pudo guardar la copia de seguridad (se sube igualmente):', e.message); }
        await driveUpload(token, remote.id, state);
        localStorage.setItem('driveLastSync', String(Date.now()));
      } else {
        console.log('[MiHorario/Drive] Están igual, nada que hacer.');
      }
      if(onSafeToSync) onSafeToSync();
    }
  }catch(e){
    // La sesión de Google probablemente ha caducado en este dispositivo, o no hay
    // conexión ahora mismo: lo marcamos para que se muestre un aviso. A diferencia
    // de los demás casos, aquí NO llamamos a onSafeToSync -- no sabemos si esta
    // copia local está al día o no, así que es más seguro no crear datos nuevos
    // (como los de "Gestión por defecto") sobre una base que podría estar
    // desactualizada, evitando que después parezca "más reciente" sin serlo de
    // verdad y sobrescriba cambios hechos en otro dispositivo mientras tanto.
    console.log('[MiHorario/Drive] Fallo durante la comprobación (no se ejecutan tareas automáticas esta vez):', e && e.message);
    localStorage.setItem('driveNeedsReconnect','1');
  }
  renderDriveHint(); // aviso siempre visible, sin recargar el contenido de la pestaña actual
}

async function driveConnect(){
  if(!driveConfigured()){ toast('Todavía no se ha configurado el Client ID de Google'); return; }
  try{
    await driveGetToken(false);
    localStorage.removeItem('driveNeedsReconnect');
    toast('Conectado con Google Drive');
    await driveSyncUpload({showToast:false, interactive:true});
    drivePhotosDownloadIfNewer();
    drivePhotosUpload();
    render();
  }catch(e){
    toast('No se pudo conectar: '+e.message);
  }
}
function driveDisconnect(){
  localStorage.removeItem('driveConnected');
  localStorage.removeItem('driveLastSync');
  localStorage.removeItem('driveNeedsReconnect');
  localStorage.removeItem('driveAccessTokenCache');
  localStorage.removeItem('driveTokenExpiryCache');
  driveAccessToken = null;
  driveTokenExpiry = 0;
  toast('Desconectado de Google Drive');
  render();
}

/* ==================================================================
   SINCRONIZACIÓN DE DEBERES CON GOOGLE CALENDAR
   Busca, dentro del calendario vinculado a la asignatura, el evento que
   ocupa ese día y esa hora concreta (el hueco de clase ya creado a mano
   por el profesor) y le añade el texto de los deberes a su descripción.
   ================================================================== */

/* Busca el evento del calendario que se solapa con [startIso, endIso) ese día. */
async function calendarFindEventForSlot(token, calendarId, dateIso, startTime, endTime){
  // Usamos el día en hora LOCAL (no UTC) para acotar la búsqueda, y comparamos
  // las horas de los eventos también en local: los eventos de Calendar llevan su
  // propio desfase horario (p.ej. +02:00 en verano), y comparar en UTC desajustaba
  // la hora real de la clase.
  const dayStart = parseISO(dateIso);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate()+1);
  const timeMin = dayStart.toISOString();
  const timeMax = dayEnd.toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
    + `?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
  const res = await driveFetchWithRetry(url);
  if(!res.ok){
    if(res.status===404) throw new Error('No se encontró ese calendario. Revisa el ID.');
    if(res.status===403) throw new Error('Sin permiso para acceder a ese calendario.');
    throw new Error('No se pudo consultar el calendario');
  }
  const data = await res.json();
  const events = data.items || [];
  const wantStart = timeToMin(startTime), wantEnd = timeToMin(endTime);
  // Buscamos el evento cuyo horario se solape con el tramo de la clase (no hace falta que coincida al minuto).
  return events.find(ev=>{
    if(!ev.start || !ev.start.dateTime) return false; // ignoramos eventos "todo el día"
    const evStart = new Date(ev.start.dateTime);
    const evEnd = ev.end && ev.end.dateTime ? new Date(ev.end.dateTime) : new Date(evStart.getTime()+60000);
    const evStartMin = evStart.getHours()*60 + evStart.getMinutes();
    const evEndMin = evEnd.getHours()*60 + evEnd.getMinutes();
    return evStartMin < wantEnd && evEndMin > wantStart;
  }) || null;
}

async function calendarUpdateEventDescription(token, calendarId, eventId, description){
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;
  const res = await driveFetchWithRetry(url, {
    method:'PATCH',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ description })
  });
  if(!res.ok) throw new Error('No se pudo actualizar el evento del calendario');
  return res.json();
}

/* Punto de entrada: intenta escribir los deberes en el calendario vinculado de la asignatura,
   en el evento correspondiente a ese día y tramo horario. No bloquea el guardado local si falla. */
async function pushDeberesToCalendar(subjectId, dateIso, cls, deberesText, itemRef){
  const subj = getSubject(subjectId);
  if(!subj || !subj.calendarId) return { ok:false, reason:'no-calendar', detail:'Esta clase no tiene calendario vinculado.' };
  if(!driveConfigured() || !driveIsConnected()){
    toast('Conecta Google Drive/Calendar en Ajustes para sincronizar deberes');
    return { ok:false, reason:'not-connected', detail:'No hay conexión activa con Google Drive/Calendar.' };
  }
  try{
    const token = await driveGetToken(false);
    const event = await calendarFindEventForSlot(token, subj.calendarId, dateIso, cls.start, cls.end);
    if(!event){
      const msg = 'No se encontró ningún evento en el calendario para ese día y hora. ¿Ya está creado el hueco de esa clase?';
      toast(msg);
      return { ok:false, reason:'no-event', detail:msg };
    }
    await calendarUpdateEventDescription(token, subj.calendarId, event.id, deberesText);
    if(itemRef){ itemRef.calendarSyncedText = deberesText; saveState(); }
    const msg = deberesText ? 'Deberes escritos también en el calendario de Google' : 'Deberes borrados también del calendario de Google';
    toast(msg);
    return { ok:true, detail:msg, eventId:event.id };
  }catch(e){
    const msg = 'No se pudo actualizar el calendario: '+e.message;
    toast(msg);
    return { ok:false, reason:'error', detail:msg };
  }
}

/* ---------- Sincronización completa (bidireccional) de deberes ya existentes ---------- */
function dowIndexISO(dateIso){ return mondayIndex(parseISO(dateIso)); }

function openSyncDeberesModal(subjectId){
  const subj = getSubject(subjectId);
  if(!subj || !subj.calendarId){ toast('Esta clase no tiene calendario vinculado'); return; }
  const slots = state.classes.filter(c=>c.subjectId===subjectId);
  if(slots.length===0){ toast('Esta clase no tiene ningún tramo horario todavía'); return; }
  const starts = slots.map(s=>s.dateStart).filter(Boolean).sort();
  const ends = slots.map(s=>s.dateEnd).filter(Boolean).sort();
  const defaultFrom = starts.length ? starts[0] : todayISO();
  const defaultTo = ends.length ? ends[ends.length-1] : addDaysISO(todayISO(), 120);

  openModal(`
    <div class="modal-head"><div class="modal-title">Sincronizar deberes</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <p style="font-size:13px;color:var(--ink-soft);margin-bottom:14px;">Compara, en ese rango de fechas, lo que ya tienes escrito en la app y en el calendario vinculado: lo que falte en uno de los dos sitios se completa con lo que haya en el otro. Si un día tiene contenido distinto en ambos, no se toca (para no perder nada).</p>
    <div class="row2">
      <div class="field"><label>Desde</label><input type="date" id="syncFrom" value="${defaultFrom}"></div>
      <div class="field"><label>Hasta</label><input type="date" id="syncTo" value="${defaultTo}"></div>
    </div>
    <button class="btn btn-primary" id="syncGo">Sincronizar</button>
  `);
  document.getElementById('syncGo').onclick=async ()=>{
    const from = document.getElementById('syncFrom').value;
    const to = document.getElementById('syncTo').value;
    if(!from || !to){ toast('Indica las dos fechas'); return; }
    closeModal();
    toast('Sincronizando deberes, un momento...');
    await syncDeberesBidirectional(subjectId, from, to);
  };
}

async function syncDeberesBidirectional(subjectId, from, to, opts){
  opts = opts || {};
  const silent = !!opts.silent;
  const subj = getSubject(subjectId);
  const slots = state.classes.filter(c=>c.subjectId===subjectId);
  if(!driveConfigured() || !driveIsConnected()){ if(!silent) toast('Conecta Google Drive/Calendar en Ajustes'); return null; }

  let token;
  try{ token = await driveGetToken(silent); }
  catch(e){ if(!silent) toast('No se pudo conectar con Google: '+e.message); return null; }

  let events;
  try{
    const timeMin = parseISO(from).toISOString();
    const dayTo = parseISO(to); dayTo.setDate(dayTo.getDate()+1);
    const timeMax = dayTo.toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(subj.calendarId)}/events`
      + `?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=2500`;
    const res = await driveFetchWithRetry(url);
    if(!res.ok) throw new Error('No se pudo leer el calendario');
    const data = await res.json();
    events = (data.items||[]).filter(ev=>ev.start && ev.start.dateTime);
  }catch(e){ if(!silent) toast('No se pudo leer el calendario: '+e.message); return null; }

  let pushed=0, pulled=0, pulledDeletes=0;
  const conflicts = [];
  const patches = []; // { eventId, description, appItem }

  for(let d=from; d<=to; d=addDaysISO(d,1)){
    const dow = dowIndexISO(d);
    for(const slot of slots){
      if(!slot.days.includes(dow)) continue;
      if(!classActiveOnDate(slot, d)) continue;
      const wantStart = timeToMin(slot.start), wantEnd = timeToMin(slot.end);
      const match = events.find(ev=>{
        const evStart = new Date(ev.start.dateTime);
        if(toISO(evStart) !== d) return false;
        const evEnd = ev.end && ev.end.dateTime ? new Date(ev.end.dateTime) : new Date(evStart.getTime()+60000);
        const evStartMin = evStart.getHours()*60+evStart.getMinutes(), evEndMin = evEnd.getHours()*60+evEnd.getMinutes();
        return evStartMin < wantEnd && evEndMin > wantStart;
      });
      const appItem = state.items.find(i=>i.type==='task' && i.kind==='deberes' && i.subjectId===subjectId && i.date===d && (i.classId?i.classId===slot.id:true));
      const appText = appItem ? (appItem.notes||appItem.title||'').trim() : '';
      const calText = match ? (match.description||'').trim() : '';
      const previouslySynced = appItem && typeof appItem.calendarSyncedText === 'string';

      if(!calText && appText && match && previouslySynced){
        // La app ya había escrito esto en el calendario antes (o lo sabemos con certeza porque
        // se creó vía sincronización), y ahora está vacío ahí: se ha borrado a propósito en
        // Google Calendar, así que lo borramos también en la app en vez de volver a escribirlo.
        state.items = state.items.filter(i=>i.id!==appItem.id);
        pulledDeletes++;
      } else if(appText && !calText && match){
        // Primera vez que vemos este deberes junto a este evento (todavía no tiene marca de
        // sincronización): lo escribimos en el calendario y, a partir de ahora, si se vacía
        // ahí lo detectaremos como un borrado de verdad.
        patches.push({ eventId: match.id, description: appText, appItem });
        pushed++;
      } else if(calText && !appText){
        const newItem = { id:uid(), type:'task', kind:'deberes', title: calText.split('\n')[0].slice(0,70), date:d, time:'', notes:calText, remindDays:0, subjectId, classId:slot.id, notified:true, calendarSyncedText: calText };
        state.items.push(newItem);
        pulled++;
      } else if(appText && calText && appText!==calText){
        conflicts.push(d);
      }
    }
  }

  for(const p of patches){
    try{
      await calendarUpdateEventDescription(token, subj.calendarId, p.eventId, p.description);
      if(p.appItem) p.appItem.calendarSyncedText = p.description;
    }catch(e){}
  }
  if(pulled>0 || pulledDeletes>0) saveState();
  render();

  const result = { pushed, pulled, pulledDeletes, conflicts };
  if(silent) return result;

  openModal(`
    <div class="modal-head"><div class="modal-title">Sincronización completada</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <p style="font-size:13.5px;color:var(--ink);line-height:1.7;">
      <b>${pushed}</b> deberes de la app escritos en el calendario.<br>
      <b>${pulled}</b> deberes del calendario traídos a la app.<br>
      <b>${pulledDeletes}</b> deberes borrados en la app porque se habían borrado en el calendario.<br>
      ${conflicts.length ? `<b>${conflicts.length}</b> día(s) con contenido distinto en ambos sitios (no tocados): ${conflicts.map(d=>parseISO(d).toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit'})).join(', ')}` : 'Sin conflictos.'}
    </p>
    <button class="btn btn-primary" id="syncDone">Aceptar</button>
  `);
  document.getElementById('syncDone').onclick=()=>{ closeModal(); openSubjectDetailModal(subjectId); };
  return result;
}

/* Al abrir la app: sincroniza en silencio (sin ventanas ni interrumpir) los deberes de
   todas las clases que tengan un calendario vinculado, en una ventana de fechas cercana
   a hoy (no todo el curso, para que sea rápido). */
async function autoSyncDeberesOnLoad(){
  if(!driveConfigured() || !driveIsConnected()) return;
  const linked = state.subjects.filter(s=>s.calendarId);
  if(linked.length===0) return;
  const from = addDaysISO(todayISO(), -7);
  const to = addDaysISO(todayISO(), 21);
  let totalPushed=0, totalPulled=0, totalDeleted=0;
  for(const subj of linked){
    const r = await syncDeberesBidirectional(subj.id, from, to, {silent:true});
    if(r){ totalPushed+=r.pushed; totalPulled+=r.pulled; totalDeleted+=r.pulledDeletes; }
  }
  if(totalPushed || totalPulled || totalDeleted){
    toast(`Deberes sincronizados con Calendar (${totalPushed} enviados, ${totalPulled} traídos, ${totalDeleted} borrados)`);
  }
}


let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',(e)=>{
  e.preventDefault(); deferredPrompt=e; renderInstallHint();
});
function renderInstallHint(){
  const wrap = document.getElementById('installHintWrap');
  if(!wrap) return;
  if(deferredPrompt && !localStorage.getItem('installHintDismissed') && ui.tab==='calendar'){
    wrap.innerHTML = `<div class="install-hint">📲 <div style="flex:1">Instala esta app en tu pantalla de inicio para usarla como una app normal.</div>
      <button id="btnInstall">Instalar</button></div>`;
    document.getElementById('btnInstall').onclick=async ()=>{
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt=null; wrap.innerHTML='';
    };
  } else {
    wrap.innerHTML='';
  }
}

function renderDriveHint(){
  const wrap = document.getElementById('driveHintWrap');
  if(!wrap) return;
  const show = driveConfigured() && driveIsConnected() && localStorage.getItem('driveNeedsReconnect');
  if(show){
    wrap.innerHTML = `<div class="drive-hint">${ICONS.cloud}
      <div style="flex:1">La sincronización con Drive necesita que vuelvas a iniciar sesión.</div>
      <button id="btnDriveHintSync">Sincronizar</button>
      <button id="btnDriveHintClose" class="dh-x">${ICONS.x}</button>
    </div>`;
    document.getElementById('btnDriveHintSync').onclick=()=>driveSyncUpload({showToast:true, interactive:true});
    document.getElementById('btnDriveHintClose').onclick=()=>{ localStorage.setItem('driveHintDismissedAt', String(Date.now())); wrap.innerHTML=''; };
  } else {
    wrap.innerHTML='';
  }
}

/* ---------- Deslizar para cambiar de semana en Calendario ---------- */
function initSwipeNav(){
  const content = document.getElementById('content');
  if(!content) return;
  let touchStartX = 0, touchStartY = 0, touching = false;
  content.addEventListener('touchstart', (e)=>{
    if(ui.tab!=='calendar' || e.touches.length!==1) { touching=false; return; }
    touching = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, {passive:true});
  content.addEventListener('touchend', (e)=>{
    if(!touching || ui.tab!=='calendar') return;
    touching = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if(Math.abs(dx) < 65 || Math.abs(dx) < Math.abs(dy)*1.3) return; // no es un gesto horizontal claro

    // Si el gesto empieza sobre la rejilla semanal (que puede tener su propio scroll
    // horizontal en pantallas estrechas), solo cambiamos de semana si ya estaba
    // en el extremo hacia el que se desliza, para no interferir con ese scroll.
    const scrollArea = content.querySelector('.grid-scrollarea');
    if(scrollArea && scrollArea.scrollWidth > scrollArea.clientWidth + 4){
      const atStart = scrollArea.scrollLeft <= 2;
      const atEnd = scrollArea.scrollLeft >= scrollArea.scrollWidth - scrollArea.clientWidth - 2;
      if(dx > 0 && !atStart) return;
      if(dx < 0 && !atEnd) return;
    }

    const monday = mondayOfWeekISO(ui.weekAnchor);
    ui.weekAnchor = addDaysISO(monday, dx > 0 ? -7 : 7);
    render();
  }, {passive:true});
}

/* ==================================================================
   INIT
   ================================================================== */
render();
initSwipeNav();
updateNotifBellIcon();
checkReminders();
setInterval(checkReminders, 60000);
setTimeout(()=>{
  driveCheckOnLoad(()=>{
    autoSyncDeberesOnLoad();
    const n = applyDefaultGestion();
    if(n>0){ render(); toast(`Gestión puesta a 2 por defecto en ${n} caso(s) sin nota tras 2 días`); }
  });
}, 1200);
setTimeout(drivePhotosDownloadIfNewer, 1800);

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
