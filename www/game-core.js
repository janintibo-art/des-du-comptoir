'use strict';
/* Cadre commun des jeux : joueurs (humains/IA), boutons d'action,
   secousse pour lancer, feuille latérale, modale de règles. */
const $id = id => document.getElementById(id);
const esc = s => String(s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const AI_NAMES = ['Le Patron', 'Marcel', 'La Môme', 'Riton'];

async function GameShell(cfg){
  document.title = cfg.title + ' — Les Dés du Comptoir';
  document.body.insertAdjacentHTML('afterbegin', `
<canvas id="render"></canvas>
<div id="hud">
  <div class="bar">
    <div class="brand"><a href="index.html">${esc(cfg.title)}</a><small><a href="index.html">← MENU</a></small></div>
    <select id="skin" aria-label="Style des dés"></select>
    <button id="shake" title="Secouer le téléphone pour lancer">📳 OFF</button>
    <button id="rulesBtn">❓ Règles</button>
    <div id="scores"></div>
  </div>
  <div id="bottom">
    <div id="msg"></div>
    <div id="combo"></div>
    <div id="custom"></div>
    <div id="actions"></div>
    <div id="hint"></div>
  </div>
</div>
<div id="panel" hidden></div>
<div id="overlay">
  <h1 id="ovTitle"></h1><p id="ovText"></p>
  <div class="row"><button id="replay" class="primary">Rejouer</button>
  <button id="resetup">Changer les joueurs</button></div>
</div>
<div id="setup" class="modal" style="display:none"><div class="modal-card">
  <h2>Qui joue ?</h2>
  <div class="setup-label">Nombre de joueurs</div>
  <div id="setupCount" class="row"></div>
  <div id="setupRows"></div>
  <div id="setupWarn" class="warn"></div>
  <button id="setupGo" class="primary">Commencer</button>
</div></div>
<div id="rulesModal" class="modal" style="display:none"><div class="modal-card">
  <h2 id="rulesTitle"></h2>
  <div id="rulesBody" class="rules"></div>
  <button id="rulesClose" class="primary">Fermer</button>
</div></div>`);

  const T = DiceTable({diceCount: cfg.diceCount});
  T.buildSkinSelect($id('skin'));

  /* ---- Boutons d'action ---- */
  let actionResolve = null, primaryBtn = null;
  function emit(id){
    if(actionResolve){ const r = actionResolve; actionResolve = null; r(id); }
  }
  function setButtons(defs){
    const box = $id('actions'); box.innerHTML = ''; primaryBtn = null;
    (defs || []).forEach(def=>{
      const b = document.createElement('button');
      b.textContent = def.label;
      if(def.primary) b.className = 'primary';
      b.disabled = !!def.disabled;
      if(def.primary && !def.disabled) primaryBtn = b;
      b.addEventListener('click', ()=> emit(def.id));
      box.appendChild(b);
    });
  }
  const waitAction = () => new Promise(r => actionResolve = r);

  /* ---- Tableau des scores ---- */
  function scores(items){
    const box = $id('scores'); box.innerHTML = '';
    items.forEach(it=>{
      const s = document.createElement('span');
      s.className = 'pill' + (it.active ? ' active' : '');
      s.innerHTML = esc(it.label) + ' : <b>' + esc(it.value) + '</b>';
      box.appendChild(s);
    });
  }

  /* ---- Secousse pour lancer ---- */
  (function(){
    let on = false;
    try{ on = localStorage.getItem('gc-shake') === '1'; }catch(e){}
    const btn = $id('shake');
    const upd = ()=> btn.textContent = '📳 ' + (on ? 'ON' : 'OFF');
    upd();
    btn.addEventListener('click', async ()=>{
      if(!on && typeof DeviceMotionEvent !== 'undefined' &&
         typeof DeviceMotionEvent.requestPermission === 'function'){
        try{
          if(await DeviceMotionEvent.requestPermission() !== 'granted'){
            $id('msg').textContent = 'Permission de mouvement refusée.'; return;
          }
        }catch(e){}
      }
      on = !on;
      try{ localStorage.setItem('gc-shake', on ? '1' : '0'); }catch(e){}
      upd();
      $id('msg').textContent = on ? 'Secouez le téléphone pour appuyer sur le bouton principal !' : '';
    });
    let last = 0;
    addEventListener('devicemotion', e=>{
      if(!on || !primaryBtn || primaryBtn.disabled) return;
      const a = e.accelerationIncludingGravity;
      if(!a || a.x == null) return;
      const m = Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
      if(m > 27 && Date.now() - last > 1400){ last = Date.now(); primaryBtn.click(); }
    });
  })();

  /* ---- Règles ---- */
  $id('rulesBtn').addEventListener('click', ()=>{
    const r = (window.RULES || {})[cfg.id];
    $id('rulesTitle').textContent = r ? r.title : 'Règles';
    $id('rulesBody').innerHTML = r ? r.html : '<p>Règles indisponibles.</p>';
    $id('rulesModal').style.display = 'flex';
  });
  $id('rulesClose').addEventListener('click', ()=> $id('rulesModal').style.display = 'none');

  /* ---- Configuration des joueurs ---- */
  function setupPlayers(){
    return new Promise(resolve=>{
      const min = cfg.minPlayers || 2, max = cfg.maxPlayers || 4;
      let saved = null;
      try{ saved = JSON.parse(localStorage.getItem('gc-players') || 'null'); }catch(e){}
      let count = Math.min(max, Math.max(min, saved ? saved.length : 2));
      $id('setup').style.display = 'flex';
      function rows(){
        const list = $id('setupRows'); list.innerHTML = '';
        for(let i = 0; i < count; i++){
          const prev = (saved && saved[i]) || {};
          const row = document.createElement('div'); row.className = 'setup-row';
          const name = prev.name ? esc(prev.name) : 'Joueur ' + (i + 1);
          row.innerHTML = `<input type="text" maxlength="14" value="${name}" aria-label="Nom du joueur ${i+1}">
            <select aria-label="Type du joueur ${i+1}">
              <option value="h">Humain</option><option value="a">Ordinateur</option></select>`;
          row.querySelector('select').value = prev.ai ? 'a' : 'h';
          list.appendChild(row);
        }
      }
      function counts(){
        const c = $id('setupCount'); c.innerHTML = '';
        for(let n = min; n <= max; n++){
          const b = document.createElement('button');
          b.textContent = n + (n === 1 ? ' (solo)' : '');
          if(n === count) b.className = 'primary';
          b.addEventListener('click', ()=>{ count = n; counts(); rows(); });
          c.appendChild(b);
        }
      }
      counts(); rows();
      $id('setupGo').onclick = ()=>{
        const players = [...$id('setupRows').children].map((row, i)=>{
          const ai = row.querySelector('select').value === 'a';
          let name = row.querySelector('input').value.trim() || 'Joueur ' + (i + 1);
          if(ai && /^Joueur \d+$/.test(name)) name = AI_NAMES[i % AI_NAMES.length];
          return {name, ai};
        });
        if(!players.some(p => !p.ai)){
          $id('setupWarn').textContent = 'Il faut au moins un joueur humain.'; return;
        }
        try{ localStorage.setItem('gc-players', JSON.stringify(players)); }catch(e){}
        $id('setup').style.display = 'none';
        resolve(players);
      };
    });
  }

  /* ---- Fin de partie ---- */
  let endChoice = 'replay';
  function gameOver(title, text){
    return new Promise(res=>{
      $id('ovTitle').textContent = title;
      $id('ovText').innerHTML = text;
      $id('overlay').style.display = 'flex';
      $id('replay').onclick = ()=>{ $id('overlay').style.display = 'none'; endChoice = 'replay'; res(); };
      $id('resetup').onclick = ()=>{ $id('overlay').style.display = 'none'; endChoice = 'setup'; res(); };
    });
  }

  const GC = {
    T, cfg, players: [],
    say: t => $id('msg').textContent = t,
    combo: t => $id('combo').textContent = t,
    hint: t => $id('hint').textContent = t,
    scores, setButtons, waitAction, emit,
    ask: defs => { setButtons(defs); return waitAction(); },
    sleep: ms => new Promise(r => setTimeout(r, ms)),
    panel(html){
      const p = $id('panel');
      if(html == null){ p.hidden = true; p.innerHTML = ''; }
      else { p.hidden = false; p.innerHTML = html; }
      return p;
    },
    custom(el){
      const c = $id('custom'); c.innerHTML = '';
      if(el) c.appendChild(el);
      return c;
    },
    async lineUp(){
      await Promise.all(T.dice.map((d, i)=>{
        d.kept = false; d.aside = false; d.selected = false; d.selectable = false;
        T.setHalo(d, null);
        return T.moveTo(d, (i - (T.dice.length - 1) / 2) * 2.4, 1.2);
      }));
    },
    gameOver,
  };
  if(cfg.hint) GC.hint(cfg.hint);

  GC.players = await setupPlayers();
  while(true){
    setButtons([]); GC.say(''); GC.combo(''); GC.custom(null); GC.panel(null);
    await cfg.run(GC);
    if(endChoice === 'setup') GC.players = await setupPlayers();
  }
}
