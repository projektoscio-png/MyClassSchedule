/* ==================================================================
   Mi Horario -> iEduca
   Se ejecuta EN la página de iEduca (mediante el marcador guardado en
   el navegador). Lee el portapapeles (lo que "Copiar para iEduca" dejó
   ahí desde Mi Horario), busca a los alumnos en la página actual por su
   nombre, y muestra una ventana de confirmación antes de tocar nada.
   Solo al pulsar "Aplicar" se simulan los mismos clics que harías tú a
   mano en los botones A/R/F/D/m/C/i de iEduca.
   ================================================================== */
(async function(){

  function escapeHtml(s){
    return (s==null?'':String(s)).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function normalize(s){
    return (s||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .replace(/[^a-z\s]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function wordsOf(s){ return normalize(s).split(' ').filter(Boolean); }
  function matchScore(a, b){
    const wa = wordsOf(a), wb = wordsOf(b);
    if(wa.length===0) return 0;
    let hits = 0;
    wa.forEach(w=>{ if(wb.includes(w)) hits++; });
    return hits / wa.length;
  }

  function closeOverlay(){
    const el = document.getElementById('mihorario-ieduca-overlay');
    if(el) el.remove();
  }
  closeOverlay();

  let payload;
  try{
    const text = await navigator.clipboard.readText();
    payload = JSON.parse(text);
    if(payload.app !== 'MiHorario') throw new Error('no-es-mi-horario');
  }catch(e){
    alert('No se ha encontrado en el portapapeles ningún dato copiado desde "Copiar para iEduca" en Mi Horario. Copia primero desde allí y vuelve a pulsar este marcador aquí, en iEduca.');
    return;
  }

  // Directorio de alumnos de ESTA página de iEduca: id_per -> nombre
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

  const CODE_LABELS = { F:'F (Falta)', R:'R (Retard)', m:'m (No material)', C:'C (Falta lleu)', D:'D (No deures)' };

  /* Busca, entre TODOS los botones de asistencia de esta página, el que pertenece a
     este alumno (comparando el id_per que aparece dentro de su propio "onclick",
     ya que el atributo name no siempre está presente en todas las plantillas de
     iEduca) y cuyo texto visible es exactamente esa letra (F, R, C, D, m). No usamos
     el número interno del botón (value) porque puede variar según el grupo/curso. */
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

  /* Igual que arriba, pero para el enlace [OBS] que abre la ventana de observaciones:
     no siempre tiene la clase "boto_obs", así que buscamos por lo que hay dentro del
     propio wopen(...). */
  function findObsLink(id_per){
    const candidates = document.querySelectorAll('a[onclick*="assistencia_observacions.php"]');
    const re = new RegExp('id_per=' + id_per + '(&|\')');
    for(const a of candidates){
      const onclick = a.getAttribute('onclick') || '';
      if(re.test(onclick)) return a;
    }
    return null;
  }

  const matches = payload.students.map(st=>{
    let best = null, bestScore = 0;
    directory.forEach(d=>{
      const score = matchScore(st.name, d.name);
      if(score > bestScore){ bestScore = score; best = d; }
    });
    // Umbral: hace falta que coincidan como mínimo la mitad de las palabras del nombre.
    const ok = best && bestScore >= 0.5;
    return { miName: st.name, codes: st.codes, obsText: st.obsText||null, matched: ok ? best : null, score: bestScore };
  });

  // ---- Ventana de confirmación ----
  const overlay = document.createElement('div');
  overlay.id = 'mihorario-ieduca-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:10px;max-width:560px;width:92%;max-height:82vh;overflow:auto;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.3);';
  box.innerHTML = `
    <h2 style="margin:0 0 4px;font-size:18px;">Volcar a iEduca — ${payload.subject||''} (${payload.date||''})</h2>
    <p style="font-size:13px;color:#555;margin:0 0 14px;">Revisa que cada alumno se ha reconocido bien antes de aplicar. Los que salgan en rojo no se tocarán.</p>
    <div id="mihorario-ieduca-list"></div>
    <div style="margin-top:16px;display:flex;gap:10px;">
      <button id="mihorario-ieduca-apply" style="flex:1;padding:11px;border:none;border-radius:8px;background:#2a6f4b;color:#fff;font-weight:700;cursor:pointer;">Aplicar</button>
      <button id="mihorario-ieduca-cancel" style="padding:11px 16px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;">Cancelar</button>
    </div>
    <div id="mihorario-ieduca-result" style="margin-top:14px;font-size:13px;white-space:pre-wrap;"></div>
  `;
  const list = box.querySelector('#mihorario-ieduca-list');
  matches.forEach((m,i)=>{
    const row = document.createElement('div');
    row.style.cssText = 'padding:8px 0;border-bottom:1px solid #eee;font-size:13.5px;';
    const codesTxt = m.codes.map(c=>CODE_LABELS[c]||c).join(', ');
    const obsHint = m.obsText ? `<br><span style="color:#0a6cad;">📝 Observación: "${escapeHtml(m.obsText.length>80?m.obsText.slice(0,80)+'…':m.obsText)}"</span>` : '';
    if(m.matched){
      row.innerHTML = `<b>${escapeHtml(m.miName)}</b> → <span style="color:#2a6f4b;">${escapeHtml(m.matched.name)}</span><br><span style="color:#777;">${escapeHtml(codesTxt)}</span>${obsHint}`;
    } else {
      row.innerHTML = `<b style="color:#c0392b;">${escapeHtml(m.miName)}</b> → sin coincidencia clara en esta página (no se aplicará)<br><span style="color:#777;">${escapeHtml(codesTxt)}</span>${obsHint}`;
    }
    list.appendChild(row);
  });
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById('mihorario-ieduca-cancel').onclick = closeOverlay;
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeOverlay(); });

  document.getElementById('mihorario-ieduca-apply').onclick = ()=>{
    const resultBox = document.getElementById('mihorario-ieduca-result');
    let ok = 0, fail = 0;
    const failLines = [];
    // Los que tengan nota de Actitud (CC) necesitan también rellenar la ventana de
    // observaciones. Se abren TODAS las ventanas ahora mismo, dentro de este mismo
    // clic, para que el navegador no bloquee los popups por abrirse "sin que el
    // usuario haya hecho nada" (si se abrieran más tarde, tras una espera, el
    // navegador podría considerarlos spam y bloquearlos).
    const obsQueue = [];
    matches.forEach(m=>{
      if(!m.matched) return;
      m.codes.forEach(code=>{
        const btn = findLetterButton(m.matched.id_per, code);
        if(btn){ btn.click(); ok++; }
        else { fail++; failLines.push(`${m.miName}: no se encontró el botón "${code}" en esta página`); }
      });
      if(m.obsText){
        const obsLink = findObsLink(m.matched.id_per);
        const m2 = obsLink && obsLink.getAttribute('onclick').match(/wopen\('([^']+)'/);
        if(m2){
          const win = window.open(m2[1], 'mihorario_obs_'+m.matched.id_per, 'width=520,height=650');
          if(win) obsQueue.push({ win, name:m.miName, text:m.obsText });
          else failLines.push(`${m.miName}: el navegador bloqueó la ventana de observación (permite popups para este sitio e inténtalo de nuevo)`);
        } else {
          failLines.push(`${m.miName}: no se encontró el enlace de observaciones en la página`);
        }
      }
    });

    function fillObsWindow(item){
      return new Promise((resolve)=>{
        const start = Date.now();
        const tryFill = ()=>{
          let doc;
          try{ doc = item.win.document; }catch(e){ doc = null; }
          const textarea = doc && doc.getElementById && doc.getElementById('text');
          if(textarea){
            textarea.value = item.text;
            const form = doc.getElementById('form1');
            const submitBtn = form && form.querySelector('button[type="submit"]');
            if(submitBtn) submitBtn.click(); else if(form) form.submit();
            setTimeout(()=>{ try{ item.win.close(); }catch(e){} resolve(true); }, 900);
          } else if(Date.now() - start > 8000){
            resolve(false); // no cargó a tiempo; se deja abierta para que el usuario la revise a mano
          } else {
            setTimeout(tryFill, 200);
          }
        };
        tryFill();
      });
    }

    (async ()=>{
      for(const item of obsQueue){
        const filled = await fillObsWindow(item);
        if(filled) ok++; else failLines.push(`${item.name}: la ventana de observación no cargó a tiempo, revísala a mano (se ha dejado abierta)`);
      }
      resultBox.textContent = `Aplicado: ${ok} acción(es) correctamente.` + (failLines.length ? `\n${failLines.length} aviso(s):\n` + failLines.join('\n') : '');
    })();

    document.getElementById('mihorario-ieduca-apply').disabled = true;
    document.getElementById('mihorario-ieduca-apply').style.opacity = '.5';
  };

})();
