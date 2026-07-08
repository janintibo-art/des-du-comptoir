'use strict';
/* Brique commune aux jeux de cartes EN LOCAL (contre l'ordinateur ou à tour de
   rôle sur un seul téléphone). N'utilise pas game-core.js pour éviter les conflits.
   Chaque jeu reçoit un objet GC avec les aides d'affichage et de tour. */
(function(){
const $c = id => document.getElementById(id);
const escc = s => String(s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const AI_NAMES = ['Le Patron', 'Marcel', 'La Môme', 'Riton'];
const CLS = {get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
             set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};

/* sons légers (Web Audio) + vibration, indépendants du moteur de dés */
const Snd = (function(){
  let ctx=null, on=CLS.get('gc-sound',true);
  function ac(){ if(!ctx){try{ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}} if(ctx&&ctx.state==='suspended')ctx.resume(); return ctx; }
  function tone(f,t,d,type,v){ const c=ac(); if(!c)return; const o=c.createOscillator(),g=c.createGain();
    o.type=type||'triangle'; o.frequency.value=f; g.gain.setValueAtTime(v||.16,c.currentTime+t);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+d); o.connect(g);g.connect(c.destination);
    o.start(c.currentTime+t); o.stop(c.currentTime+t+d+.02); }
  function vib(p){ if(on&&navigator.vibrate){try{navigator.vibrate(p);}catch(e){}} }
  return { get on(){return on;}, toggle(){on=!on;CLS.set('gc-sound',on);if(on)ac();return on;},
    play(){ if(on){tone(520,0,.05,'square',.09);tone(320,.02,.08,'triangle',.12);} vib(25); },
    good(){ if(on){tone(880,0,.12);tone(1318,.1,.16);} vib(40); },
    win(){ if(on)[523,659,784,1047,1318].forEach((f,i)=>tone(f,i*.13,.28,'triangle',.2)); vib([80,60,80,60,160]); },
    lose(){ if(on)[392,330,262].forEach((f,i)=>tone(f,i*.16,.28)); vib(120); } };
})();

window.CardShell = async function(cfg){
  const SKIN = cfg.skinModule || Cards;
  document.title = cfg.title + ' — Les Dés du Comptoir';
  document.body.insertAdjacentHTML('afterbegin', `
<div id="ctable">
  <div class="cbar">
    <div class="cbrand"><a href="index.html">${escc(cfg.title)}</a><small><a href="index.html">← MENU</a></small></div>
    <select id="cardSkinSel" aria-label="Style des cartes"></select>
    <button id="cSound" title="Sons">🔊</button>
    <button id="cRules">❓</button>
    <div id="cScores"></div>
  </div>
  <div id="cOpps" class="opps"></div>
  <div id="cCenter"></div>
  <div id="cMsg"></div>
  <div id="cCombo"></div>
  <div id="cActions"></div>
  <div id="cHand" class="hand"></div>
</div>
<div id="cCurtain" class="curtain" style="display:none">
  <div><h2 id="curtainName"></h2><p>Prenez le téléphone, les autres ne regardent pas !</p>
  <button id="curtainGo" class="primary">Voir mes cartes 👀</button></div>
</div>
<div id="cSetup" class="modal" style="display:none"><div class="modal-card">
  <h2>Qui joue ?</h2>
  <div class="setup-label">Nombre de joueurs</div>
  <div id="cCount" class="row"></div>
  <div id="cRows"></div>
  <div class="setup-label">Niveau de l'ordinateur</div>
  <select id="cAI"><option value="p">Prudent</option><option value="n">Normal</option><option value="a">Audacieux</option></select>
  <div id="cWarn" class="warn"></div>
  <button id="cGo" class="primary">Distribuer</button>
</div></div>
<div id="cRulesModal" class="modal" style="display:none"><div class="modal-card">
  <h2 id="cRulesTitle"></h2><div id="cRulesBody" class="rules"></div>
  <button id="cRulesClose" class="primary">Fermer</button>
</div></div>
<div id="cOverlay" class="modal" style="display:none"><div class="modal-card">
  <h1 id="cOvTitle" style="color:var(--accent)"></h1><p id="cOvText"></p>
  <div class="row"><button id="cReplay" class="primary">Rejouer</button>
  <button id="cResetup">Changer les joueurs</button></div>
</div></div>`);

  SKIN.buildSkinSelect($c('cardSkinSel'), ()=> GC._rerender && GC._rerender());
  const sndBtn=$c('cSound'); const updSnd=()=>sndBtn.textContent=Snd.on?'🔊':'🔇'; updSnd();
  sndBtn.addEventListener('click',()=>{Snd.toggle();updSnd();});
  $c('cRules').addEventListener('click',()=>{ const r=(window.RULES||{})[cfg.id];
    $c('cRulesTitle').textContent=r?r.title:'Règles'; $c('cRulesBody').innerHTML=r?r.html:'<p>—</p>';
    $c('cRulesModal').style.display='flex'; });
  $c('cRulesClose').addEventListener('click',()=>$c('cRulesModal').style.display='none');

  let actionResolve=null;
  function setButtons(defs){ const b=$c('cActions'); b.innerHTML='';
    (defs||[]).forEach(d=>{ const x=document.createElement('button'); x.textContent=d.label;
      if(d.primary)x.className='primary'; x.disabled=!!d.disabled;
      x.addEventListener('click',()=>{ if(actionResolve){const r=actionResolve;actionResolve=null;r(d.id);} });
      b.appendChild(x); }); }
  const waitAction=()=>new Promise(r=>actionResolve=r);

  function setupPlayers(){
    return new Promise(resolve=>{
      const min=cfg.minPlayers||2, max=cfg.maxPlayers||4;
      const saved=CLS.get('gc-players',null);
      let count=Math.min(max,Math.max(min,saved?saved.length:Math.min(max,3)));
      $c('cSetup').style.display='flex'; $c('cAI').value=CLS.get('gc-ai','n');
      function rows(){ const l=$c('cRows'); l.innerHTML='';
        for(let i=0;i<count;i++){ const prev=(saved&&saved[i])||{};
          const row=document.createElement('div'); row.className='setup-row';
          const name=prev.name?escc(prev.name):'Joueur '+(i+1);
          row.innerHTML=`<input type="text" maxlength="14" value="${name}">
            <select><option value="h">Humain</option><option value="a">Ordinateur</option></select>`;
          row.querySelector('select').value=prev.ai?'a':'h'; l.appendChild(row); } }
      function counts(){ const c=$c('cCount'); c.innerHTML='';
        for(let n=min;n<=max;n++){ const b=document.createElement('button');
          b.textContent=n; if(n===count)b.className='primary';
          b.addEventListener('click',()=>{count=n;counts();rows();}); c.appendChild(b); } }
      counts(); rows();
      $c('cGo').onclick=()=>{
        const players=[...$c('cRows').children].map((row,i)=>{
          const ai=row.querySelector('select').value==='a';
          let name=row.querySelector('input').value.trim()||'Joueur '+(i+1);
          if(ai&&/^Joueur \d+$/.test(name)) name=AI_NAMES[i%AI_NAMES.length];
          return {name,ai}; });
        if(!players.some(p=>!p.ai)){ $c('cWarn').textContent='Il faut au moins un joueur humain.'; return; }
        CLS.set('gc-players',players); CLS.set('gc-ai',$c('cAI').value);
        $c('cSetup').style.display='none';
        resolve(players.map(p=>({name:p.name,ai:p.ai})));
      };
    });
  }

  function handOff(name){
    // rideau entre deux humains (pass-and-play). Sauté si un seul humain.
    const humans=GC.players.filter(p=>!p.ai).length;
    if(humans<2) return Promise.resolve();
    return new Promise(res=>{
      $c('curtainName').textContent='À '+name;
      $c('cCurtain').style.display='flex';
      $c('curtainGo').onclick=()=>{ $c('cCurtain').style.display='none'; res(); };
    });
  }

  let endChoice='replay';
  function gameOver(title,text){
    const w=/^Victoire de (.+) !$/.exec(title);
    const human=w && GC.players.some(p=>!p.ai && p.name===w[1]);
    if(human){ Snd.win(); recordWin(cfg.id); } else Snd.lose();
    return new Promise(res=>{
      $c('cOvTitle').textContent=title; $c('cOvText').innerHTML=text;
      $c('cOverlay').style.display='flex';
      $c('cReplay').onclick=()=>{ $c('cOverlay').style.display='none'; endChoice='replay'; res(); };
      $c('cResetup').onclick=()=>{ $c('cOverlay').style.display='none'; endChoice='setup'; res(); };
    });
  }
  function recordWin(id){ const s=CLS.get('gc-stats',{}); const g=s[id]||(s[id]={played:0,won:0});
    g.played++; g.won++; CLS.set('gc-stats',s); }
  function recordPlay(id){ const s=CLS.get('gc-stats',{}); const g=s[id]||(s[id]={played:0,won:0});
    /* victoire déjà comptée ailleurs ; ici on incrémente played si pas de victoire humaine */ }

  const GC={
    cfg, players:[], _rerender:null,
    aiRisk:{p:.75,n:1,a:1.3}[CLS.get('gc-ai','n')]||1,
    Snd,
    say:t=>$c('cMsg').textContent=t||'',
    combo:t=>{ $c('cCombo').textContent=t||''; if(t&&/!/.test(t))Snd.good(); },
    scores(items){ const b=$c('cScores'); b.innerHTML='';
      items.forEach(it=>{ const s=document.createElement('span');
        s.className='pill'+(it.active?' active':''); s.innerHTML=escc(it.label)+' : <b>'+escc(it.value)+'</b>';
        b.appendChild(s); }); },
    opponents(list){ const b=$c('cOpps'); b.innerHTML='';
      list.forEach(o=>{ const d=document.createElement('div'); d.className='opp'+(o.turn?' turn':'');
        d.innerHTML=escc(o.name)+' — <b>'+o.count+'</b> 🂠'+(o.tag?' '+o.tag:''); b.appendChild(d); }); },
    center(node){ const c=$c('cCenter'); c.innerHTML=''; if(typeof node==='string')c.innerHTML=node; else if(node)c.appendChild(node); return c; },
    hand(cards,opts){ opts=opts||{}; const h=$c('cHand'); h.innerHTML='';
      cards.forEach(card=>{ const ok=!opts.playable||opts.playable(card);
        const el=SKIN.el(card,{onClick: (opts.onPick&&ok)?opts.onPick:null, disabled:!ok && !opts.showAll});
        if(ok&&opts.onPick) el.classList.add('play'); h.appendChild(el); }); },
    clearHand(){ $c('cHand').innerHTML=''; },
    setButtons, waitAction, ask:defs=>{setButtons(defs);return waitAction();},
    sleep:ms=>new Promise(r=>setTimeout(r,ms)),
    handOff, gameOver, play:()=>Snd.play(),
  };

  GC.players = await setupPlayers();
  GC.aiRisk = {p:.75,n:1,a:1.3}[CLS.get('gc-ai','n')]||1;
  while(true){
    setButtons([]); GC.say(''); GC.combo(''); GC.center(''); GC.clearHand(); $c('cOpps').innerHTML='';
    await cfg.run(GC);
    if(endChoice==='setup'){ GC.players=await setupPlayers(); GC.aiRisk={p:.75,n:1,a:1.3}[CLS.get('gc-ai','n')]||1; }
  }
};
})();
