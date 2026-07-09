'use strict';
/* Modules réseau, lot 3 (final) : Dame de pique, Train mexicain, Rami, Tarot. */
(function(){
const NG=window.NetGames; if(!NG) return;
const shuffle=d=>{ for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; };
const SUITS=['pique','coeur','carreau','trefle'], RANKS=['A','2','3','4','5','6','7','8','9','10','V','D','R'];
const SCH={pique:'\u2660',coeur:'\u2665',carreau:'\u2666',trefle:'\u2663'};
function deck52(){ const d=[]; SUITS.forEach(s=>RANKS.forEach(r=>d.push({r,s}))); return d; }
const sameC=(a,b)=>a&&b&&a.r===b.r&&a.s===b.s;
function cEl(c,opts){ opts=opts||{};
  if(window.Cards&&!opts.back) return Cards.el(c,{onClick:opts.onClick,disabled:opts.disabled});
  const b=document.createElement('button');
  b.className='pcard'+(opts.back?' back':((c&&(c.s==='coeur'||c.s==='carreau'))?' red':''));
  if(opts.back) b.innerHTML='<span class="st">\ud83c\udfb2</span>';
  else b.innerHTML='<span class="rk">'+(c.r||'')+'</span><span class="st">'+(SCH[c.s]||'')+'</span>';
  if(opts.onClick&&!opts.disabled) b.addEventListener('click',()=>opts.onClick(c)); else b.disabled=true;
  return b; }
const esc=s=>String(s).replace(/[<>&]/g,ch=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[ch]));
function trickBox(trick, names, winIdx){
  const w=document.createElement('div'); w.className='trick';
  trick.forEach((t,i)=>{ const s=document.createElement('div'); s.className='slot'+(winIdx===i?' win':'');
    const nm=document.createElement('div'); nm.className='nm'; nm.textContent=names[t.by];
    s.appendChild(cEl(t.card,{})); s.appendChild(nm); w.appendChild(s); });
  return w; }

/* ================= LA DAME DE PIQUE (Hearts) ================= */
const hearts=(function(){
  const RV={A:14,R:13,D:12,V:11,'10':10,'9':9,'8':8,'7':7,'6':6,'5':5,'4':4,'3':3,'2':2};
  const hpen=c=> c.s==='coeur'?1:(c.s==='pique'&&c.r==='D'?13:0);
  const ftf=(cards,first)=>{ if(!first) return cards; const s=cards.filter(c=>hpen(c)===0); return s.length?s:cards; };
  function hlegal(hand,trick,broken,first){
    if(trick.length){ const led=trick[0].card.s; const f=hand.filter(c=>c.s===led);
      return ftf(f.length?f:hand.slice(), first); }
    if(first){ const two=hand.find(c=>c.s==='trefle'&&c.r==='2'); if(two) return [two]; }
    let base=hand.slice();
    if(!broken){ const nh=base.filter(c=>c.s!=='coeur'); if(nh.length) base=nh; }
    return base; }
  function winnerOf(trick){ const led=trick[0].card.s; let b=trick[0];
    trick.forEach(t=>{ if(t.card.s===led && RV[t.card.r]>RV[b.card.r]) b=t; }); return trick.indexOf(b); }
  function startHand(s){
    const deck=shuffle(deck52());
    s.players.forEach((p,i)=>{ p.hand=deck.slice(i*13,i*13+13); p.taken=0; });
    s.trick=[]; s.lastTrick=null; s.broken=false; s.first=true;
    s.turn=s.players.findIndex(p=>p.hand.some(c=>c.s==='trefle'&&c.r==='2')); if(s.turn<0)s.turn=0; }
  return { id:'hearts', label:'La Dame de pique', minP:4, maxP:4, family:'cards',
    deal(names){ const s={players:names.map(n=>({name:n})), totals:names.map(()=>0)}; startHand(s); return s; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
      return {game:'hearts', trick:s.trick, lastTrick:s.lastTrick, broken:s.broken, first:s.first,
        myTurn:i===s.turn && !s.over, hand:p.hand,
        legal: i===s.turn? hlegal(p.hand,s.trick,s.broken,s.first):[],
        totals:s.totals, names:s.players.map(q=>q.name),
        players:s.players.map((q,j)=>({name:q.name,count:q.hand.length,taken:q.taken,total:s.totals[j],turn:j===s.turn}))}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
      if(i!==s.turn || a.type!=='play' || s.over) return {ok:false};
      const p=s.players[i];
      const k=p.hand.findIndex(c=>sameC(c,a.card)); if(k<0) return {ok:false};
      if(!hlegal(p.hand,s.trick,s.broken,s.first).some(c=>sameC(c,a.card))) return {ok:false};
      const c=p.hand.splice(k,1)[0];
      if(c.s==='coeur') s.broken=true;
      s.trick.push({card:c,by:i});
      let msg=name+' joue '+c.r+SCH[c.s];
      if(s.trick.length<4){ s.turn=(s.turn+1)%4; return {ok:true,msg}; }
      const w=winnerOf(s.trick); const wi=s.trick[w].by;
      const pts=s.trick.reduce((t,x)=>t+hpen(x.card),0);
      s.players[wi].taken+=pts;
      s.lastTrick={trick:s.trick, win:w};
      s.trick=[]; s.first=false; s.turn=wi;
      msg=s.players[wi].name+' ramasse le pli'+(pts?' (+'+pts+')':'');
      if(s.players.every(q=>q.hand.length===0)){
        const moon=s.players.find(q=>q.taken===26);
        if(moon){ s.players.forEach((q,j)=>{ if(q!==moon) s.totals[j]+=26; }); msg='🌙 '+moon.name+' réussit la LUNE !'; }
        else s.players.forEach((q,j)=> s.totals[j]+=q.taken);
        if(s.totals.some(t=>t>=50)){ s.over=true; }
        else { startHand(s); msg+=' — nouvelle donne.'; }
      }
      return {ok:true,msg}; },
    isOver(s){ if(!s.over) return null;
      const order=s.players.map((p,i)=>({n:p.name,t:s.totals[i]})).sort((a,b)=>a.t-b.t);
      return {over:true,text:'🏆 '+order[0].n+' gagne (plus petit score) !<br>'+order.map(o=>o.n+' : '+o.t+' pts').join('<br>')}; },
    render(v,ui){
      ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count+' 🂠 · '+p.total+(p.taken?(' (+'+p.taken+')'):''),turn:p.turn})));
      const w=document.createElement('div'); w.style.width='100%';
      if(v.trick.length) w.appendChild(trickBox(v.trick, v.names, -1));
      else if(v.lastTrick) w.appendChild(trickBox(v.lastTrick.trick, v.names, v.lastTrick.win));
      else { const d=document.createElement('div'); d.style.cssText='text-align:center;opacity:.6'; d.textContent='Pli vide — au meneur.'; w.appendChild(d); }
      ui.center(w);
      ui.say(v.myTurn?(v.trick.length?('Suivez '+SCH[v.trick[0].card.s]+' si possible.'):'À vous d\u2019entamer'+(v.broken?'.':' (pas cœur tant que non ouvert).')):'');
      const hand=document.createElement('div'); hand.className='hand';
      v.hand.forEach(c=>{ const ok=v.myTurn && v.legal.some(x=>sameC(x,c));
        const el=cEl(c,{disabled:!ok,onClick: ok?(cc=>ui.send({type:'play',card:cc})):null});
        if(ok) el.classList.add('play'); hand.appendChild(el); });
      ui.hand(hand); ui.buttons([],()=>{});
    } };
})();

/* ================= LE TRAIN MEXICAIN ================= */
const train=(function(){
  const pip=t=>t.a+t.b;
  const label=(tr,names)=> tr.owner==='mex'?'🚂 Mexicain':names[tr.owner];
  function legalTrains(s,tile,me){ return s.trains.map((tr,i)=>i).filter(i=>{ const tr=s.trains[i];
    return (tr.owner===me||tr.owner==='mex'||tr.open) && (tile.a===tr.end||tile.b===tr.end); }); }
  const canAny=(s,me)=> s.players[me].hand.some(t=>legalTrains(s,t,me).length>0);
  function endTurn(s){ s.turn=(s.turn+1)%s.players.length; s.drew=false; s.played=false; s.afterDouble=false; }
  return { id:'train', label:'Le Train mexicain', minP:2, maxP:4, family:'domino',
    deal(names){ const set=[]; for(let a=0;a<=6;a++)for(let b=a;b<=6;b++) if(!(a===6&&b===6)) set.push({a,b});
      shuffle(set); const N=names.length; const per=N===2?8:(N===3?7:6);
      const players=names.map(n=>({name:n, hand:set.splice(0,per)}));
      const trains=[]; for(let i=0;i<N;i++) trains.push({owner:i,tiles:[],end:6,open:false});
      trains.push({owner:'mex',tiles:[],end:6,open:true});
      return {players, yard:set, trains, turn:0, drew:false, played:false, afterDouble:false, passes:0}; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
      return {game:'train', trains:s.trains, yard:s.yard.length, myTurn:i===s.turn && !s.over,
        me:i, hand:p.hand, drew:s.drew, afterDouble:s.afterDouble, canAny: i===s.turn? canAny(s,i):false,
        names:s.players.map(q=>q.name),
        players:s.players.map((q,j)=>({name:q.name,count:q.hand.length,turn:j===s.turn}))}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
      if(i!==s.turn || s.over) return {ok:false};
      const p=s.players[i]; const N=s.players.length;
      if(a.type==='play'){
        const k=p.hand.findIndex(t=>t.a===a.tile.a&&t.b===a.tile.b); if(k<0) return {ok:false};
        const t=p.hand[k];
        if(!legalTrains(s,t,i).includes(a.ti)) return {ok:false};
        const tr=s.trains[a.ti];
        const conn=(t.a===tr.end)?t.a:t.b; const other=(t.a===conn)?t.b:t.a;
        tr.tiles.push({a:conn,b:other}); tr.end=other;
        if(tr.owner===i) tr.open=false;
        p.hand.splice(k,1); s.played=true; s.passes=0;
        let msg=name+' pose le '+t.a+'-'+t.b+' sur '+(tr.owner==='mex'?'le Mexicain':(tr.owner===i?'son train':'le train de '+s.players[tr.owner].name));
        if(p.hand.length===0){ s.over=true; s.winner=name; return {ok:true,msg}; }
        if(t.a===t.b){ s.afterDouble=true; return {ok:true,msg:msg+' — double, il rejoue !'}; }
        endTurn(s); return {ok:true,msg}; }
      if(a.type==='draw'){
        if(canAny(s,i) || s.drew || s.afterDouble || !s.yard.length) return {ok:false};
        p.hand.push(s.yard.shift()); s.drew=true; return {ok:true,msg:name+' pioche'}; }
      if(a.type==='pass'){
        if(canAny(s,i)) return {ok:false};
        if(!s.drew && !s.afterDouble && s.yard.length) return {ok:false};
        const mine=s.trains.find(tr=>tr.owner===i); if(mine) mine.open=true;
        const noPlay=!s.played;
        if(noPlay) s.passes++; else s.passes=0;
        endTurn(s);
        if(s.passes>=N){ s.over=true; s.blocked=true; }
        return {ok:true,msg:name+' passe — son train s\u2019ouvre 🔓'}; }
      return {ok:false}; },
    isOver(s){ if(!s.over) return null;
      if(s.blocked){ const sc=s.players.map(p=>({n:p.name,v:p.hand.reduce((a,t)=>a+pip(t),0)})).sort((a,b)=>a.v-b.v);
        return {over:true,text:'Plus personne ne peut jouer — '+sc[0].n+' gagne :<br>'+sc.map(x=>x.n+' : '+x.v+' pts').join('<br>')}; }
      return {over:true,text:'🚂 '+s.winner+' vide son jeu — terminus !'}; },
    render(v,ui){
      ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
      function drawTrains(targetSet,onPick){
        const wrap=document.createElement('div'); wrap.style.width='100%';
        const hub=document.createElement('div'); hub.className='hub'; hub.innerHTML='Moteur : <b>6-6</b> · Pioche : '+v.yard;
        const list=document.createElement('div'); list.className='trains';
        v.trains.forEach((tr,ti)=>{ const row=document.createElement('div');
          row.className='train'+(tr.owner===v.me?' mine':'')+(tr.owner==='mex'?' mex':'')+((targetSet&&targetSet.has(ti))?' target':'');
          const lab=document.createElement('div'); lab.className='tlabel';
          lab.innerHTML=esc(label(tr,v.names))+(tr.open&&tr.owner!=='mex'?' 🔓':'')+(tr.owner===v.me?' (vous)':'');
          const end=document.createElement('div'); end.className='tend'; end.textContent=tr.end;
          const tt=document.createElement('div'); tt.className='ttiles';
          if(tr.tiles.length) tr.tiles.forEach(t=> tt.appendChild(window.Dominos? Dominos.el(t,{}) : Object.assign(document.createElement('span'),{textContent:t.a+'·'+t.b})));
          else { const e=document.createElement('span'); e.className='empty'; e.textContent='(vide)'; tt.appendChild(e); }
          row.appendChild(lab); row.appendChild(end); row.appendChild(tt);
          if(targetSet&&targetSet.has(ti)&&onPick) row.addEventListener('click',()=>onPick(ti));
          list.appendChild(row);
          requestAnimationFrame(()=>{ tt.scrollLeft=tt.scrollWidth; }); });
        wrap.appendChild(hub); wrap.appendChild(list); ui.center(wrap); }
      drawTrains(null,null);
      const playableTiles = v.myTurn? v.hand.filter(t=>{
        return v.trains.some((tr,ti)=> (tr.owner===v.me||tr.owner==='mex'||tr.open)&&(t.a===tr.end||t.b===tr.end)); }) : [];
      ui.say(v.myTurn? (v.afterDouble?'Double joué — rejouez si possible !' :
        (playableTiles.length?'Touchez une tuile jouable.':(v.drew||!v.yard?'Aucun coup — passez (votre train s\u2019ouvre).':'Aucun coup — piochez.'))) : '');
      const hand=document.createElement('div'); hand.className='hand';
      v.hand.forEach(t=>{ const ok=v.myTurn&&playableTiles.includes(t);
        const el=window.Dominos? Dominos.el(t,{onClick: ok?(()=>{
          const trs=v.trains.map((tr,ti)=>ti).filter(ti=>{ const tr=v.trains[ti];
            return (tr.owner===v.me||tr.owner==='mex'||tr.open)&&(t.a===tr.end||t.b===tr.end); });
          if(trs.length===1) ui.send({type:'play',tile:t,ti:trs[0]});
          else { ui.say('Sur quel train ? (touchez-le)'); drawTrains(new Set(trs), ti=>ui.send({type:'play',tile:t,ti})); }
        }):null, disabled:!ok}) : Object.assign(document.createElement('span'),{textContent:t.a+'·'+t.b});
        if(ok) el.classList.add('play'); hand.appendChild(el); });
      ui.hand(hand);
      let btns=[];
      if(v.myTurn && !playableTiles.length){
        btns = (v.drew||!v.yard||v.afterDouble)? [{id:'pass',label:'Passer 🔓'}] : [{id:'draw',label:'Piocher'}]; }
      ui.buttons(btns, id=>ui.send({type:id}));
    } };
})();

/* ================= LE RAMI ================= */
const rami=(function(){
  const RV={A:1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,V:11,D:12,R:13};
  const dwVal=c=> c.r==='A'?1:(RV[c.r]>=10?10:RV[c.r]);
  function isSet(cs){ if(cs.length<3||cs.length>4) return false; const r=cs[0].r;
    if(!cs.every(c=>c.r===r)) return false; return new Set(cs.map(c=>c.s)).size===cs.length; }
  function isRun(cs){ if(cs.length<3) return false; const s0=cs[0].s;
    if(!cs.every(c=>c.s===s0)) return false; const vs=cs.map(c=>RV[c.r]).sort((a,b)=>a-b);
    for(let i=1;i<vs.length;i++) if(vs[i]!==vs[i-1]+1) return false; return true; }
  const isMeld=cs=> isSet(cs)||isRun(cs);
  function canExtend(meld,card){ if(isSet(meld)) return meld[0].r===card.r&&!meld.some(c=>c.s===card.s)&&meld.length<4;
    if(isRun(meld)){ if(card.s!==meld[0].s) return false; const vs=meld.map(c=>RV[c.r]);
      const mn=Math.min(...vs),mx=Math.max(...vs); return RV[card.r]===mn-1||RV[card.r]===mx+1; } return false; }
  function pushRuns(res,run){ for(let len=run.length;len>=3;len--) for(let i=0;i+len<=run.length;i++) res.push(run.slice(i,i+len)); }
  function findMelds(cards){ const res=[]; const byR={}; cards.forEach(c=>(byR[c.r]=byR[c.r]||[]).push(c));
    Object.values(byR).forEach(g=>{ const u=[],seen=new Set(); g.forEach(c=>{ if(!seen.has(c.s)){seen.add(c.s);u.push(c);} }); if(u.length>=3) res.push(u.slice(0,4)); });
    const byS={}; cards.forEach(c=>(byS[c.s]=byS[c.s]||[]).push(c));
    Object.values(byS).forEach(g=>{ const u=[],seen=new Set(); g.forEach(c=>{ if(!seen.has(RV[c.r])){seen.add(RV[c.r]);u.push(c);} }); u.sort((a,b)=>RV[a.r]-RV[b.r]);
      let run=[u[0]]; for(let i=1;i<u.length;i++){ if(RV[u[i].r]===RV[u[i-1].r]+1) run.push(u[i]); else { if(run.length>=3) pushRuns(res,run); run=[u[i]]; } } if(run.length>=3) pushRuns(res,run); });
    let cand=res.filter(isMeld); cand.sort((a,b)=>b.length-a.length);
    const used=new Set(),ch=[]; const k=c=>c.r+c.s;
    for(const m of cand){ if(m.some(c=>used.has(k(c)))) continue; m.forEach(c=>used.add(k(c))); ch.push(m); } return ch; }
  function dwSum(cards){ const m=findMelds(cards),u=new Set(); m.forEach(x=>x.forEach(c=>u.add(c.r+c.s)));
    return cards.filter(c=>!u.has(c.r+c.s)).reduce((s,c)=>s+dwVal(c),0); }
  const sortRun=m=>{ if(isRun(m)) m.sort((a,b)=>RV[a.r]-RV[b.r]); return m; };
  function endPoints(s){ s.over=true; s.byStock=true;
    s.result=s.players.map(p=>({n:p.name,d:dwSum(p.hand)})).sort((a,b)=>a.d-b.d); }
  return { id:'rami', label:'Le Rami', minP:2, maxP:4, family:'cards',
    _t:{isMeld,canExtend,findMelds},
    deal(names){ const stock=shuffle(deck52()); const per=names.length===2?10:7;
      const players=names.map(n=>({name:n, hand:stock.splice(0,per)}));
      return {players, stock, discard:[stock.shift()], melds:[], turn:0, phase:'draw'}; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
      const canLay = p.hand.some(c=>s.melds.some(m=>canExtend(m,c)));
      return {game:'rami', discardTop:s.discard[s.discard.length-1]||null, stock:s.stock.length,
        melds:s.melds, myTurn:i===s.turn && !s.over, phase:s.phase, hand:p.hand, canLay,
        players:s.players.map((q,j)=>({name:q.name,count:q.hand.length,turn:j===s.turn}))}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
      if(i!==s.turn || s.over) return {ok:false};
      const p=s.players[i]; const N=s.players.length;
      const rm=c=>{ const k=p.hand.findIndex(x=>sameC(x,c)); if(k<0) return false; p.hand.splice(k,1); return true; };
      if(a.type==='draw'){ if(s.phase!=='draw') return {ok:false};
        if(a.src==='discard'){ if(!s.discard.length) return {ok:false}; p.hand.push(s.discard.pop()); s.phase='act'; return {ok:true,msg:name+' prend la défausse'}; }
        if(!s.stock.length){ endPoints(s); return {ok:true,msg:'Pioche épuisée — on compte.'}; }
        p.hand.push(s.stock.shift()); s.phase='act'; return {ok:true,msg:name+' pioche'}; }
      if(s.phase!=='act') return {ok:false};
      if(a.type==='meld'){ const cards=a.cards||[];
        for(const c of cards){ if(!p.hand.some(x=>sameC(x,c))) return {ok:false}; }
        if(!isMeld(cards)) return {ok:false};
        cards.forEach(c=>rm(c)); s.melds.push(sortRun(cards.slice()));
        const msg=name+' pose '+(isRun(cards)?'une suite':'un brelan')+' !';
        if(p.hand.length===0){ s.over=true; s.winner=name; }
        return {ok:true,msg}; }
      if(a.type==='layoff'){ let any=false,ch=true;
        while(ch){ ch=false; for(const c of [...p.hand]){ for(const m of s.melds){ if(canExtend(m,c)){ m.push(c); sortRun(m); rm(c); ch=true; any=true; break; } } } }
        if(!any) return {ok:false};
        const msg=name+' étale des cartes.';
        if(p.hand.length===0){ s.over=true; s.winner=name; }
        return {ok:true,msg}; }
      if(a.type==='discard'){ if(!p.hand.some(x=>sameC(x,a.card))) return {ok:false};
        rm(a.card); s.discard.push(a.card);
        let msg=name+' défausse '+a.card.r+SCH[a.card.s];
        if(p.hand.length===0){ s.over=true; s.winner=name; return {ok:true,msg}; }
        if(!s.stock.length){ endPoints(s); return {ok:true,msg:msg+' — pioche épuisée, on compte.'}; }
        s.turn=(s.turn+1)%N; s.phase='draw'; return {ok:true,msg}; }
      return {ok:false}; },
    isOver(s){ if(!s.over) return null;
      if(s.byStock) return {over:true,text:'Pioche épuisée — le plus petit total gagne :<br>'+s.result.map(x=>x.n+' : '+x.d+' pts en main').join('<br>')};
      return {over:true,text:'🏆 '+s.winner+' vide sa main — Rami !'}; },
    render(v,ui){
      ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
      const wrap=document.createElement('div'); wrap.style.width='100%';
      const top=document.createElement('div'); top.style.cssText='display:flex;gap:18px;justify-content:center;align-items:flex-start';
      const sb=document.createElement('div'); sb.style.textAlign='center';
      const stk=cEl({r:'A',s:'pique'},{back:true, onClick:(v.myTurn&&v.phase==='draw')?()=>ui.send({type:'draw',src:'stock'}):null,
        disabled:!(v.myTurn&&v.phase==='draw')});
      sb.appendChild(stk); const sl=document.createElement('div'); sl.style.cssText='font-size:12px;opacity:.6'; sl.textContent='Pioche ('+v.stock+')'; sb.appendChild(sl);
      const db=document.createElement('div'); db.style.textAlign='center';
      if(v.discardTop){ db.appendChild(cEl(v.discardTop,{onClick:(v.myTurn&&v.phase==='draw')?()=>ui.send({type:'draw',src:'discard'}):null,
        disabled:!(v.myTurn&&v.phase==='draw')})); }
      const dl=document.createElement('div'); dl.style.cssText='font-size:12px;opacity:.6'; dl.textContent='Défausse'; db.appendChild(dl);
      top.appendChild(sb); top.appendChild(db); wrap.appendChild(top);
      if(v.melds.length){ const mc=document.createElement('div'); mc.className='melds';
        v.melds.forEach(m=>{ const row=document.createElement('div'); row.className='meld';
          m.forEach(c=> row.appendChild(cEl(c,{}))); mc.appendChild(row); });
        wrap.appendChild(mc); }
      ui.center(wrap);
      if(!v.myTurn){ ui.say(''); drawHand([],null); ui.buttons([],()=>{}); return; }
      if(v.phase==='draw'){ ui.say('Piochez : la pile ou la défausse.'); drawHand([],null); ui.buttons([],()=>{}); return; }
      let sel=[];
      function drawHand(selArr,onPick){ const hand=document.createElement('div'); hand.className='hand';
        v.hand.forEach(c=>{ const el=cEl(c,{onClick:onPick?(()=>onPick(c)):null, disabled:!onPick});
          if(selArr.some(x=>sameC(x,c))) el.classList.add('sel'); if(onPick) el.classList.add('play'); hand.appendChild(el); });
        ui.hand(hand); }
      function refresh(){ drawHand(sel, c=>{ const k=sel.findIndex(x=>sameC(x,c)); k>=0?sel.splice(k,1):sel.push(c); refresh(); });
        const meldOK=isMeld(sel);
        ui.buttons([
          {id:'meld',label:'Poser'+(sel.length?(' ('+sel.length+')'):'')},
          {id:'layoff',label:'Étaler'},
          {id:'discard',label:'Défausser',primary:true},
        ], id=>{
          if(id==='meld'){ if(meldOK) ui.send({type:'meld',cards:sel.slice()}); }
          else if(id==='layoff'){ if(v.canLay) ui.send({type:'layoff'}); }
          else if(id==='discard'){ if(sel.length===1) ui.send({type:'discard',card:sel[0]});
            else ui.say('Sélectionnez UNE carte à défausser.'); }
        }); }
      ui.say('Posez (brelan/suite ≥3), étalez, puis défaussez (1 carte sélectionnée).');
      refresh();
    } };
})();

/* ================= LE TAROT ================= */
const tarot=(function(){
  const RANKS_T=['A','2','3','4','5','6','7','8','9','10','V','C','D','R'];
  const SR={A:1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,V:11,C:12,D:13,R:14};
  function deck78(){ const d=[]; SUITS.forEach(s=>RANKS_T.forEach(r=>d.push({r,s})));
    for(let n=1;n<=21;n++) d.push({atout:n}); d.push({excuse:true}); return d; }
  const isTrump=c=>!!c.atout;
  const tpts=c=>{ if(c.excuse)return 4.5; if(c.atout)return (c.atout===21||c.atout===1)?4.5:0.5;
    return {R:4.5,D:3.5,C:2.5,V:1.5}[c.r]||0.5; };
  const sameT=(a,b)=> a&&b && ((a.excuse&&b.excuse) || (a.atout&&a.atout===b.atout) || (!a.atout&&!a.excuse&&!b.atout&&!b.excuse&&a.r===b.r&&a.s===b.s));
  const ledOf=trick=>{ for(const t of trick){ if(!t.card.excuse) return t.card; } return null; };
  function legalMoves(hand,trick){
    const excuse=hand.filter(c=>c.excuse), led=ledOf(trick), nonExc=hand.filter(c=>!c.excuse);
    let base;
    if(!led){ base=nonExc.slice(); }
    else if(isTrump(led)){ const tr=hand.filter(isTrump);
      if(tr.length){ const hi=Math.max(...trick.filter(t=>isTrump(t.card)).map(t=>t.card.atout));
        const h=tr.filter(c=>c.atout>hi); base=h.length?h:tr; } else base=nonExc.slice();
    } else { const suit=hand.filter(c=>!c.excuse&&!c.atout&&c.s===led.s);
      if(suit.length) base=suit;
      else { const tr=hand.filter(isTrump);
        if(tr.length){ const pl=trick.filter(t=>isTrump(t.card)).map(t=>t.card.atout);
          if(pl.length){ const hi=Math.max(...pl); const h=tr.filter(c=>c.atout>hi); base=h.length?h:tr; }
          else base=tr; } else base=nonExc.slice(); } }
    return base.concat(excuse); }
  function trickWinner(trick){ const led=ledOf(trick), trumps=trick.filter(t=>isTrump(t.card));
    if(trumps.length){ let b=trumps[0]; trumps.forEach(t=>{ if(t.card.atout>b.card.atout)b=t; }); return trick.indexOf(b); }
    let b=null; trick.forEach(t=>{ if(!t.card.excuse&&t.card.s===led.s){ if(!b||SR[t.card.r]>SR[b.card.r])b=t; } });
    return trick.indexOf(b); }
  const fmt=x=> (Math.round(x*2)/2).toString().replace('.5','\u00bd');
  const tLabel=c=> c.excuse?'l\u2019Excuse':(c.atout?('l\u2019atout '+c.atout):(c.r+SCH[c.s]));
  return { id:'tarot', label:'Le Tarot', minP:4, maxP:4, family:'tarot',
    deal(names){ const deck=shuffle(deck78());
      const players=names.map(n=>({name:n,hand:[],pts:0}));
      for(let i=0;i<72;i++) players[i%4].hand.push(deck[i]);
      return {players, dog:deck.slice(72), trick:[], lastTrick:null, turn:0, tricksDone:0}; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
      return {game:'tarot', trick:s.trick, lastTrick:s.lastTrick, myTurn:i===s.turn && !s.over,
        hand:p.hand, legal: i===s.turn? legalMoves(p.hand,s.trick):[],
        names:s.players.map(q=>q.name), dog:s.dog.length, tricksDone:s.tricksDone,
        players:s.players.map((q,j)=>({name:q.name,count:q.hand.length,pts:fmt(q.pts),turn:j===s.turn}))}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
      if(i!==s.turn || a.type!=='play' || s.over) return {ok:false};
      const p=s.players[i];
      const k=p.hand.findIndex(c=>sameT(c,a.card)); if(k<0) return {ok:false};
      if(!legalMoves(p.hand,s.trick).some(c=>sameT(c,a.card))) return {ok:false};
      const c=p.hand.splice(k,1)[0];
      s.trick.push({card:c,by:i});
      let msg=name+' joue '+tLabel(c);
      if(s.trick.length<4){ s.turn=(s.turn+1)%4; return {ok:true,msg}; }
      const w=trickWinner(s.trick); const wi=s.trick[w].by;
      s.trick.forEach(t=>{ if(t.card.excuse) s.players[t.by].pts+=tpts(t.card);
        else s.players[wi].pts+=tpts(t.card); });
      s.lastTrick={trick:s.trick, win:w};
      s.trick=[]; s.turn=wi; s.tricksDone++;
      msg='Pli pour '+s.players[wi].name+'.';
      if(s.tricksDone>=18){
        const dogPts=s.dog.reduce((t,cc)=>t+tpts(cc),0);
        s.players[wi].pts+=dogPts;
        msg+=' Il ramasse le chien ('+fmt(dogPts)+' pts).';
        s.over=true; }
      return {ok:true,msg}; },
    isOver(s){ if(!s.over) return null;
      const order=s.players.map(p=>({n:p.name,v:p.pts})).sort((a,b)=>b.v-a.v);
      return {over:true,text:'🏆 '+order[0].n+' gagne !<br>'+order.map(o=>o.n+' : '+fmt(o.v)+' pts').join('<br>')+'<br><small style="opacity:.6">(91 points en jeu)</small>'}; },
    render(v,ui){
      ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count+' 🂠 · '+p.pts+' pts',turn:p.turn})));
      const w=document.createElement('div'); w.style.width='100%';
      if(v.trick.length) w.appendChild(trickBox(v.trick,v.names,-1));
      else if(v.lastTrick) w.appendChild(trickBox(v.lastTrick.trick,v.names,v.lastTrick.win));
      else { const d=document.createElement('div'); d.style.cssText='text-align:center;opacity:.6';
        d.textContent='Pli '+(v.tricksDone+1)+'/18 — au meneur (chien : '+v.dog+' cartes au dernier pli).'; w.appendChild(d); }
      ui.center(w);
      ui.say(v.myTurn?(v.trick.length?'Suivez, coupez (en montant) — l\u2019Excuse est toujours jouable.':'À vous d\u2019entamer.'):'');
      const hand=document.createElement('div'); hand.className='hand';
      v.hand.forEach(c=>{ const ok=v.myTurn && v.legal.some(x=>sameT(x,c));
        const el=cEl(c,{disabled:!ok,onClick: ok?(cc=>ui.send({type:'play',card:cc})):null});
        if(ok) el.classList.add('play'); hand.appendChild(el); });
      ui.hand(hand); ui.buttons([],()=>{});
    } };
})();

/* ---- enregistrement ---- */
const add=[hearts,tarot,rami,train];
add.forEach(m=>{ NG[m.id]=m; NG.list.push(m); });
})();
