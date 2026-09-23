/* ==================================================================
   iEduca -> Mi Horario: estado de pago del dossier
   Se ejecuta EN la página de iEduca donde se ve la lista de "Pagaments"
   (todos los alumnos de todos los cursos, con Pagat/Pendent/Rebutjat).
   Esa lista va por páginas (normalmente 20 alumnos por página), así que
   este marcador recorre TODAS las páginas automáticamente (usando fetch,
   sin recargar la pantalla) antes de mostrar el resumen completo.
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

  function extractStudentsFromDoc(doc){
    const rows = Array.from(doc.querySelectorAll('table.taula tbody tr')).filter(tr=>tr.querySelector('.nom-alumne'));
    return rows.map(tr=>{
      const name = (tr.querySelector('.nom-alumne')?.textContent||'').trim();
      const tds = tr.querySelectorAll('td');
      const group = tds.length>2 ? (tds[2].textContent||'').trim() : '';
      const pagamentSpan = tr.querySelector('.pagament');
      let status = null;
      if(pagamentSpan){
        const b = pagamentSpan.querySelector('b');
        if(b) status = b.textContent.trim();
      }
      // Los alumnos con la etiqueta "Motxilla" no tienen que pagar el dossier.
      const motxilla = Array.from(tr.querySelectorAll('.etiqueta-div .taggle_text')).some(t=>t.textContent.trim().toLowerCase()==='motxilla');
      return { name, group, status, paid: status==='Pagat', motxilla };
    }).filter(s=>s.name);
  }

  // ---- Ventana de progreso (se va actualizando mientras se recorren las páginas) ----
  const overlay = document.createElement('div');
  overlay.id = 'mihorario-ieduca-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:10px;max-width:560px;width:92%;max-height:82vh;overflow:auto;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.3);';
  box.innerHTML = `
    <h2 style="margin:0 0 4px;font-size:18px;">Leyendo pagos de iEduca</h2>
    <p id="mihorario-ieduca-progress" style="font-size:13px;color:#555;margin:0 0 14px;">Leyendo la página actual...</p>
    <div id="mihorario-ieduca-list"></div>
    <div style="margin-top:16px;display:flex;gap:10px;">
      <button id="mihorario-ieduca-copy" style="flex:1;padding:11px;border:none;border-radius:8px;background:#2a6f4b;color:#fff;font-weight:700;cursor:pointer;" disabled>Copiar</button>
      <button id="mihorario-ieduca-cancel" style="padding:11px 16px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;">Cerrar</button>
    </div>
    <div id="mihorario-ieduca-result" style="margin-top:14px;font-size:13px;"></div>
  `;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  document.getElementById('mihorario-ieduca-cancel').onclick = closeOverlay;
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeOverlay(); });
  const progressEl = document.getElementById('mihorario-ieduca-progress');
  const listEl = document.getElementById('mihorario-ieduca-list');
  const copyBtn = document.getElementById('mihorario-ieduca-copy');

  // Página actual (la que ya tenemos delante, sin necesidad de pedirla)
  let allStudents = extractStudentsFromDoc(document);

  // Averiguar cuántas páginas más hay y con qué URL se piden. En iEduca "pagina" va
  // desde 0 (la que ya estamos viendo) hasta el número que indica el enlace "Últim".
  const pagContainer = document.getElementById('pag');
  const lastLink = pagContainer ? pagContainer.querySelector('a.icon-arrow-carrot-2right') : null;
  const lastMatch = lastLink && lastLink.getAttribute('href').match(/pagina=(\d+)/);

  if(lastMatch){
    const lastPagina = parseInt(lastMatch[1], 10);
    const hrefTemplate = lastLink.getAttribute('href');
    for(let p=1; p<=lastPagina; p++){
      progressEl.textContent = `Leyendo página ${p+1} de ${lastPagina+1}...`;
      const url = hrefTemplate.replace(/pagina=\d+/, 'pagina='+p);
      try{
        const res = await fetch(url, { credentials: 'same-origin' });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        allStudents = allStudents.concat(extractStudentsFromDoc(doc));
      }catch(e){
        progressEl.textContent = `No se pudo leer la página ${p+1}, se continúa con el resto...`;
      }
    }
  }

  progressEl.textContent = `Lectura completa: ${allStudents.length} alumno(s) en total.`;
  copyBtn.disabled = false;

  const counts = allStudents.reduce((acc,s)=>{ acc[s.status||'(sin estado)'] = (acc[s.status||'(sin estado)']||0)+1; return acc; }, {});
  listEl.innerHTML = `
    <p style="font-size:12.5px;color:#777;margin-bottom:8px;">${Object.entries(counts).map(([k,v])=>`${escapeHtml(k)}: ${v}`).join(' · ')}</p>
    ${allStudents.map(s=>{
      const color = s.status==='Pagat' ? '#2a6f4b' : (s.status==='Rebutjat' ? '#c0392b' : (s.status==='Pendent' ? '#b8860b' : '#999'));
      return `<div style="padding:5px 0;border-bottom:1px solid #eee;font-size:12.5px;display:flex;justify-content:space-between;">
        <span>${escapeHtml(s.name)} <span style="color:#aaa;">· ${escapeHtml(s.group)}</span></span>
        <b style="color:${color};">${s.motxilla?'🎒 Motxilla':escapeHtml(s.status||'—')}</b>
      </div>`;
    }).join('')}
  `;

  copyBtn.onclick = async ()=>{
    const payload = { app:'MiHorario', mode:'dossier', students: allStudents.map(s=>({ name:s.name, paid:s.paid, motxilla:s.motxilla })) };
    try{
      await navigator.clipboard.writeText(JSON.stringify(payload));
      document.getElementById('mihorario-ieduca-result').textContent = `Copiado (${payload.students.length} alumno(s)). Ve a Mi Horario y pulsa "Pegar pagos desde iEduca".`;
    }catch(e){
      document.getElementById('mihorario-ieduca-result').textContent = 'No se pudo copiar automáticamente.';
    }
  };

})();
