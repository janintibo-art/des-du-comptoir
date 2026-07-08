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

window.NetGames={ huit, domino, list:[huit, domino] };
})();
