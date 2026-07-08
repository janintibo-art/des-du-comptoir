'use strict';
/* Cadre commun des jeux : joueurs (humains/IA), boutons, secousse, sons,
   vibrations, journal, statistiques, déblocage des styles, tournoi. */
const $id = id => document.getElementById(id);
const esc = s => String(s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const AI_NAMES = ['Le Patron', 'Marcel', 'La Môme', 'Riton'];
const LS = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
};
const SKIN_START = ['fantasy','neon','ocean'];
const SKIN_ORDER = ['gothic','steampunk','crystal','tribal','candy','ice','streetart','biomech','origami'];

/* ---- Sons (synthèse Web Audio) + vibrations ---- */
const SFX = (function(){
  let ctx = null, on = LS.get('gc-sound', true);
  function ac(){
    if(!ctx){ try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} }
    if(ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, t0, dur, type, vol){
    const c = ac(); if(!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol || .18, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(.001, c.currentTime + t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + .02);
  }
  function clack(t0, vol){
    const c = ac(); if(!c) return;
    const n = c.createBufferSource(), len = c.sampleRate * .05;
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for(let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * (1 - i/len);
    n.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.value = 1600 + Math.random()*1800; f.Q.value = 1.2;
    const g = c.createGain(); g.gain.value = vol || .5;
    n.connect(f); f.connect(g); g.connect(c.destination);
    n.start(c.currentTime + t0);
  }
  function vib(p){ if(on && navigator.vibrate){ try{ navigator.vibrate(p); }catch(e){} } }
  return {
    get on(){ return on; },
    toggle(){ on = !on; LS.set('gc-sound', on); if(on) ac(); return on; },
    roll(n){
      if(!on) return vib(0);
      const hits = 3 + Math.floor(Math.random()*3) + (n||0);
      for(let i = 0; i < hits; i++) clack(i*.07 + Math.random()*.05, .55 - i*.06);
      vib(60);
    },
    good(){ if(on){ tone(880, 0, .12); tone(1318, .1, .18); } vib(40); },
    bad(){ if(on){ tone(220, 0, .25, 'sawtooth', .12); tone(165, .12, .3, 'sawtooth', .1); } vib([60,50,60]); },
    win(){ if(on) [523,659,784,1047,1318].forEach((f,i)=> tone(f, i*.13, .3, 'triangle', .2)); vib([80,60,80,60,160]); },
    lose(){ if(on) [392,330,262].forEach((f,i)=> tone(f, i*.16, .3)); vib(120); },
    chip(){ if(on){ clack(0,.35); tone(2200, 0, .05, 'square', .06); } },
  };
})();

/* ---- Statistiques & déblocage des styles ---- */
function recordStats(gameId, humanWon){
  const s = LS.get('gc-stats', {});
  const g = s[gameId] || (s[gameId] = {played:0, won:0});
  g.played++; if(humanWon) g.won++;
  LS.set('gc-stats', s);
}
function unlockedSkins(){
  let u = LS.get('gc-skins', null);
  if(!u){
    u = [...SKIN_START];
    let cur = null; try{ cur = localStorage.getItem('diceSkin'); }catch(e){}
    if(cur && !u.includes(cur)) u.push(cur);
    LS.set('gc-skins', u);
  }
  return u;
}
function unlockNextSkin(){
  const u = unlockedSkins();
  const next = SKIN_ORDER.find(s => !u.includes(s));
  if(!next) return null;
  u.push(next); LS.set('gc-skins', u);
  return next;
}
function winnerFromTitle(title){
  let m = title.match(/^Victoire de (.+) !$/); if(m) return {name:m[1], human:true};
  m = title.match(/^(.+) gagne…$/); if(m) return {name:m[1], human:false};
  return null;
}

async function GameShell(cfg){
  document.title = cfg.title + ' — Les Dés du Comptoir';
  const tour = LS.get('gc-tour', null);
  const inTour = tour && tour.idx < tour.games.length && tour.games[tour.idx] === cfg.id;
  document.body.insertAdjacentHTML('afterbegin', `
<canvas id="render"></canvas>
<div id="hud">
  <div class="bar">
    <div class="brand"><a href="index.html">${esc(cfg.title)}</a>
      <small>${inTour ? 'TOURNOI — MANCHE '+(tour.idx+1)+'/'+tour.games.length : '<a href="index.html">← MENU</a>'}</small></div>
    <select id="skin" aria-label="Style des dés"></select>
    <button id="shake" title="Secouer le téléphone pour lancer">📳 OFF</button>
    <button id="sound" title="Sons et vibrations">🔊</button>
    <button id="histBtn" title="Journal de la partie">📜</button>
    <button id="rulesBtn">❓</button>
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
  <div class="setup-label">Niveau de l'ordinateur</div>
  <select id="setupAI">
    <option value="p">Prudent — il banque tôt</option>
    <option value="n">Normal</option>
    <option value="a">Audacieux — il tente le diable</option>
  </select>
  <div id="setupWarn" class="warn"></div>
  <button id="setupGo" class="primary">Commencer</button>
</div></div>
<div id="rulesModal" class="modal" style="display:none"><div class="modal-card">
  <h2 id="rulesTitle"></h2>
  <div id="rulesBody" class="rules"></div>
  <button id="rulesClose" class="primary">Fermer</button>
</div></div>
<div id="histModal" class="modal" style="display:none"><div class="modal-card">
  <h2>Journal</h2>
  <div id="histBody" class="rules"></div>
  <button id="histClose" class="primary">Fermer</button>
</div></div>`);

  const T = DiceTable({diceCount: cfg.diceCount});

  /* sons branchés sur le moteur */
  const _throw = T.throwDice.bind(T);
  T.throwDice = subset => { SFX.roll(subset ? subset.length : 0); return _throw(subset); };

  /* styles de dés : verrouillage progressif */
  T.buildSkinSelect($id('skin'));
  (function(){
    const u = unlockedSkins(), sel = $id('skin');
    [...sel.options].forEach(o=>{
      if(!u.includes(o.value)){ o.disabled = true; o.textContent = '🔒 ' + o.textContent; }
    });
    if(sel.selectedOptions[0] && sel.selectedOptions[0].disabled){ sel.value = u[0]; T.applySkin(u[0]); }
  })();

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

  /* ---- Scores ---- */
  function scores(items){
    const box = $id('scores'); box.innerHTML = '';
    items.forEach(it=>{
      const s = document.createElement('span');
      s.className = 'pill' + (it.active ? ' active' : '');
      s.innerHTML = esc(it.label) + ' : <b>' + esc(it.value) + '</b>';
      box.appendChild(s);
    });
  }

  /* ---- Journal ---- */
  const hist = [];
  function log(t){
    if(!t) return;
    if(hist.length && hist[hist.length-1] === t) return;
    hist.push(t); if(hist.length > 250) hist.shift();
  }
  $id('histBtn').addEventListener('click', ()=>{
    $id('histBody').innerHTML = hist.length
      ? [...hist].reverse().map(h=>'<p>'+esc(h)+'</p>').join('')
      : '<p>Rien à raconter pour l\u2019instant.</p>';
    $id('histModal').style.display = 'flex';
  });
  $id('histClose').addEventListener('click', ()=> $id('histModal').style.display = 'none');

  /* ---- Son ---- */
  const sndBtn = $id('sound');
  const updSnd = ()=> sndBtn.textContent = SFX.on ? '🔊' : '🔇';
  updSnd();
  sndBtn.addEventListener('click', ()=>{ SFX.toggle(); updSnd(); });

  /* ---- Secousse ---- */
  (function(){
    let on = LS.get('gc-shake', false);
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
      on = !on; LS.set('gc-shake', on); upd();
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
  function playersFromCfg(list){
    return list.map((p,i)=>({name: p.name || 'Joueur '+(i+1), ai: !!p.ai}));
  }
  function setupPlayers(){
    return new Promise(resolve=>{
      const min = cfg.minPlayers || 2, max = cfg.maxPlayers || 4;
      const saved = LS.get('gc-players', null);
      let count = Math.min(max, Math.max(min, saved ? saved.length : 2));
      $id('setup').style.display = 'flex';
      $id('setupAI').value = LS.get('gc-ai', 'n');
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
        LS.set('gc-players', players);
        LS.set('gc-ai', $id('setupAI').value);
        $id('setup').style.display = 'none';
        resolve(playersFromCfg(players));
      };
    });
  }

  /* ---- Fin de partie ---- */
  let endChoice = 'replay';
  function gameOver(title, text){
    const w = winnerFromTitle(title);
    recordStats(cfg.id, !!(w && w.human));
    if(w && w.human){
      SFX.win();
      const nu = unlockNextSkin();
      if(nu){
        const sel = $id('skin');
        const opt = [...sel.options].find(o => o.value === nu);
        if(opt){ opt.disabled = false; opt.textContent = opt.textContent.replace('🔒 ',''); }
        text += '<br><br>🎁 Nouveau style de dés débloqué : <b>' + esc(opt ? opt.textContent : nu) + '</b> !';
      }
    } else if(w && !w.human) SFX.lose();
    else SFX.good();
    log('— ' + title);

    /* tournoi : enregistrer la manche et enchaîner */
    const t = LS.get('gc-tour', null);
    const active = t && t.idx < t.games.length && t.games[t.idx] === cfg.id;
    if(active){
      if(w){ t.wins[w.name] = (t.wins[w.name] || 0) + 1; }
      t.idx++;
      LS.set('gc-tour', t);
    }
    return new Promise(res=>{
      $id('ovTitle').textContent = title;
      $id('ovText').innerHTML = text;
      $id('overlay').style.display = 'flex';
      if(active){
        const more = t.idx < t.games.length;
        $id('replay').textContent = more ? 'Manche suivante ▶' : '🏆 Classement final';
        $id('resetup').style.display = 'none';
        $id('replay').onclick = ()=>{
          location.href = more ? 'game-' + t.games[t.idx] + '.html' : 'tournoi.html';
        };
      } else {
        $id('replay').textContent = 'Rejouer';
        $id('resetup').style.display = '';
        $id('replay').onclick = ()=>{ $id('overlay').style.display = 'none'; endChoice = 'replay'; res(); };
        $id('resetup').onclick = ()=>{ $id('overlay').style.display = 'none'; endChoice = 'setup'; res(); };
      }
    });
  }

  const GC = {
    T, cfg,
    players: [],
    aiRisk: {p:.75, n:1, a:1.3}[LS.get('gc-ai','n')] || 1,
    say: t => { $id('msg').textContent = t; log(t); },
    combo: t => {
      $id('combo').textContent = t; log(t);
      if(t.includes('✓')) SFX.chip();
      else if(t.includes('✗')) SFX.bad();
      else if(/(!|MEXICO|ZANZIBAR)/.test(t)) SFX.good();
    },
    hint: t => $id('hint').textContent = t,
    scores, setButtons, waitAction, emit, log,
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

  /* en tournoi avec une config déjà connue : on ne redemande pas */
  const savedP = LS.get('gc-players', null);
  if(inTour && savedP && savedP.length >= (cfg.minPlayers||2)){
    GC.players = playersFromCfg(savedP);
  } else {
    GC.players = await setupPlayers();
    GC.aiRisk = {p:.75, n:1, a:1.3}[LS.get('gc-ai','n')] || 1;
  }
  while(true){
    setButtons([]); GC.say(''); GC.combo(''); GC.custom(null); GC.panel(null);
    await cfg.run(GC);
    if(endChoice === 'setup'){
      GC.players = await setupPlayers();
      GC.aiRisk = {p:.75, n:1, a:1.3}[LS.get('gc-ai','n')] || 1;
    }
  }
}
