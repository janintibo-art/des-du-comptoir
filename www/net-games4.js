'use strict';
/* Module réseau : MEXICO (dés, 2-4 joueurs). Hôte = autorité (lancers côté hôte). */
(function(){
const NG=window.NetGames; if(!NG) return;
function mex(v1,v2){ const hi=Math.max(v1,v2), lo=Math.min(v1,v2);
  if(hi===2&&lo===1) return {rank:10000,name:'MEXICO ! (21)'};
  if(v1===v2) return {rank:1000+v1,name:'Double '+v1};
  return {rank:hi*10+lo,name:''+(hi*10+lo)}; }
const PIPS={1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],
  4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
  6:[[28,25],[72,25],[28,50],[72,50],[28,75],[72,75]]};

const mexico={
  id:'mexico', label:'Le Mexico', minP:2, maxP:4, family:'none',
  _startRound(s){
    const aliveIdx=s.players.map((p,i)=>i).filter(i=>s.players[i].vies>0);
    let li=aliveIdx.indexOf(s.leader); if(li<0) li=0;
    s.order=aliveIdx.slice(li).concat(aliveIdx.slice(0,li));
    s.idx=0; s.results=[]; s.leaderThrows=null;
    s.throws=0; s.roll=null; s.cur=null; s.msg=null;
  },
  deal(names){ const s={players:names.map(n=>({name:n,vies:3})), leader:0}; mexico._startRound(s); return s; },
  _finishCur(s){
    const pi=s.order[s.idx];
    s.results.push({pi, rank:s.cur.rank, name:s.cur.name});
    if(s.idx===0) s.leaderThrows=s.throws;
    s.idx++;
    if(s.idx>=s.order.length){ mexico._resolve(s); return; }
    s.throws=0; s.roll=null; s.cur=null;
  },
  _resolve(s){
    const minRank=Math.min(...s.results.map(r=>r.rank));
    const bestRank=Math.max(...s.results.map(r=>r.rank));
    const losers=s.results.filter(r=>r.rank===minRank);
    if(losers.length>1){ s.msg='Égalité au plus bas — on rejoue la manche.'; mexico._startRound(s); return; }
    const loser=losers[0]; const mult=(bestRank===10000)?2:1;
    s.players[loser.pi].vies=Math.max(0,s.players[loser.pi].vies-mult);
    s.msg=s.players[loser.pi].name+' perd '+mult+' vie'+(mult>1?'s (Mexico !)':'')+'.';
    const aliveIdx=s.players.map((p,i)=>i).filter(i=>s.players[i].vies>0);
    if(aliveIdx.length<=1){ s.over=true; s.winner=aliveIdx.length?s.players[aliveIdx[0]].name:'—'; return; }
    // le perdant mène ; s'il est éliminé, le prochain vivant après lui
    let nl=loser.pi; if(s.players[nl].vies<=0){ for(let k=1;k<=s.players.length;k++){ const c=(loser.pi+k)%s.players.length; if(s.players[c].vies>0){ nl=c; break; } } }
    s.leader=nl; mexico._startRound(s);
  },
  view(s,name){ const i=s.players.findIndex(p=>p.name===name);
    const curPi=s.over?-1:s.order[s.idx];
    const maxThrows=s.idx===0?3:(s.leaderThrows||3);
    return {game:'mexico', myTurn: !s.over && curPi===i,
      curName: curPi>=0? s.players[curPi].name : '',
      roll:s.roll, cur:s.cur, throws:s.throws, maxThrows,
      canStay: s.throws>=1 && s.throws<maxThrows,
      results:s.results.map(r=>({name:s.players[r.pi].name, res:r.name})),
      msg:s.msg,
      players:s.players.map((p,j)=>({name:p.name,vies:p.vies,out:p.vies<=0,turn:curPi===j})) }; },
  apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
    if(s.over || s.order[s.idx]!==i) return {ok:false};
    const maxThrows=s.idx===0?3:(s.leaderThrows||3);
    if(a.type==='roll'){ if(s.throws>=maxThrows) return {ok:false};
      const d1=1+Math.floor(Math.random()*6), d2=1+Math.floor(Math.random()*6);
      s.roll=[d1,d2]; s.cur=mex(d1,d2); s.throws++; s.msg=null;
      let msg=name+' : '+s.cur.name;
      if(s.throws>=maxThrows) mexico._finishCur(s);
      return {ok:true,msg}; }
    if(a.type==='stay'){ if(!(s.throws>=1)) return {ok:false};
      const msg=name+' reste sur '+s.cur.name+'.'; mexico._finishCur(s); return {ok:true,msg}; }
    return {ok:false}; },
  isOver(s){ if(!s.over) return null;
    const order=s.players.map(p=>({n:p.name,v:p.vies})).sort((a,b)=>b.v-a.v);
    return {over:true, text:'🏆 '+s.winner+' est le dernier survivant !<br>'+order.map(o=>o.n+' : '+(o.v>0?'♥'.repeat(o.v):'✝')).join('<br>')}; },
  render(v,ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:(p.out?'✝':'♥'.repeat(p.vies)),turn:p.turn})));
    const w=document.createElement('div'); w.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;width:100%';
    const who=document.createElement('div'); who.style.cssText='font-size:15px;opacity:.85';
    who.innerHTML='Au tour de <b>'+(v.curName||'—')+'</b>'+(v.maxThrows?(' · '+v.throws+'/'+v.maxThrows+' lancer'+(v.maxThrows>1?'s':'')):'');
    w.appendChild(who);
    const dr=document.createElement('div'); dr.style.cssText='display:flex;gap:14px';
    (v.roll||[null,null]).forEach(val=>{ const d=document.createElement('div'); d.className='ndie';
      (PIPS[val]||[]).forEach(([x,y])=>{ const p=document.createElement('div'); p.className='npip'; p.style.left=x+'%'; p.style.top=y+'%'; d.appendChild(p); });
      dr.appendChild(d); });
    w.appendChild(dr);
    if(v.cur){ const rc=document.createElement('div'); rc.style.cssText='font-weight:bold;color:var(--accent);font-size:18px'; rc.textContent=v.cur.name; w.appendChild(rc); }
    if(v.results.length){ const rl=document.createElement('div'); rl.style.cssText='font-size:13px;opacity:.8;text-align:center';
      rl.innerHTML='Cette manche : '+v.results.map(r=>r.name+' ('+r.res+')').join(' · '); w.appendChild(rl); }
    ui.center(w);
    ui.say(v.msg? v.msg : (v.myTurn? ('À vous — '+v.maxThrows+' lancer'+(v.maxThrows>1?'s':'')+' max, le dernier compte !') : 'En attente…'));
    ui.hand(null);
    const btns=[]; if(v.myTurn){ btns.push({id:'roll',label:'Lancer 🎲 ('+(v.throws+1)+'/'+v.maxThrows+')',primary:true});
      if(v.canStay) btns.push({id:'stay',label:'Je reste'}); }
    ui.buttons(btns, id=>ui.send({type:id}));
  }
};
NG['mexico']=mexico; NG.list.push(mexico);
})();
