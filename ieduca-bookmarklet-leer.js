/* ==================================================================
   iEduca -> Mi Horario
   Se ejecuta EN la página de iEduca (mediante el marcador guardado en
   el navegador). Lee, para cada alumno de esta pantalla de pasar
   lista, si tiene marcado F, R, m o C, y también intenta leer sus
   observaciones de este día (abriendo su ventana emergente). Al
   terminar, muestra un resumen y copia el resultado al portapapeles
   para pegarlo en Mi Horario con "Pegar desde iEduca".
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

  // Directorio de alumnos de esta página: id_per -> nombre
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

  // Fecha/asignatura para el encabezado del resumen (best effort, a partir del título de la página o de un enlace de observaciones)
  let fecha = '', asignatura = document.title || '';
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

  // 1) Leer asistencia/actitud/material: es directo, está ya en la página.
  const results = directory.map(d=>{
    const codes = [];
    ['F','R','m','C'].forEach(letter=>{
      const btn = findLetterButton(d.id_per, letter);
      if(btn && btn.hasAttribute('checked')) codes.push(letter);
    });
    return { id_per: d.id_per, name: d.name, codes, obsText: null, obsStatus: 'pendiente' };
  });

  // 2) Leer observaciones: hay que abrir una ventana por alumno. Se abren TODAS
  // ahora mismo, dentro de este mismo clic (para que el navegador no las bloquee),
  // y luego se leen y cierran una a una según van cargando.
  const toRead = [];
  results.forEach(r=>{
    const link = findObsLink(r.id_per);
    const m = link && link.getAttribute('onclick').match(/wopen\('([^']+)'/);
    if(m){
      const win = window.open(m[1], 'mihorario_leer_'+r.id_per, 'width=480,height=400');
      if(win) toRead.push({ r, win });
      else r.obsStatus = 'bloqueada';
    } else {
      r.obsStatus = 'sin-enlace';
    }
  });

  function extractObsText(doc){
    // La ventana muestra "No hi ha observacions" cuando no hay ninguna; si hay,
    // se listan debajo del título "Observacions". Cogemos ese bloque y quitamos
    // el aviso de "no hay" si aparece.
    const marker = Array.from(doc.querySelectorAll('h3')).find(h=>/observacions/i.test(h.textContent));
    if(!marker) return '';
    let node = marker.nextElementSibling;
    let text = '';
    while(node){
      const t = (node.textContent||'').trim();
      if(t && !/no hi ha observacions/i.test(t)) text += (text?'\n':'') + t;
      node = node.nextElementSibling;
    }
    return text.trim();
  }

  async function readAndClose(item){
    return new Promise((resolve)=>{
      const start = Date.now();
      const tryRead = ()=>{
        let doc;
        try{ doc = item.win.document; }catch(e){ doc = null; }
        if(doc && doc.readyState === 'complete' && doc.body && doc.body.innerHTML.length > 50){
          item.r.obsText = extractObsText(doc) || null;
          item.r.obsStatus = 'ok';
          try{ item.win.close(); }catch(e){}
          resolve();
        } else if(Date.now() - start > 8000){
          item.r.obsStatus = 'tiempo-agotado';
          resolve();
        } else {
          setTimeout(tryRead, 200);
        }
      };
      tryRead();
    });
  }

  for(const item of toRead){
    await readAndClose(item);
  }

  // ---- Resumen y copia al portapapeles ----
  const payload = { app:'MiHorario', mode:'import', date: fecha, subject: asignatura, students: [] };
  results.forEach(r=>{
    if(r.codes.length || r.obsText) payload.students.push({ name:r.name, codes:r.codes, obsText:r.obsText||undefined });
  });

  const overlay = document.createElement('div');
  overlay.id = 'mihorario-ieduca-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:10px;max-width:560px;width:92%;max-height:82vh;overflow:auto;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.3);';
  const rowsHtml = results.map(r=>{
    const codesTxt = r.codes.length ? r.codes.join(', ') : '(nada marcado)';
    const obsTxt = r.obsText ? `📝 "${escapeHtml(r.obsText.length>100?r.obsText.slice(0,100)+'…':r.obsText)}"` :
      (r.obsStatus==='ok' ? '' : `<span style="color:#c0392b;">obs: ${escapeHtml(r.obsStatus)}</span>`);
    return `<div style="padding:7px 0;border-bottom:1px solid #eee;font-size:13px;">
      <b>${escapeHtml(r.name)}</b> — ${escapeHtml(codesTxt)}${obsTxt?'<br>'+obsTxt:''}
    </div>`;
  }).join('');
  box.innerHTML = `
    <h2 style="margin:0 0 4px;font-size:18px;">Leído de iEduca ${fecha?'— '+escapeHtml(fecha):''}</h2>
    <p style="font-size:13px;color:#555;margin:0 0 14px;">Revisa el resultado. Al pulsar "Copiar", podrás pegarlo en Mi Horario con "Pegar desde iEduca".</p>
    <div>${rowsHtml}</div>
    <div style="margin-top:16px;display:flex;gap:10px;">
      <button id="mihorario-ieduca-copy" style="flex:1;padding:11px;border:none;border-radius:8px;background:#2a6f4b;color:#fff;font-weight:700;cursor:pointer;">Copiar</button>
      <button id="mihorario-ieduca-cancel" style="padding:11px 16px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;">Cerrar</button>
    </div>
    <div id="mihorario-ieduca-result" style="margin-top:14px;font-size:13px;"></div>
  `;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  document.getElementById('mihorario-ieduca-cancel').onclick = closeOverlay;
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeOverlay(); });
  document.getElementById('mihorario-ieduca-copy').onclick = async ()=>{
    try{
      await navigator.clipboard.writeText(JSON.stringify(payload));
      document.getElementById('mihorario-ieduca-result').textContent = 'Copiado. Ve a Mi Horario y pulsa "Pegar desde iEduca".';
    }catch(e){
      document.getElementById('mihorario-ieduca-result').textContent = 'No se pudo copiar automáticamente.';
    }
  };

})();
