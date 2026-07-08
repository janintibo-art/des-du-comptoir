'use strict';
/* Moteurs de jeux en réseau (hôte = autorité).
   Chaque module : {id,label,minP,maxP, deal, view, apply, isOver, render}
   - deal(names) -> state
   - view(state, name) -> vue privée du joueur (main + plateau public + myTurn)
   - apply(state, name, action) -> {ok, msg?}   (mute state)
   - isOver(state) -> {over:true, text} | null
   - render(view, ui)  côté client : ui.{opps,center,hand,buttons,say,combo,send}
   Les fonctions de logique sont pures/déterministes (testables hors ligne). */
(function(){
const shuffle=d=>{ for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; };

/* ---------- utilitaires cartes ---------- */
const SUITS=['pique','coeur','carreau','trefle'], RANKS=['A','2','3','4','5','6','7','8','9','10','V','D','R'];
const SUIT_CH={pique:'\u2660',coeur:'\u2665',carreau:'\u2666',trefle:'\u2663'};
function deck52(){ const d=[]; SUITS.forEach(s=>RANKS.forEach(r=>d.push({r,s}))); return d; }
function sameCard(a,b){ return a&&b&&a.r===b.r&&a.s===b.s; }
function cardEl(c, opts){ opts=opts||{};
  const b=document.createElement('button');
  b.className='pcard'+(opts.back?' back':((c.s==='coeur'||c.s==='carreau')?' red':''))+(opts.off?' off':'');
  if(opts.back) b.innerHTML='<span class="st">\ud83c\udfb2</span>';
  else if(window.Cards){ const e=Cards.el(c,{onClick:opts.onClick,disabled:opts.disabled}); return e; }
  else { b.innerHTML='<span class="rk">'+c.r+'</span><span class="st">'+SUIT_CH[c.s]+'</span>';
    if(opts.onClick&&!opts.disabled) b.addEventListener('click',()=>opts.onClick(c)); else b.disabled=true; }
  return b;
}

/* ================= 8 AMÉRICAIN ================= */
const huit={ id:'huit', label:'Le 8 américain', minP:2, maxP:4,
  deal(names){
    const deck=shuffle(deck52());
    const per=names.length===2?7:5;
    const players=names.map(n=>({name:n, hand:deck.splice(0,per)}));
    let top=deck.shift(); while(top.r==='8'){ deck.push(top); top=deck.shift(); }
    return {players, deck, pile:[], top, suit:top.s, turn:0, drawn:false};
  },
  playable(c, top, suit){ return c.r==='8'||c.r===top.r||c.s===suit; },
  view(s, name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
    return {game:'huit', top:s.top, suit:s.suit, drawn:s.drawn, myTurn:i===s.turn,
      players:s.players.map((q,j)=>({name:q.name,count:q.hand.length,turn:j===s.turn})), hand:p.hand}; },
  apply(s, name, a){
    const i=s.players.findIndex(p=>p.name===name); if(i!==s.turn) return {ok:false};
    const p=s.players[i];
    if(a.type==='play'){
      const k=p.hand.findIndex(c=>sameCard(c,a.card)); if(k<0) return {ok:false};
      if(!this.playable(p.hand[k], s.top, s.suit)) return {ok:false};
      const c=p.hand.splice(k,1)[0]; s.pile.push(s.top); s.top=c;
      s.suit=(c.r==='8'&&a.suit)?a.suit:c.s;
      if(p.hand.length===0){ s.over=true; s.winner=name; return {ok:true}; }
      s.turn=(s.turn+1)%s.players.length; s.drawn=false;
      return {ok:true, msg:name+' joue '+a.card.r+SUIT_CH[a.card.s]+(c.r==='8'?' → '+SUIT_CH[s.suit]:'')};
    }
    if(a.type==='draw' && !s.drawn){
      if(!s.deck.length){ if(s.pile.length<=1){ s.turn=(s.turn+1)%s.players.length; return {ok:true,msg:name+' passe'};}
        const t=s.pile.pop(); s.deck=shuffle(s.pile); s.pile=[t]; }
      const c=s.deck.shift(); p.hand.push(c); s.drawn=true;
      if(this.playable(c,s.top,s.suit)) return {ok:true, msg:name+' pioche (jouable)'};
      s.turn=(s.turn+1)%s.players.length; s.drawn=false; return {ok:true, msg:name+' pioche et passe'};
    }
    if(a.type==='pass' && s.drawn){ s.turn=(s.turn+1)%s.players.length; s.drawn=false; return {ok:true,msg:name+' passe'}; }
    return {ok:false};
  },
  isOver(s){ return s.over?{over:true,text:'🏆 '+s.winner+' vide sa main et gagne !'}:null; },
  render(v, ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;gap:16px;align-items:center;justify-content:center';
    wrap.appendChild(cardEl(v.top,{})); const su=document.createElement('div');
    su.style.cssText='font-size:30px;'+((v.suit==='coeur'||v.suit==='carreau')?'color:#e06a5a':'');
    su.textContent=SUIT_CH[v.suit]; wrap.appendChild(su);
    const draw=cardEl({r:'A',s:'pique'},{back:true, onClick:v.myTurn&&!v.drawn?()=>ui.send({type:'draw'}):null, disabled:!(v.myTurn&&!v.drawn)});
    wrap.appendChild(draw); ui.center(wrap);
    ui.say(v.myTurn?'À vous !':'');
    const hand=document.createElement('div'); hand.className='hand';
    v.hand.forEach(c=>{ const ok=v.myTurn && huit.playable(c,v.top,v.suit);
      const el=cardEl(c,{disabled:!ok, onClick: ok?(cc=>{
        if(cc.r==='8'){ ui.pickSuit(su2=>ui.send({type:'play',card:cc,suit:su2})); }
        else ui.send({type:'play',card:cc}); }):null});
      if(ok) el.classList.add('play'); hand.appendChild(el); });
    ui.hand(hand);
    ui.buttons(v.myTurn&&v.drawn?[{id:'pass',label:'Passer'}]:[], id=>ui.send({type:'pass'}));
  },
};

/* ================= LE DOMINO ================= */
const pip=t=>t.a+t.b;
const domino={ id:'domino', label:'Le Domino', minP:2, maxP:4,
  deal(names){
    const set=[]; for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)set.push({a,b}); shuffle(set);
    const per=names.length===2?7:5;
    const players=names.map(n=>({name:n, hand:set.splice(0,per)}));
    let yard=set;
    let starter=0,bv=-1,bt=null;
    players.forEach((p,i)=>p.hand.forEach(t=>{const v=(t.a===t.b?100:0)+pip(t); if(v>bv){bv=v;starter=i;bt=t;}}));
    const chain=[{a:bt.a,b:bt.b}]; players[starter].hand.splice(players[starter].hand.findIndex(t=>t.a===bt.a&&t.b===bt.b),1);
    const st={players, yard, chain, L:bt.a, R:bt.b, turn:(starter+1)%names.length, passes:0, drew:false, opener:starter};
    if(players[starter].hand.length===0){ st.over=true; st.winner=players[starter].name; }
    return st;
  },
  playable(t,L,R){ return t.a===L||t.b===L||t.a===R||t.b===R; },
  view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
    return {game:'domino', chain:s.chain, L:s.L, R:s.R, yard:s.yard.length, myTurn:i===s.turn, drew:s.drew,
      players:s.players.map((q,j)=>({name:q.name,count:q.hand.length,turn:j===s.turn})), hand:p.hand}; },
  apply(s,name,a){
    const i=s.players.findIndex(p=>p.name===name); if(i!==s.turn) return {ok:false};
    const p=s.players[i]; const N=s.players.length;
    if(a.type==='play'){
      const k=p.hand.findIndex(t=>t.a===a.tile.a&&t.b===a.tile.b); if(k<0) return {ok:false};
      const t=p.hand[k]; const side=a.side;
      if(side==='R'&&!(t.a===s.R||t.b===s.R)) return {ok:false};
      if(side==='L'&&!(t.a===s.L||t.b===s.L)) return {ok:false};
      p.hand.splice(k,1);
      if(side==='R'){ const o=t.a===s.R?t.b:t.a; s.chain.push({a:s.R,b:o}); s.R=o; }
      else { const o=t.a===s.L?t.b:t.a; s.chain.unshift({a:o,b:s.L}); s.L=o; }
      s.passes=0; s.drew=false;
      if(p.hand.length===0){ s.over=true; s.winner=name; return {ok:true}; }
      s.turn=(s.turn+1)%N; return {ok:true, msg:name+' pose le '+t.a+'-'+t.b};
    }
    if(a.type==='draw'){
      if(!s.yard.length) return {ok:false};
      if(p.hand.some(t=>this.playable(t,s.L,s.R))) return {ok:false}; // interdit si on peut jouer
      p.hand.push(s.yard.shift()); s.drew=true; return {ok:true, msg:name+' pioche'};
    }
    if(a.type==='pass'){
      if(s.yard.length || p.hand.some(t=>this.playable(t,s.L,s.R))) return {ok:false};
      s.passes++; s.turn=(s.turn+1)%N;
      if(s.passes>=N){ s.over=true; s.blocked=true; }
      return {ok:true, msg:name+' passe'};
    }
    return {ok:false};
  },
  isOver(s){ if(!s.over) return null;
    if(s.blocked){ const sc=s.players.map(p=>({n:p.name,v:p.hand.reduce((a,t)=>a+pip(t),0)})).sort((a,b)=>a.v-b.v);
      return {over:true,text:'Jeu bloqué — '+sc[0].n+' gagne (moins de points) :<br>'+sc.map(x=>x.n+' : '+x.v).join('<br>')}; }
    return {over:true, text:'🁢 '+s.winner+' pose son dernier domino — gagné !'}; },
  render(v, ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
    const wrap=document.createElement('div'); wrap.style.width='100%';
    const board=document.createElement('div'); board.style.cssText='display:flex;align-items:center;gap:8px;width:100%';
    const bl=document.createElement('div'); bl.className='endbadge'; bl.innerHTML='<small>gauche</small>'+v.L;
    const ch=document.createElement('div'); ch.className='chain';
    v.chain.forEach(t=> ch.appendChild(domTile(t)));
    const br=document.createElement('div'); br.className='endbadge'; br.innerHTML='<small>droite</small>'+v.R;
    board.appendChild(bl); board.appendChild(ch); board.appendChild(br);
    wrap.appendChild(board);
    const yd=document.createElement('div'); yd.className='yard'; yd.textContent='Pioche : '+v.yard;
    wrap.appendChild(yd); ui.center(wrap);
    requestAnimationFrame(()=>{ ch.scrollLeft=ch.scrollWidth; });
    const opts=v.hand.filter(t=>domino.playable(t,v.L,v.R));
    ui.say(v.myTurn?(opts.length?'À vous — touchez une tuile.':(v.yard?'Aucun coup — piochez.':'Bloqué — passez.')):'');
    const hand=document.createElement('div'); hand.className='hand';
    v.hand.forEach(t=>{ const ok=v.myTurn&&opts.includes(t);
      const el=domTile(t, ok?(()=>{
        const mR=t.a===v.R||t.b===v.R, mL=t.a===v.L||t.b===v.L;
        if(mR&&mL&&v.L!==v.R) ui.choose([{id:'L',label:'◀ Gauche ('+v.L+')'},{id:'R',label:'Droite ('+v.R+') ▶'}], side=>ui.send({type:'play',tile:t,side}));
        else ui.send({type:'play',tile:t,side:mR?'R':'L'});
      }):null);
      if(ok) el.classList.add('play'); hand.appendChild(el); });
    ui.hand(hand);
    let btns=[];
    if(v.myTurn && !opts.length){ if(v.yard) btns=[{id:'draw',label:'Piocher'}]; else btns=[{id:'pass',label:'Passer'}]; }
    ui.buttons(btns, id=> ui.send({type:id}));
  },
};
function domTile(t, onClick){
  const b=document.createElement('button'); b.className='domino';
  if(window.Dominos){ return Dominos.el(t,{onClick:onClick||null, disabled:!onClick}); }
  b.classList.add('txt'); b.textContent=t.a+'·'+t.b;
  if(onClick) b.addEventListener('click',()=>onClick(t)); else b.disabled=true;
  return b;
}


/* ================= LE PRÉSIDENT ================= */
const PVAL={'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,V:11,D:12,R:13,A:14,'2':15};
function pGroups(hand){ const m={}; hand.forEach(c=>(m[c.r]=m[c.r]||[]).push(c)); return m; }
const president={ id:'president', label:'Le Président', minP:3, maxP:4,
  deal(names){
    const deck=shuffle(deck52()); const players=names.map(n=>({name:n,hand:[],place:null}));
    let d=0; while(deck.length){ players[d%names.length].hand.push(deck.shift()); d++; }
    players.forEach(p=>p.hand.sort((a,b)=>PVAL[a.r]-PVAL[b.r]));
    let turn=players.findIndex(p=>p.hand.some(c=>c.r==='3'&&c.s==='trefle')); if(turn<0)turn=0;
    return {players, table:null, lastPlayer:null, passes:0, turn, finished:0, N:names.length};
  },
  active(s){ return s.players.filter(p=>p.place===null); },
  nextActive(s,from){ const N=s.N; let k=(from+1)%N,h=0; while(s.players[k].place!==null&&h<N){k=(k+1)%N;h++;} return k; },
  placeLabel(place,total){ if(place===0)return '👑 Président'; if(place===total-1)return '💩 Trou du cul';
    if(place===1)return '🙂 Vice-président'; if(place===total-2)return '😕 Vice-trou'; return '😐 Neutre'; },
  view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
    return {game:'president', table:s.table, myTurn:i===s.turn && p.place===null, needCount:s.table?s.table.n:0,
      players:s.players.map((q,j)=>({name:q.name,count:q.place!=null?'✓':q.hand.length,turn:j===s.turn&&q.place===null})),
      hand:p.hand, place:p.place}; },
  apply(s,name,a){
    const i=s.players.findIndex(p=>p.name===name); if(i!==s.turn) return {ok:false};
    const p=s.players[i]; if(p.place!==null) return {ok:false}; let msg='';
    if(a.type==='play'){
      const cards=a.cards||[]; if(!cards.length) return {ok:false};
      const r=cards[0].r; if(!cards.every(c=>c.r===r)) return {ok:false};
      // possédées ?
      for(const c of cards){ if(!p.hand.some(x=>x.r===c.r&&x.s===c.s)) return {ok:false}; }
      if(s.table){ if(cards.length!==s.table.n || PVAL[r]<=s.table.val) return {ok:false}; }
      cards.forEach(c=>{ const k=p.hand.findIndex(x=>x.r===c.r&&x.s===c.s); p.hand.splice(k,1); });
      s.table={n:cards.length, val:PVAL[r], cards}; s.lastPlayer=i; s.passes=0;
      msg=name+' pose '+cards.length+'×'+r;
      if(p.hand.length===0){ p.place=s.finished++; msg=name+' — '+president.placeLabel(p.place,s.N)+' !'; }
    } else if(a.type==='pass'){ if(!s.table) return {ok:false}; s.passes++; msg=name+' passe'; }
    else return {ok:false};
    if(president.active(s).length<=1){ const l=president.active(s)[0]; if(l){ l.place=s.finished++; } s.over=true; return {ok:true,msg}; }
    const nextTurn=president.nextActive(s,s.turn);
    let closed=false;
    if(s.table && s.lastPlayer!=null){ const lp=s.players[s.lastPlayer];
      const need = lp.place===null ? president.active(s).length-1 : president.active(s).length;
      if(s.passes>=need) closed=true; }
    if(closed){ const lp=s.players[s.lastPlayer];
      s.turn = lp.place===null ? s.lastPlayer : president.nextActive(s,s.lastPlayer);
      s.table=null; s.passes=0; s.lastPlayer=null; msg+=' — nouveau pli'; }
    else s.turn=nextTurn;
    return {ok:true,msg};
  },
  isOver(s){ if(!s.over) return null;
    const order=s.players.slice().sort((a,b)=>a.place-b.place);
    return {over:true, text: order.map(p=>president.placeLabel(p.place,s.N)+' — '+p.name).join('<br>')}; },
  render(v,ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
    if(v.table){ const w=document.createElement('div'); w.style.cssText='display:flex;gap:8px'; v.table.cards.forEach(c=>w.appendChild(cardEl(c,{}))); ui.center(w); }
    else ui.center('<span style="opacity:.6">Pli vide — au meneur de jouer</span>');
    ui.say(v.myTurn?(v.table?('Posez '+v.needCount+' carte(s) plus fortes, ou passez.'):'Vous menez — posez ce que vous voulez.'):'');
    let sel=[];
    const draw=()=>{ const hand=document.createElement('div'); hand.className='hand';
      v.hand.forEach(card=>{ const el=cardEl(card,{onClick: v.myTurn?()=>{ if(sel.length&&sel[0].r!==card.r)sel=[]; const k=sel.indexOf(card); k>=0?sel.splice(k,1):sel.push(card); draw(); }:null, disabled:!v.myTurn});
        if(sel.includes(card)) el.classList.add('sel'); if(v.myTurn) el.classList.add('play'); hand.appendChild(el); });
      ui.hand(hand);
      const ok = sel.length && sel.every(c=>c.r===sel[0].r) && (v.table? (sel.length===v.needCount && PVAL[sel[0].r]>v.table.val) : true);
      ui.buttons(v.myTurn?[{id:'play',label:v.table?('Jouer '+sel.length):'Poser',primary:true},...(v.table?[{id:'pass',label:'Passer'}]:[])]:[], id=>{
        if(id==='pass') ui.send({type:'pass'});
        else if(ok) ui.send({type:'play',cards:sel.slice()});
      });
    };
    draw();
  },
};

/* ================= LE 8 LOCO (8 américain enrichi) ================= */
const huitloco={ id:'huitloco', label:'Le 8 loco', minP:2, maxP:4,
  deal(names){ const st=huit.deal(names); st.dir=1; st.pending=0; return st; },
  playable:huit.playable,
  nextIdx(s,from,steps){ let k=from; for(let x=0;x<steps;x++) k=(k+s.dir+s.players.length)%s.players.length; return k; },
  view(s,name){ const v=huit.view(s,name); v.game='huitloco'; v.pending=s.pending; v.dir=s.dir; return v; },
  apply(s,name,a){
    const i=s.players.findIndex(p=>p.name===name); if(i!==s.turn) return {ok:false}; const p=s.players[i]; const N=s.players.length;
    if(s.pending>0){
      if(a.type==='play'){ const k=p.hand.findIndex(c=>sameCard(c,a.card)); if(k<0||p.hand[k].r!=='2') return {ok:false};
        const c=p.hand.splice(k,1)[0]; s.pile.push(s.top); s.top=c; s.suit=c.s; s.pending+=2;
        if(p.hand.length===0){ s.over=true; s.winner=name; return {ok:true}; }
        s.turn=huitloco.nextIdx(s,i,1); return {ok:true,msg:name+' renvoie un 2 (+'+s.pending+')'}; }
      if(a.type==='draw'){ for(let x=0;x<s.pending;x++){ if(!s.deck.length){ if(s.pile.length>1){const t=s.pile.pop(); s.deck=shuffle(s.pile); s.pile=[t];} else break; } if(s.deck.length)p.hand.push(s.deck.shift()); }
        const took=s.pending; s.pending=0; s.turn=huitloco.nextIdx(s,i,1); return {ok:true,msg:name+' pioche '+took}; }
      return {ok:false};
    }
    if(a.type==='play'){ const k=p.hand.findIndex(c=>sameCard(c,a.card)); if(k<0) return {ok:false};
      if(!huit.playable(p.hand[k],s.top,s.suit)) return {ok:false};
      const c=p.hand.splice(k,1)[0]; s.pile.push(s.top); s.top=c; s.suit=(c.r==='8'&&a.suit)?a.suit:c.s;
      let skip=false; if(c.r==='2') s.pending+=2; else if(c.r==='V') skip=true; else if(c.r==='A'){ if(N>2)s.dir*=-1; else skip=true; }
      if(p.hand.length===0){ s.over=true; s.winner=name; return {ok:true}; }
      s.turn=huitloco.nextIdx(s,i,skip?2:1); s.drawn=false;
      return {ok:true,msg:name+' joue '+a.card.r+'\u2660'.replace('\u2660',{pique:'\u2660',coeur:'\u2665',carreau:'\u2666',trefle:'\u2663'}[a.card.s])}; }
    if(a.type==='draw'&&!s.drawn){ if(!s.deck.length){ if(s.pile.length<=1){ s.turn=huitloco.nextIdx(s,i,1); return {ok:true,msg:name+' passe'};} const t=s.pile.pop(); s.deck=shuffle(s.pile); s.pile=[t]; }
      const c=s.deck.shift(); p.hand.push(c); s.drawn=true;
      if(huit.playable(c,s.top,s.suit)) return {ok:true,msg:name+' pioche (jouable)'};
      s.turn=huitloco.nextIdx(s,i,1); s.drawn=false; return {ok:true,msg:name+' pioche et passe'}; }
    if(a.type==='pass'&&s.drawn){ s.turn=huitloco.nextIdx(s,i,1); s.drawn=false; return {ok:true,msg:name+' passe'}; }
    return {ok:false};
  },
  isOver:huit.isOver,
  render(v,ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
    const SC={pique:'\u2660',coeur:'\u2665',carreau:'\u2666',trefle:'\u2663'};
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;gap:16px;align-items:center;justify-content:center';
    wrap.appendChild(cardEl(v.top,{})); const su=document.createElement('div'); su.style.cssText='font-size:30px;'+((v.suit==='coeur'||v.suit==='carreau')?'color:#e06a5a':''); su.textContent=SC[v.suit]; wrap.appendChild(su);
    const dd=document.createElement('div'); dd.style.opacity='.7'; dd.textContent=v.dir>0?'⟳':'⟲'; wrap.appendChild(dd);
    const canDraw=v.myTurn && (v.pending>0 || !v.drawn);
    const draw=cardEl({r:'A',s:'pique'},{back:true,onClick:canDraw?()=>ui.send({type:'draw'}):null,disabled:!canDraw}); wrap.appendChild(draw);
    ui.center(wrap);
    ui.say(v.myTurn?(v.pending>0?('+'+v.pending+' en attente : posez un 2 ou piochez.'):'À vous !'):'');
    const hand=document.createElement('div'); hand.className='hand';
    v.hand.forEach(c=>{ const ok=v.myTurn && (v.pending>0? c.r==='2' : huit.playable(c,v.top,v.suit));
      const el=cardEl(c,{disabled:!ok,onClick:ok?(cc=>{ if(cc.r==='8'&&v.pending===0) ui.pickSuit(su2=>ui.send({type:'play',card:cc,suit:su2})); else ui.send({type:'play',card:cc}); }):null});
      if(ok) el.classList.add('play'); hand.appendChild(el); });
    ui.hand(hand);
    ui.buttons(v.myTurn&&v.drawn&&v.pending===0?[{id:'pass',label:'Passer'}]:[], ()=>ui.send({type:'pass'}));
  },
};

/* ================= LE POUILLEUX ================= */
function dropPairs(hand){ const by={}; hand.forEach(c=>(by[c.r]=by[c.r]||[]).push(c)); let rm=0;
  Object.values(by).forEach(l=>{ while(l.length>=2){ const a=l.pop(),b=l.pop(); hand.splice(hand.indexOf(a),1); hand.splice(hand.indexOf(b),1); rm++; } }); return rm; }
const pouilleux={ id:'pouilleux', label:'Le Pouilleux', minP:2, maxP:4,
  deal(names){ const deck=shuffle(deck52().filter(c=>!(c.r==='D'&&c.s==='trefle')));
    const players=names.map(n=>({name:n,hand:[],out:false}));
    let i=0; while(deck.length){ players[i%names.length].hand.push(deck.shift()); i++; }
    players.forEach(p=>{ dropPairs(p.hand); p.hand.sort((a,b)=>a.r>b.r?1:-1); if(p.hand.length===0)p.out=true; });
    const st={players, finished:[], turn:0, N:names.length};
    players.forEach((p,idx)=>{ if(p.out&&!st.finished.includes(idx))st.finished.push(idx); });
    while(st.players[st.turn].out) st.turn=(st.turn+1)%st.N;
    return st; },
  nextActive(s,from){ let k=(from+1)%s.N,h=0; while(s.players[k].out&&h<s.N){k=(k+1)%s.N;h++;} return k; },
  view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
    const srcIdx=pouilleux.nextActive(s,s.turn); const src=s.players[srcIdx];
    return {game:'pouilleux', myTurn:i===s.turn&&!p.out, hand:p.hand, out:p.out,
      srcName:src.name, srcCount:src.hand.length,
      players:s.players.map((q,j)=>({name:q.name,count:q.out?'✓':q.hand.length,turn:j===s.turn&&!q.out})) }; },
  apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name); if(i!==s.turn) return {ok:false}; const p=s.players[i];
    if(a.type!=='draw') return {ok:false};
    const srcIdx=pouilleux.nextActive(s,s.turn); const src=s.players[srcIdx];
    const idx=Math.max(0,Math.min(src.hand.length-1, a.index|0));
    const card=src.hand.splice(idx,1)[0]; if(!card) return {ok:false};
    p.hand.push(card); dropPairs(p.hand); p.hand.sort((a,b)=>a.r>b.r?1:-1);
    [i,srcIdx].forEach(k=>{ if(s.players[k].hand.length===0&&!s.players[k].out){ s.players[k].out=true; s.finished.push(k); } });
    const msg=name+' pioche chez '+src.name;
    const active=s.players.filter(p=>!p.out);
    if(active.length<=1){ s.over=true; return {ok:true,msg}; }
    s.turn=pouilleux.nextActive(s,s.turn); return {ok:true,msg};
  },
  isOver(s){ if(!s.over) return null; const loser=s.players.find(p=>!p.out);
    const order=s.finished.map(i=>s.players[i].name);
    return {over:true, text:'💩 '+(loser?loser.name:'?')+' garde le Pouilleux !<br>Sortis : '+order.join(', ')}; },
  render(v,ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
    const hand=document.createElement('div'); hand.className='hand';
    v.hand.forEach(c=> hand.appendChild(cardEl(c,{disabled:true}))); ui.hand(hand);
    if(v.myTurn){
      ui.say('Piochez une carte cachée chez '+v.srcName+'.');
      const w=document.createElement('div'); w.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:center';
      for(let k=0;k<v.srcCount;k++){ const b=cardEl({r:'A',s:'pique'},{back:true,onClick:()=>ui.send({type:'draw',index:k})}); w.appendChild(b); }
      ui.center(w);
    } else { ui.say(''); ui.center('<span style="opacity:.6">En attente…</span>'); }
    ui.buttons([],()=>{});
  },
};

/* ================= LE MATADOR (domino, bouts = 7) ================= */
const isMat=t=>(t.a+t.b===7)||(t.a===0&&t.b===0);
const matador={ id:'matador', label:'Le Matador', minP:2, maxP:4,
  deal(names){ const st=domino.deal(names); return st; },
  canPlay(t,E){ return isMat(t)||t.a===7-E||t.b===7-E; },
  playable(t,L,R){ return matador.canPlay(t,L)||matador.canPlay(t,R); },
  view(s,name){ const v=domino.view(s,name); v.game='matador'; return v; },
  apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name); if(i!==s.turn) return {ok:false}; const p=s.players[i]; const N=s.players.length;
    if(a.type==='play'){ const k=p.hand.findIndex(t=>t.a===a.tile.a&&t.b===a.tile.b); if(k<0) return {ok:false};
      const t=p.hand[k]; const side=a.side; const E=side==='R'?s.R:s.L; if(!matador.canPlay(t,E)) return {ok:false};
      p.hand.splice(k,1); let newEnd; if(t.a===7-E||t.b===7-E){ const conn=7-E; newEnd=(t.a===conn)?t.b:t.a; } else { newEnd=(a.expose!=null?a.expose:Math.min(t.a,t.b)); }
      if(side==='R'){ s.chain.push({a:E,b:newEnd}); s.R=newEnd; } else { s.chain.unshift({a:newEnd,b:E}); s.L=newEnd; }
      s.passes=0; s.drew=false; if(p.hand.length===0){ s.over=true; s.winner=name; return {ok:true}; }
      s.turn=(s.turn+1)%N; return {ok:true,msg:name+' pose le '+t.a+'-'+t.b}; }
    if(a.type==='draw'){ if(!s.yard.length) return {ok:false}; if(p.hand.some(t=>matador.playable(t,s.L,s.R))) return {ok:false};
      p.hand.push(s.yard.shift()); s.drew=true; return {ok:true,msg:name+' pioche'}; }
    if(a.type==='pass'){ if(s.yard.length||p.hand.some(t=>matador.playable(t,s.L,s.R))) return {ok:false};
      s.passes++; s.turn=(s.turn+1)%N; if(s.passes>=N){ s.over=true; s.blocked=true; } return {ok:true,msg:name+' passe'}; }
    return {ok:false}; },
  isOver:domino.isOver,
  render(v,ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
    const wrap=document.createElement('div'); wrap.style.width='100%';
    const board=document.createElement('div'); board.style.cssText='display:flex;align-items:center;gap:8px;width:100%';
    const bl=document.createElement('div'); bl.className='endbadge'; bl.innerHTML='<small>vise '+(7-v.L)+'</small>'+v.L;
    const ch=document.createElement('div'); ch.className='chain'; v.chain.forEach(t=>ch.appendChild(domTile(t)));
    const br=document.createElement('div'); br.className='endbadge'; br.innerHTML='<small>vise '+(7-v.R)+'</small>'+v.R;
    board.appendChild(bl); board.appendChild(ch); board.appendChild(br); wrap.appendChild(board);
    const yd=document.createElement('div'); yd.className='yard'; yd.textContent='Pioche : '+v.yard+' · bouts = 7 (matadors jokers)'; wrap.appendChild(yd);
    ui.center(wrap); requestAnimationFrame(()=>{ ch.scrollLeft=ch.scrollWidth; });
    const opts=v.hand.filter(t=>matador.playable(t,v.L,v.R));
    ui.say(v.myTurn?(opts.length?'À vous — la tuile + le bout doivent faire 7.':(v.yard?'Aucun coup — piochez.':'Bloqué — passez.')):'');
    const hand=document.createElement('div'); hand.className='hand';
    v.hand.forEach(t=>{ const ok=v.myTurn&&opts.includes(t);
      const el=domTile(t, ok?(()=>{
        const eR=matador.canPlay(t,v.R), eL=matador.canPlay(t,v.L);
        const finish=side=>{ const E=side==='R'?v.R:v.L; if(t.a===7-E||t.b===7-E||t.a===t.b) ui.send({type:'play',tile:t,side});
          else ui.choose([{id:'a',label:'Exposer '+t.a},{id:'b',label:'Exposer '+t.b}], id=>ui.send({type:'play',tile:t,side,expose:id==='a'?t.a:t.b})); };
        if(eR&&eL&&v.L!==v.R) ui.choose([{id:'L',label:'◀ Gauche ('+v.L+')'},{id:'R',label:'Droite ('+v.R+') ▶'}], s=>finish(s));
        else finish(eR?'R':'L');
      }):null);
      if(ok) el.classList.add('play'); hand.appendChild(el); });
    ui.hand(hand);
    let btns=[]; if(v.myTurn&&!opts.length){ btns=v.yard?[{id:'draw',label:'Piocher'}]:[{id:'pass',label:'Passer'}]; }
    ui.buttons(btns, id=>ui.send({type:id}));
  },
};

window.NetGames={ huit, huitloco, president, pouilleux, domino, matador,
  list:[huit, huitloco, president, pouilleux, domino, matador] };
})();
