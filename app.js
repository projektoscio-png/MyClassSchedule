/* ===================== Mi Horario — lógica de la app ===================== */
/* Todos los datos se guardan solo en este dispositivo (localStorage). */

const STORAGE_KEY = 'miHorario_data_v1';
/* Rellena esto con tu Client ID de Google Cloud (termina en .apps.googleusercontent.com) */
const GOOGLE_CLIENT_ID = '292792599906-9m3t841hk507s1k042193tjuigoe1svb.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_FILE_NAME = 'mi-horario-sync.json';
const DOW = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const DOW_SHORT = ['L','M','X','J','V','S','D'];
const SUBJECT_COLORS = ['#457B9D','#E76F51','#2A9D8F','#E9C46A','#7B6D8E','#D65A5A','#6A8D73','#9C6644','#3A86FF','#B5838D'];

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
let ui = { tab:'calendar', viewMode:'week', day: mondayIndex(new Date()), weekAnchor: todayISO(), subjectFilter:null };

function defaultState(){
  return { subjects:[], classes:[], items:[], holidays:[], settings:{ notified:[], weekMode:'full', lastModified:0 } };
}
function migrateState(st){
  // Compatibilidad con copias antiguas: una clase por día (campo "day") -> varios días en un mismo registro ("days")
  (st.classes||[]).forEach(c=>{
    if(!Array.isArray(c.days)){
      c.days = (typeof c.day==='number') ? [c.day] : [0];
    }
  });
  st.settings = Object.assign({ notified:[], weekMode:'full', lastModified:0 }, st.settings||{});
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
    const hasObs = state.items.some(i=>i.type==='task' && i.subjectId===c.subjectId && i.date===dateIso);
    return `<div class="card class-card" data-open-class="${c.id}" data-date="${dateIso}">
      <div class="class-bar" style="background:${color}"></div>
      <div class="class-body">
        <div class="class-time">${c.start}<small>${c.end}</small></div>
        <div class="class-info">
          <div class="class-name">${escapeHtml(subj?subj.name:'(sin nombre)')} ${hasObs?'📝':''}</div>
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
      const hasObs = state.items.some(it=>it.type==='task' && it.subjectId===c.subjectId && it.date===dateIso);
      return `<div class="grid-block" data-open-class="${c.id}" data-date="${dateIso}" style="top:${top}px;height:${height}px;background:${color}26;border-left:3px solid ${color};">
        ${hasObs?'<div class="grid-block-obs">📝</div>':''}
        <div class="grid-block-name">${escapeHtml(subj?subj.name:'')}</div>
        ${height>34 && c.room ? `<div class="grid-block-room">${escapeHtml(c.room)}</div>` : ''}
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
    return `<div class="card subject-row" data-open-subject="${s.id}">
      <span class="subject-dot" style="background:${s.color}"></span>
      <div class="subject-row-main">
        <div class="subject-row-name">${escapeHtml(s.name)}</div>
        <div class="subject-row-sub">${escapeHtml(subtitle)}</div>
      </div>
      <span class="subject-row-count">${slots.length}</span>
      ${ICONS.chevR}
    </div>`;
  }).join('');
}

function openNewSubjectModal(){
  const nextColor = SUBJECT_COLORS[state.subjects.length % SUBJECT_COLORS.length];
  openModal(`
    <div class="modal-head"><div class="modal-title">Nueva clase</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div class="field"><label>Nombre</label><input type="text" id="fSubjName" placeholder="Ej. Matemáticas 2n ESO"></div>
    <div class="field">
      <label>Color</label>
      <div class="color-grid" id="fSubjColor">${SUBJECT_COLORS.map(c=>`<div class="color-dot ${c===nextColor?'active':''}" data-c="${c}" style="background:${c}"></div>`).join('')}</div>
    </div>
    <button class="btn btn-primary" id="fSubjSave">${ICONS.pencil} Crear clase</button>
  `);
  let selColor = nextColor;
  document.querySelectorAll('#fSubjColor .color-dot').forEach(b=>b.onclick=()=>{ selColor=b.dataset.c; document.querySelectorAll('#fSubjColor .color-dot').forEach(x=>x.classList.toggle('active',x===b)); });
  document.getElementById('fSubjSave').onclick=()=>{
    const name = document.getElementById('fSubjName').value.trim();
    if(!name){ toast('Escribe un nombre'); return; }
    const subject = getOrCreateSubject(name);
    subject.color = selColor;
    saveState(); closeModal(); toast('Clase creada');
    openSubjectDetailModal(subject.id);
  };
}

function openSubjectDetailModal(subjectId){
  const subj = getSubject(subjectId);
  if(!subj){ return; }
  const slots = state.classes.filter(c=>c.subjectId===subjectId).sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));

  openModal(`
    <div class="modal-head">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="subject-dot" style="background:${subj.color};width:16px;height:16px;"></span>
        <div class="modal-title">${escapeHtml(subj.name)}</div>
      </div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button>
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
    <button class="btn btn-ghost" id="btnViewSubjTasks2">${ICONS.clipboard} Ver tareas de esta clase</button>
    <button class="btn btn-danger" id="btnDeleteSubject" style="margin-top:8px;">${ICONS.trash} Eliminar esta clase</button>
  `);

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
      state.subjects = state.subjects.filter(s=>s.id!==subjectId);
      saveState(); closeModal(); render(); toast('Clase eliminada');
    };
  };
}

/* ==================================================================
   EXÁMENES Y TAREAS
   ================================================================== */
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
   ================================================================== */
function renderDriveDebugPanel(){
  let dbg = null;
  try{ dbg = JSON.parse(localStorage.getItem('driveDebug')||'null'); }catch(e){}
  const fmt = ts => ts ? new Date(ts).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '—';
  const actionLabel = {
    'subido':'Se subieron los cambios de este dispositivo a Drive',
    'creado':'Se creó el archivo en Drive por primera vez',
    'ofrecida-actualizacion':'Drive tenía algo más nuevo (banner mostrado)',
    'ya-igualado':'Ya estaban igualados, nada que hacer',
    'sin-archivo-remoto':'Todavía no existe ningún archivo en Drive',
  };
  if(!dbg){
    return `<div style="padding:12px 14px; font-size:11.5px; color:var(--ink-faint);">Sin datos de diagnóstico todavía. Pulsa "Sincronizar" una vez.</div>`;
  }
  return `<div style="padding:10px 14px 14px; font-size:11.5px; color:var(--ink-soft); line-height:1.7; border-top:1px solid var(--line);">
    <div style="font-weight:700; color:var(--ink); margin:8px 0 4px;">Diagnóstico (última comprobación: ${fmt(dbg.at)})</div>
    ${dbg.error ? `<div style="color:var(--danger)">Error: ${escapeHtml(dbg.error)}</div>` :
      `<div>Archivo en Drive: <b>${dbg.fileExists?'sí existe':'no existe'}</b></div>
       <div>Última modificación local: <b>${fmt(dbg.localModified)}</b></div>
       <div>Última modificación en Drive: <b>${fmt(dbg.remoteModified)}</b></div>
       <div>Resultado: <b>${actionLabel[dbg.action]||dbg.action||'—'}</b></div>`
    }
  </div>`;
}

function renderSettings(){
  const notifState = ('Notification' in window) ? Notification.permission : 'unsupported';
  const notifLabel = notifState==='granted' ? 'Activadas' : notifState==='denied' ? 'Bloqueadas' : 'Activar';
  const weekMode = state.settings.weekMode || 'full';
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
    ${driveIsConnected() ? renderDriveDebugPanel() : ''}
  </div>
  <div class="card">
    <div class="settings-item">
      <div class="settings-icon">${ICONS.bell}</div>
      <div class="settings-text">
        <div class="settings-title">Notificaciones</div>
        <div class="settings-desc">Avisos de exámenes y tareas próximas mientras la app está abierta</div>
      </div>
      <button class="settings-action" id="btnNotif">${notifLabel}</button>
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
      <input type="file" id="fileImport" accept=".json,.sqlite,.db,.sqlite3,*/*" style="display:none">
    </div>
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
  const content = document.getElementById('content');
  if(ui.tab==='calendar') content.innerHTML = renderSchedule();
  else if(ui.tab==='subjects') content.innerHTML = renderSubjectsList();
  else if(ui.tab==='tasks') content.innerHTML = renderItemsList('task');
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
  document.querySelectorAll('[data-open-item]').forEach(el=>{
    el.onclick=()=>openItemModal(el.dataset.openItem);
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
  const btnExport = document.getElementById('btnExport');
  if(btnExport) btnExport.onclick = exportData;
  const btnImport = document.getElementById('btnImport');
  if(btnImport) btnImport.onclick = ()=>document.getElementById('fileImport').click();
  const fileImport = document.getElementById('fileImport');
  if(fileImport) fileImport.onchange = importData;
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
  if(btnDriveSyncNow) btnDriveSyncNow.onclick = ()=>driveSyncUpload({showToast:true, interactive:true});
}

document.getElementById('fabBtn').onclick = ()=>{
  if(ui.tab==='calendar') openClassModal(null);
  else if(ui.tab==='subjects') openNewSubjectModal();
  else if(ui.tab==='tasks') openItemModal(null, {type:'task', subjectId:ui.subjectFilter});
  else if(ui.tab==='exams') openItemModal(null, {type:'exam', subjectId:ui.subjectFilter});
  else if(ui.tab==='holidays') openHolidayModal(null);
};

/* ==================================================================
   MODAL helpers
   ================================================================== */
const overlay = document.getElementById('modalOverlay');
const sheet = document.getElementById('modalSheet');
function openModal(html){ sheet.innerHTML = `<div class="modal-handle"></div>${html}`; overlay.classList.add('open'); }
function closeModal(){ overlay.classList.remove('open'); }
overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeModal(); });

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* ---------- Class occurrence (día concreto): observaciones + acceso a editar horario ---------- */
function openClassOccurrenceModal(classId, dateIso){
  const cls = state.classes.find(c=>c.id===classId);
  if(!cls){ return; }
  dateIso = dateIso || todayISO();
  const subj = getSubject(cls.subjectId);
  const obsList = state.items
    .filter(i=>i.type==='task' && i.subjectId===cls.subjectId && i.date===dateIso)
    .sort((a,b)=>(a.createdOrder||0)-(b.createdOrder||0));
  const dateLabel = dateIso ? capitalize(parseISO(dateIso).toLocaleDateString('es-ES',{weekday:'long', day:'numeric', month:'long', year:'numeric'})) : '';

  openModal(`
    <div class="modal-head">
      <div>
        <div class="modal-title">${escapeHtml(subj?subj.name:'Clase')}</div>
        <div style="font-size:12.5px;color:var(--ink-soft);margin-top:2px;">${dateLabel} · ${cls.start}–${cls.end}${cls.room?' · '+escapeHtml(cls.room):''}</div>
      </div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button>
    </div>
    <div class="field">
      <label>Observaciones de este día</label>
      ${obsList.length ? obsList.map(o=>`
        <div class="card" style="padding:11px 13px;margin-bottom:8px;">
          <div style="font-size:13.5px;white-space:pre-wrap;line-height:1.4;">${escapeHtml(o.notes||o.title)}</div>
          <div style="display:flex;gap:14px;margin-top:8px;">
            <button class="settings-action" data-edit-obs="${o.id}" style="font-size:12px;">${ICONS.pencil} Editar</button>
            <button class="settings-action" data-delete-obs="${o.id}" style="font-size:12px;color:var(--danger);">${ICONS.trash} Eliminar</button>
          </div>
        </div>
      `).join('') : `<div style="font-size:13px;color:var(--ink-faint);margin-bottom:10px;">Todavía no hay ninguna observación para este día.</div>`}
    </div>
    <button class="btn btn-ghost" id="btnAddObs">${ICONS.pencil} Añadir observación de este día</button>
    <div style="height:1px;background:var(--line);margin:16px 0;"></div>
    <button class="btn btn-ghost" id="btnEditClassDef">${ICONS.calSmall} Editar horario de esta clase</button>
    <button class="btn btn-ghost" id="btnViewSubjectTasks" style="margin-top:8px;">${ICONS.clipboard} Ver tareas de ${escapeHtml(subj?subj.name:'esta asignatura')}</button>
  `);

  document.getElementById('btnAddObs').onclick=()=>openObservationModal(null, cls.subjectId, dateIso, classId);
  document.querySelectorAll('[data-edit-obs]').forEach(b=>{
    b.onclick=()=>openObservationModal(b.dataset.editObs, cls.subjectId, dateIso, classId);
  });
  document.querySelectorAll('[data-delete-obs]').forEach(b=>{
    b.onclick=()=>{
      state.items = state.items.filter(i=>i.id!==b.dataset.deleteObs);
      saveState(); toast('Observación eliminada'); render();
      openClassOccurrenceModal(classId, dateIso);
    };
  });
  document.getElementById('btnEditClassDef').onclick=()=>{ closeModal(); openClassModal(classId); };
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
      <textarea id="fObsText" placeholder="Ej. Se explicó el tema 4, deberes pág. 32, ejercicios 1-5..." style="min-height:150px;">${existing?escapeHtml(existing.notes||existing.title||''):''}</textarea>
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
      state.items.push({ id:uid(), type:'task', title, date:dateIso, time:'', notes:text, remindDays:0, subjectId, notified:true });
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
function capitalize(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }

/* ---------- Class modal ---------- */
function openClassModal(id, opts){
  opts = opts || {};
  const existing = id ? state.classes.find(c=>c.id===id) : null;
  const lockSubjectId = opts.presetSubjectId || null;
  const lockedSubject = lockSubjectId ? getSubject(lockSubjectId) : null;
  const subj = existing ? getSubject(existing.subjectId) : lockedSubject;
  const chosenColor = existing ? (subj?subj.color:SUBJECT_COLORS[0]) : (lockedSubject?lockedSubject.color:SUBJECT_COLORS[state.subjects.length % SUBJECT_COLORS.length]);
  const initialDays = existing ? existing.days.slice() : [ui.day];

  openModal(`
    <div class="modal-head"><div class="modal-title">${existing?'Editar tramo horario':'Nuevo tramo horario'}</div>
      <button class="icon-btn" style="background:var(--bg);color:var(--ink-soft)" onclick="closeModal()">${ICONS.x}</button></div>
    <div class="field">
      <label>Asignatura</label>
      ${lockSubjectId
        ? `<div style="display:flex;align-items:center;gap:8px;padding:11px 13px;border-radius:12px;background:var(--bg);border:1.5px solid var(--line);font-weight:700;font-size:14.5px;">
             <span style="width:12px;height:12px;border-radius:50%;background:${lockedSubject?lockedSubject.color:'#999'};flex-shrink:0;"></span>
             ${escapeHtml(lockedSubject?lockedSubject.name:'')}
           </div>`
        : `<input type="text" id="fSubject" list="subjectList" placeholder="Ej. Matemáticas" value="${existing?escapeHtml(subj?subj.name:''):''}">
           <datalist id="subjectList">${state.subjects.map(s=>`<option value="${escapeHtml(s.name)}">`).join('')}</datalist>`
      }
    </div>
    <div class="field">
      <label>Días</label>
      <div class="daypick" id="fDay">${DOW_SHORT.map((d,i)=>`<button type="button" data-d="${i}" class="${initialDays.includes(i)?'active':''}">${d}</button>`).join('')}</div>
      <div style="font-size:11.5px;color:var(--ink-faint);margin-top:6px;">Puedes marcar varios días si la clase es a la misma hora, por ejemplo Lunes y Miércoles.</div>
    </div>
    <div class="row2">
      <div class="field"><label>Hora inicio</label><input type="time" id="fStart" value="${existing?existing.start:'08:00'}"></div>
      <div class="field"><label>Hora fin</label><input type="time" id="fEnd" value="${existing?existing.end:'09:00'}"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Aula</label><input type="text" id="fRoom" placeholder="Ej. A-204" value="${existing?escapeHtml(existing.room||''):''}"></div>
      <div class="field"><label>Profesor/a</label><input type="text" id="fTeacher" placeholder="Opcional" value="${existing?escapeHtml(existing.teacher||''):''}"></div>
    </div>
    <div class="field">
      <label>Periodo del curso (opcional)</label>
      <div class="row2" style="margin-top:0">
        <div class="field" style="margin-bottom:0"><input type="date" id="fDateStart" value="${existing?(existing.dateStart||''):''}"></div>
        <div class="field" style="margin-bottom:0"><input type="date" id="fDateEnd" value="${existing?(existing.dateEnd||''):''}"></div>
      </div>
      <div style="font-size:11.5px;color:var(--ink-faint);margin-top:6px;">Déjalo en blanco si la clase es durante todo el curso. Rellénalo si solo se da, por ejemplo, en un trimestre concreto.</div>
    </div>
    <div class="field">
      <label>Color de la asignatura</label>
      <div class="color-grid" id="fColor">${SUBJECT_COLORS.map(c=>`<div class="color-dot ${c===chosenColor?'active':''}" data-c="${c}" style="background:${c}"></div>`).join('')}</div>
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
        if(selDays.length===1){ toast('Debe quedar marcado al menos un día'); return; }
        selDays = selDays.filter(x=>x!==d);
      } else {
        selDays.push(d);
      }
      b.classList.toggle('active');
    };
  });
  document.querySelectorAll('#fColor .color-dot').forEach(b=>b.onclick=()=>{ selColor=b.dataset.c; document.querySelectorAll('#fColor .color-dot').forEach(x=>x.classList.toggle('active',x===b)); });

  const fStartEl = document.getElementById('fStart'), fEndEl = document.getElementById('fEnd');
  fEndEl.addEventListener('input', ()=>{ endManuallyEdited = true; });
  fStartEl.addEventListener('input', ()=>{
    if(endManuallyEdited) return;
    const s = timeToMin(fStartEl.value || '08:00');
    fEndEl.value = minTimeToStr(s + 60);
  });

  const fDateStartEl = document.getElementById('fDateStart'), fDateEndEl = document.getElementById('fDateEnd');
  fDateEndEl.addEventListener('input', ()=>{ dateEndManuallyEdited = true; });
  fDateStartEl.addEventListener('input', ()=>{
    if(dateEndManuallyEdited) return;
    if(fDateStartEl.value){ fDateEndEl.value = defaultCourseEndDate(fDateStartEl.value); }
  });

  document.getElementById('fSave').onclick=()=>{
    let subject;
    if(lockSubjectId){
      subject = getSubject(lockSubjectId);
      if(!subject){ toast('No se encontró la asignatura'); return; }
    } else {
      const name = document.getElementById('fSubject').value.trim();
      if(!name){ toast('Escribe el nombre de la asignatura'); return; }
      subject = getOrCreateSubject(name);
    }
    if(selDays.length===0){ toast('Selecciona al menos un día'); return; }
    const start = document.getElementById('fStart').value || '08:00';
    const end = document.getElementById('fEnd').value || '09:00';
    const room = document.getElementById('fRoom').value.trim();
    const teacher = document.getElementById('fTeacher').value.trim();
    let dateStart = document.getElementById('fDateStart').value || '';
    let dateEnd = document.getElementById('fDateEnd').value || '';
    if(dateStart && dateEnd && dateEnd < dateStart){ const t=dateStart; dateStart=dateEnd; dateEnd=t; }
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
      <div class="field"><label>Fecha</label><input type="date" id="fDate" value="${existing?existing.date:todayISO()}"></div>
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
    if(existing){
      Object.assign(existing, {type, title, date, time, notes, remindDays, subjectId: subject?subject.id:null});
    } else {
      state.items.push({ id:uid(), type, title, date, time, notes, remindDays, subjectId: subject?subject.id:null, notified:false });
    }
    saveState(); closeModal(); render(); toast('Guardado');
  };
  if(existing){
    document.getElementById('fDelete').onclick=()=>{
      state.items = state.items.filter(i=>i.id!==existing.id);
      saveState(); closeModal(); render(); toast('Eliminado');
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

function confirmImportPreview(parsed, sourceLabel){
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
    saveState(); closeModal(); render(); toast('Datos importados');
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
    render();
    if(p==='granted') toast('Notificaciones activadas'); 
  });
}
function checkReminders(){
  if(!('Notification' in window) || Notification.permission!=='granted') return;
  const today = todayISO();
  state.items.forEach(i=>{
    const diff = daysBetween(today,i.date);
    if(diff>=0 && diff<=(i.remindDays??2) && !i.notified){
      try{
        new Notification(i.type==='exam' ? '📕 Examen próximo':'📝 Tarea próxima', {
          body: `${i.title} — ${fmtDateHuman(i.date)}`,
        });
      }catch(e){}
      i.notified = true;
    }
  });
  saveState();
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

async function driveFindFile(token){
  const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and trashed=false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,modifiedTime)`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if(!res.ok) throw new Error('No se pudo consultar Google Drive');
  const data = await res.json();
  return (data.files && data.files[0]) || null;
}

async function driveDownload(token, fileId){
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if(!res.ok) throw new Error('No se pudo descargar la copia de Drive');
  return res.json();
}

async function driveUpload(token, fileId, payload){
  const body = JSON.stringify(payload);
  if(fileId){
    const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method:'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' },
      body
    });
    if(!res.ok) throw new Error('No se pudo actualizar la copia en Drive');
    return res.json();
  } else {
    const metadata = { name: DRIVE_FILE_NAME, mimeType:'application/json' };
    const boundary = 'mihorario' + uid();
    const multipartBody =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method:'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: multipartBody
    });
    if(!res.ok) throw new Error('No se pudo crear la copia en Drive');
    return res.json();
  }
}

/* Sube los datos locales a Drive si son más nuevos que los remotos (o no hay copia aún). */
function driveSaveDebug(info){
  try{ localStorage.setItem('driveDebug', JSON.stringify(Object.assign({at:Date.now()}, info))); }catch(e){}
}

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
      driveSaveDebug({ fileExists:true, fileId:remote.id, remoteModified, localModified: state.settings.lastModified||0, action:null });
      if(remoteModified > (state.settings.lastModified||0)){
        // Hay una versión más reciente en Drive: avisar en vez de sobreescribirla
        driveSaveDebug({ fileExists:true, fileId:remote.id, remoteModified, localModified: state.settings.lastModified||0, action:'ofrecida-actualizacion' });
        driveOfferRemoteUpdate(remoteData);
        return;
      }
      await driveUpload(token, remote.id, state);
      driveSaveDebug({ fileExists:true, fileId:remote.id, remoteModified, localModified: state.settings.lastModified||0, action:'subido' });
    } else {
      await driveUpload(token, null, state);
      driveSaveDebug({ fileExists:false, remoteModified:0, localModified: state.settings.lastModified||0, action:'creado' });
    }
    localStorage.setItem('driveLastSync', String(Date.now()));
    if(showToast) toast('Sincronizado con Google Drive');
  }catch(e){
    if(!interactive){ localStorage.setItem('driveNeedsReconnect','1'); }
    driveSaveDebug({ error: e.message });
    if(showToast) toast('No se pudo sincronizar: '+e.message);
    if(document.getElementById('content') && ui.tab==='settings') render();
  } finally {
    driveSyncing = false;
  }
}

function scheduleDriveUpload(){
  if(!driveConfigured() || !driveIsConnected()) return;
  clearTimeout(driveUploadTimer);
  driveUploadTimer = setTimeout(()=>driveSyncUpload({showToast:false, interactive:false}), 2500);
}

function driveOfferRemoteUpdate(remoteData){
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
    confirmImportPreview(remoteData, 'la copia de Google Drive');
  };
  document.getElementById('driveUpdateDismiss').onclick = ()=> t.remove();
}

/* Comprueba Drive al abrir la app (silencioso: no pide inicio de sesión si no hace falta). */
async function driveCheckOnLoad(){
  if(!driveConfigured() || !driveIsConnected()) return;
  try{
    const token = await driveGetToken(true);
    localStorage.removeItem('driveNeedsReconnect');
    const remote = await driveFindFile(token);
    if(!remote){
      driveSaveDebug({ fileExists:false, remoteModified:0, localModified: state.settings.lastModified||0, action:'sin-archivo-remoto' });
      return;
    }
    const remoteData = await driveDownload(token, remote.id);
    const remoteModified = (remoteData.settings && remoteData.settings.lastModified) || 0;
    if(remoteModified > (state.settings.lastModified||0)){
      driveSaveDebug({ fileExists:true, fileId:remote.id, remoteModified, localModified: state.settings.lastModified||0, action:'ofrecida-actualizacion' });
      driveOfferRemoteUpdate(remoteData);
    } else if((state.settings.lastModified||0) > remoteModified){
      await driveUpload(token, remote.id, state);
      localStorage.setItem('driveLastSync', String(Date.now()));
      driveSaveDebug({ fileExists:true, fileId:remote.id, remoteModified, localModified: state.settings.lastModified||0, action:'subido' });
    } else {
      driveSaveDebug({ fileExists:true, fileId:remote.id, remoteModified, localModified: state.settings.lastModified||0, action:'ya-igualado' });
    }
  }catch(e){
    // La sesión de Google probablemente ha caducado en este dispositivo: lo marcamos
    // para que Ajustes lo muestre, pero no interrumpimos al usuario con un aviso.
    localStorage.setItem('driveNeedsReconnect','1');
    driveSaveDebug({ error: e.message });
  }
}

async function driveConnect(){
  if(!driveConfigured()){ toast('Todavía no se ha configurado el Client ID de Google'); return; }
  try{
    await driveGetToken(false);
    localStorage.removeItem('driveNeedsReconnect');
    toast('Conectado con Google Drive');
    await driveSyncUpload({showToast:false, interactive:true});
    render();
  }catch(e){
    toast('No se pudo conectar: '+e.message);
  }
}
function driveDisconnect(){
  localStorage.removeItem('driveConnected');
  localStorage.removeItem('driveLastSync');
  localStorage.removeItem('driveNeedsReconnect');
  driveAccessToken = null;
  toast('Desconectado de Google Drive');
  render();
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

/* ==================================================================
   INIT
   ================================================================== */
render();
checkReminders();
setInterval(checkReminders, 60000);
setTimeout(driveCheckOnLoad, 1200);

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
