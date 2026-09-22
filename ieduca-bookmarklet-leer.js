/* ==================================================================
   iEduca -> Mi Horario
   Se ejecuta EN la página de iEduca (mediante el marcador guardado en
   el navegador). Lee la asistencia/actitud/material directamente de
   la página, y las observaciones abriendo UNA sola ventana emergente
   que se reutiliza (se le cambia la dirección) para cada alumno, en
   vez de abrir una ventana nueva por cada uno -- así el navegador no
   la bloquea, igual que hace la propia iEduca con su enlace [OBS].
   ================================================================== */
(async function(){

  function escapeHtml(s){
    return (s==null?'':String(s)).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function closeOverlay(){
    const el = document.getElementById('mihorario-ieduca-overlay');
    if(el) el.remove();
  }
  closeOverlay();

  const directory = [];
  document.querySelectorAll('a.nom_al, .nom_al a').forEach(a=>{
    const href = a.getAttribute('href') || '';
    const m = href.match(/[?&]id=(\d+)/);
    if(m) directory.push({ id_per: m[1], name: a.textContent.trim() });
  });
  if(directory.length===0){
    alert('No se ha encontrado ningún alumno en esta página. Asegúrate de estar en la pantalla de pasar lista de iEduca antes de pulsar este marcador.');
    return;
  }

  let fecha = '';
  const anyObsOnclick = document.querySelector('a[onclick*="assistencia_observacions.php"]');
  if(anyObsOnclick){
    const m = (anyObsOnclick.getAttribute('onclick')||'').match(/data=([\d-]+)/);
    if(m) fecha = m[1];
  }

  function findLetterButton(id_per, letter){
    const candidates = document.querySelectorAll('button[onclick*="n_falta("]');
    for(const b of candidates){
      if(b.textContent.trim() !== letter) continue;
      const onclick = b.getAttribute('onclick') || '';
      const m = onclick.match(/n_falta\(\s*this\s*,\s*'[^']*'\s*,\s*-?\d+\s*,\s*(\d+)/);
      if(m && m[1] === String(id_per)) return b;
    }
    return null;
  }
  function findObsLink(id_per){
    const candidates = Array.from(document.querySelectorAll('a[onclick*="assistencia_observacions.php"]'));
    const idRe = new RegExp('id_per=' + id_per + '(&|\')');
    const matches = candidates.filter(a => idRe.test(a.getAttribute('onclick') || ''));
    const withDate = matches.find(a => /[?&]data=/.test(a.getAttribute('onclick') || ''));
    return withDate || matches[0] || null;
  }
  function extractObsText(doc){
    // Esta ventana lista TODAS las observaciones de ese alumno ese día, sean de la
    // materia/profesor que sean -- hay que quedarse solo con las de ESTA hora
    // concreta. El propio formulario de arriba dice la hora de la sesión actual
    // (p.ej. "Hora: 09:00-10:00"), así que comparamos cada observación con esa
    // misma franja horaria, que también aparece en su cabecera ".observacio-bloc-info".
    const h3 = Array.from(doc.querySelectorAll('h3')).find(h=>/hora:/i.test(h.textContent));
    const horaMatch = h3 && h3.textContent.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
    const hora = horaMatch ? horaMatch[1].replace(/\s+/g,'') : null;

    const blocks = Array.from(doc.querySelectorAll('.observacio-bloc'));
    if(blocks.length === 0) return '';
    const relevant = hora
      ? blocks.filter(b=>{
          const info = (b.querySelector('.observacio-bloc-info')?.textContent||'').replace(/\s+/g,'');
          return info.includes(hora);
        })
      : blocks; // si no se pudo leer la hora de referencia, mejor no perder nada
    return relevant.map(b=>(b.querySelector('.observacio-bloc-text')?.textContent||'').trim()).filter(Boolean).join('\n');
  }

  const results = directory.map(d=>{
    const codes = [];
    ['F','R','m','C'].forEach(letter=>{
      const btn = findLetterButton(d.id_per, letter);
      if(btn && btn.hasAttribute('checked')) codes.push(letter);
    });
    return { id_per: d.id_per, name: d.name, codes, obsText: null, obsStatus: 'pendiente' };
  });

  // ---- Ventana de progreso ----
  const overlay = document.createElement('div');
  overlay.id = 'mihorario-ieduca-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:10px;max-width:560px;width:92%;max-height:82vh;overflow:auto;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.3);';
  box.innerHTML = `
    <h2 style="margin:0 0 4px;font-size:18px;">Leyendo de iEduca ${fecha?'— '+escapeHtml(fecha):''}</h2>
    <p id="mihorario-ieduca-progress" style="font-size:13px;color:#555;margin:0 0 14px;">Leyendo asistencia...</p>
    <div id="mihorario-ieduca-list"></div>
    <div style="margin-top:16px;display:flex;gap:10px;">
      <button id="mihorario-ieduca-copy" style="flex:1;padding:11px;border:none;border-radius:8px;background:#2a6f4b;color:#fff;font-weight:700;cursor:pointer;" disabled>Copiar</button>
      <button id="mihorario-ieduca-cancel" style="padding:11px 16px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;">Cerrar</button>
    </div>
    <div id="mihorario-ieduca-result" style="margin-top:14px;font-size:13px;"></div>
  `;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  const listEl = document.getElementById('mihorario-ieduca-list');
  const progressEl = document.getElementById('mihorario-ieduca-progress');
  const copyBtn = document.getElementById('mihorario-ieduca-copy');

  function renderList(){
    listEl.innerHTML = results.map(r=>{
      const codesTxt = r.codes.length ? r.codes.join(', ') : '(nada marcado)';
      let obsLine;
      if(r.obsText) obsLine = `📝 "${escapeHtml(r.obsText.length>100?r.obsText.slice(0,100)+'…':r.obsText)}"`;
      else if(r.obsStatus==='ok') obsLine = '<span style="color:#888;">sin observaciones</span>';
      else if(r.obsStatus==='pendiente') obsLine = '<span style="color:#aaa;">leyendo…</span>';
      else obsLine = `<span style="color:#c0392b;">obs: ${escapeHtml(r.obsStatus)}</span>`;
      return `<div style="padding:6px 0;border-bottom:1px solid #eee;font-size:12.5px;">
        <b>${escapeHtml(r.name)}</b> — ${escapeHtml(codesTxt)}<br>${obsLine}
      </div>`;
    }).join('');
  }
  renderList();

  document.getElementById('mihorario-ieduca-cancel').onclick = closeOverlay;
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeOverlay(); });

  // Abrimos UNA ventana, con el MISMO nombre fijo que usa la propia iEduca ('obs'),
  // y para cada alumno la reutilizamos cambiándole la dirección (en vez de abrir una
  // ventana nueva cada vez) -- así el navegador no la trata como "ventanas
  // emergentes no pedidas" y no la bloquea.
  const first = results.find(r=>findObsLink(r.id_per));
  let sharedWin = null;
  if(first){
    const link = findObsLink(first.id_per);
    const m0 = link.getAttribute('onclick').match(/wopen\('([^']+)'/);
    sharedWin = window.open(m0[1], 'obs', 'width=480,height=420');
  }

  function waitLoaded(win, prevDoc){
    return new Promise((resolve)=>{
      const start = Date.now();
      const tryCheck = ()=>{
        let doc;
        try{ doc = win.document; }catch(e){ doc = null; }
        // Ojo: al cambiar location.href para reutilizar la ventana, la página ANTERIOR
        // sigue ahí un instante hasta que arranca la nueva. Si no comprobamos que es un
        // documento DISTINTO al de antes, podríamos leer por error el contenido del
        // alumno anterior en vez de esperar a que cargue el nuevo.
        if(doc && doc !== prevDoc && doc.readyState === 'complete' && doc.body && doc.body.innerHTML.length > 50){
          resolve(doc);
        } else if(Date.now() - start > 8000){
          resolve(doc && doc !== prevDoc ? doc : null);
        } else {
          setTimeout(tryCheck, 150);
        }
      };
      tryCheck();
    });
  }

  if(!sharedWin){
    results.forEach(r=>{ r.obsStatus = 'bloqueada'; });
  } else {
    let lastDoc = null;
    for(let i=0; i<results.length; i++){
      const r = results[i];
      progressEl.textContent = `Leyendo observaciones... (${i+1}/${results.length}) ${r.name}`;
      const link = findObsLink(r.id_per);
      const m = link && link.getAttribute('onclick').match(/wopen\('([^']+)'/);
      if(!m){ r.obsStatus = 'sin enlace'; renderList(); continue; }
      if(i>0){ try{ lastDoc = sharedWin.document; }catch(e){ lastDoc = null; } sharedWin.location.href = m[1]; }
      const doc = await waitLoaded(sharedWin, lastDoc);
      if(doc){ r.obsText = extractObsText(doc) || null; r.obsStatus = 'ok'; lastDoc = doc; }
      else r.obsStatus = 'tiempo agotado';
      renderList();
    }
    try{ sharedWin.close(); }catch(e){}
  }

  progressEl.textContent = 'Lectura completa.';
  copyBtn.disabled = false;

  copyBtn.onclick = async ()=>{
    const payload = { app:'MiHorario', mode:'import', date: fecha, students: [] };
    results.forEach(r=>{
      if(r.codes.length || r.obsText) payload.students.push({ name:r.name, codes:r.codes, obsText:r.obsText||undefined });
    });
    try{
      await navigator.clipboard.writeText(JSON.stringify(payload));
      document.getElementById('mihorario-ieduca-result').textContent = `Copiado (${payload.students.length} alumno(s) con algo que traer). Ve a Mi Horario y pulsa "Pegar desde iEduca".`;
    }catch(e){
      document.getElementById('mihorario-ieduca-result').textContent = 'No se pudo copiar automáticamente.';
    }
  };

})();
