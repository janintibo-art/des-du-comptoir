'use strict';
/* Modules réseau, lot 2 : Awalé (x3), Dames, Échecs, Tout-Cinq, Bataille, Cochon troué.
   Même contrat que net-games.js : {id,label,minP,maxP,family, deal, view, apply, isOver, render}. */
(function(){
const NG=window.NetGames; if(!NG) return;
const shuffle=d=>{ for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; };
const SUITS=['pique','coeur','carreau','trefle'], RANKS=['A','2','3','4','5','6','7','8','9','10','V','D','R'];
const SCH={pique:'\u2660',coeur:'\u2665',carreau:'\u2666',trefle:'\u2663'};
function deck52(){ const d=[]; SUITS.forEach(s=>RANKS.forEach(r=>d.push({r,s}))); return d; }
function cEl(c, opts){ opts=opts||{};
  if(window.Cards && !opts.back) return Cards.el(c,{onClick:opts.onClick,disabled:opts.disabled});
  const b=document.createElement('button');
  b.className='pcard'+(opts.back?' back':((c&&(c.s==='coeur'||c.s==='carreau'))?' red':''))+(opts.off?' off':'');
  if(opts.back) b.innerHTML='<span class="st">\ud83c\udfb2</span>';
  else b.innerHTML='<span class="rk">'+c.r+'</span><span class="st">'+SCH[c.s]+'</span>';
  if(opts.onClick&&!opts.disabled) b.addEventListener('click',()=>opts.onClick(c)); else b.disabled=true;
  return b; }
const esc=s=>String(s).replace(/[<>&]/g,ch=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[ch]));

/* ================= AWALÉ (et variante 2-3-4) ================= */
function mkAwale(id,label,capMax){
  const ownRange=p=>p===0?[0,1,2,3,4,5]:[6,7,8,9,10,11];
  const sideSum=(pits,p)=>{ let s=0; ownRange(p).forEach(i=>s+=pits[i]); return s; };
  function sow(pits,i){ const np=pits.slice(); let seeds=np[i]; np[i]=0; let pos=i;
    while(seeds>0){ pos=(pos+1)%12; if(pos===i) continue; np[pos]++; seeds--; } return {pits:np,last:pos}; }
  const isOpp=(p,i)=> p===0? i>=6 : i<6;
  function caps(pits,p,last){ const list=[]; let c=last;
    while(isOpp(p,c) && pits[c]>=2 && pits[c]<=capMax){ list.push(c); c=(c-1+12)%12; }
    const oppTot=ownRange(1-p).reduce((s,i)=>s+pits[i],0);
    if(list.reduce((s,i)=>s+pits[i],0)===oppTot) return [];
    return list; }
  function moveFeeds(pits,i){ const r=sow(pits,i); const p=i<6?0:1; return sideSum(r.pits,1-p)>0; }
  function legal(s){ const p=s.turn; const raw=ownRange(p).filter(i=>s.pits[i]>0);
    if(sideSum(s.pits,1-p)===0){ return {moves:raw.filter(i=>moveFeeds(s.pits,i)), raw}; }
    return {moves:raw, raw}; }
  function collect(s){ const stores=s.stores.slice(); const pits=s.pits.slice(); const {raw}=legal(s);
    if(raw.length===0){ const opp=1-s.turn; for(let i=0;i<12;i++){ stores[opp]+=pits[i]; pits[i]=0; } }
    else { [0,1].forEach(p=>ownRange(p).forEach(i=>{ stores[p]+=pits[i]; pits[i]=0; })); }
    return {stores,pits}; }
  function endText(s){ const a=s.stores[0],b=s.stores[1], n=[s.players[0].name,s.players[1].name];
    if(a===b) return 'Match nul — '+a+' graines chacun.';
    const w=a>b?0:1; return '🏆 '+n[w]+' gagne !<br>'+n[0]+' : '+s.stores[0]+' · '+n[1]+' : '+s.stores[1]+' graines'; }
  return { id, label, minP:2, maxP:2, family:'awale',
    deal(names){ return {players:names.map(n=>({name:n})), pits:new Array(12).fill(4), stores:[0,0], turn:0, guard:0}; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name);
      return {game:id, pits:s.pits, stores:s.stores, turn:s.turn, myTurn:i===s.turn,
        legal: i===s.turn? legal(s).moves : [], names:s.players.map(p=>p.name)}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
      if(i!==s.turn || a.type!=='sow') return {ok:false};
      const {moves}=legal(s); if(!moves.includes(a.pit)) return {ok:false};
      const p=s.turn; const r=sow(s.pits,a.pit); const cp=caps(r.pits,p,r.last);
      let g=0; cp.forEach(c=>{ g+=r.pits[c]; r.pits[c]=0; });
      s.pits=r.pits; s.stores[p]+=g; s.turn=1-p; s.guard++;
      const msg=name+' sème'+(g?(' et capture '+g+' graines !'):'.');
      const endNow = s.stores[0]>24 || s.stores[1]>24 || (s.stores[0]===24&&s.stores[1]===24) ||
                     legal(s).moves.length===0 || s.guard>300;
      if(endNow){ const col=collect(s); s.stores=col.stores; s.pits=col.pits; s.over=true; }
      return {ok:true,msg}; },
    isOver(s){ return s.over? {over:true, text:endText(s)} : null; },
    render(v,ui){
      ui.opps([]);
      const c=document.createElement('div'); c.style.width='100%';
      const board=document.createElement('div');
      if(window.Awale){
        Awale.render(board, {pits:v.pits, stores:v.stores, turn:v.turn},
          {names:v.names, legalPits: v.myTurn? new Set(v.legal):null,
           onPit: v.myTurn? (i=>ui.send({type:'sow',pit:i})) : null});
      } else board.textContent=v.pits.join(' ');
      c.appendChild(board); ui.center(c);
      ui.say(v.myTurn?'À vous — touchez un de vos trous surlignés.':'Adversaire en train de jouer…');
      ui.hand(null); ui.buttons([],()=>{});
    } };
}
const awale=mkAwale('awale',"L'Awalé",3);
const awale234=mkAwale('awale234','Awalé 2-3-4',4);

/* ================= KALAH ================= */
const kalah=(function(){
  const RING=[0,1,2,3,4,5,'S0',6,7,8,9,10,11,'S1'];
  const ownRange=p=>p===0?[0,1,2,3,4,5]:[6,7,8,9,10,11];
  const sideSum=(pits,p)=>ownRange(p).reduce((s,i)=>s+pits[i],0);
  function nxt(pos,p){ let idx=RING.indexOf(pos); const skip=p===0?'S1':'S0';
    do{ idx=(idx+1)%RING.length; }while(RING[idx]===skip); return RING[idx]; }
  return { id:'kalah', label:'Le Kalah', minP:2, maxP:2, family:'awale',
    deal(names){ return {players:names.map(n=>({name:n})), pits:new Array(12).fill(4), stores:[0,0], turn:0, guard:0}; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name);
      return {game:'kalah', pits:s.pits, stores:s.stores, turn:s.turn, myTurn:i===s.turn,
        legal: i===s.turn? ownRange(s.turn).filter(x=>s.pits[x]>0):[], names:s.players.map(p=>p.name)}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
      if(i!==s.turn || a.type!=='sow') return {ok:false};
      const p=s.turn; if(!(a.pit>=0&&a.pit<12) || (p===0?a.pit>5:a.pit<6) || s.pits[a.pit]===0) return {ok:false};
      const pits=s.pits.slice(), stores=s.stores.slice();
      let seeds=pits[a.pit]; pits[a.pit]=0; let pos=a.pit;
      while(seeds>0){ pos=nxt(pos,p); if(pos==='S0')stores[0]++; else if(pos==='S1')stores[1]++; else pits[pos]++; seeds--; }
      let extra=(pos==='S0'&&p===0)||(pos==='S1'&&p===1), capt=0;
      if(!extra && typeof pos==='number'){ const own=(p===0?pos<6:pos>=6);
        if(own&&pits[pos]===1){ const opp=11-pos; if(pits[opp]>0){ capt=pits[opp]+1; stores[p]+=capt; pits[opp]=0; pits[pos]=0; } } }
      s.pits=pits; s.stores=stores; s.guard++;
      if(!extra) s.turn=1-p;
      const msg=name+(capt?(' capture '+capt+' graines !'):(extra?' rejoue (grenier) !':' sème.'));
      if(sideSum(pits,0)===0||sideSum(pits,1)===0||s.guard>400){
        [0,1].forEach(q=>ownRange(q).forEach(x=>{ s.stores[q]+=s.pits[x]; s.pits[x]=0; })); s.over=true; }
      return {ok:true,msg}; },
    isOver(s){ if(!s.over) return null; const a=s.stores[0],b=s.stores[1],n=[s.players[0].name,s.players[1].name];
      return {over:true, text: a===b?('Match nul — '+a+' partout.'):('🏆 '+n[a>b?0:1]+' gagne !<br>'+n[0]+' : '+a+' · '+n[1]+' : '+b)}; },
    render(v,ui){ awale.render(v,ui); } };
})();

/* ================= LES DAMES ================= */
const dames=(function(){
  const inB=(r,c)=> r>=0&&r<8&&c>=0&&c<8;
  const DIAGS=[[-1,-1],[-1,1],[1,-1],[1,1]];
  const side=v=> v>0?1:(v<0?-1:0);
  const isKing=v=> Math.abs(v)===2;
  function capturePaths(b,r,c){ const v=b[r*8+c]; const me=side(v); const out=[];
    function rec(b2,r2,c2,caps,path){ let ext=false;
      if(!isKing(v)){
        for(const [dr,dc] of DIAGS){ const mr=r2+dr,mc=c2+dc,lr=r2+2*dr,lc=c2+2*dc;
          if(!inB(lr,lc)) continue; const mid=mr*8+mc;
          if(side(b2[mid])===-me && !caps.includes(mid) && b2[lr*8+lc]===0){
            ext=true; const nb=b2.slice(); nb[lr*8+lc]=nb[r2*8+c2]; nb[r2*8+c2]=0;
            rec(nb,lr,lc,caps.concat([mid]),path.concat([[lr,lc]])); } }
      } else {
        for(const [dr,dc] of DIAGS){ let rr=r2+dr,cc=c2+dc;
          while(inB(rr,cc)&&b2[rr*8+cc]===0){ rr+=dr;cc+=dc; }
          if(!inB(rr,cc)) continue; const mid=rr*8+cc;
          if(side(b2[mid])!==-me || caps.includes(mid)) continue;
          let lr=rr+dr,lc=cc+dc;
          while(inB(lr,lc)&&b2[lr*8+lc]===0){ ext=true;
            const nb=b2.slice(); nb[lr*8+lc]=nb[r2*8+c2]; nb[r2*8+c2]=0;
            rec(nb,lr,lc,caps.concat([mid]),path.concat([[lr,lc]])); lr+=dr;lc+=dc; } } }
      if(!ext && caps.length) out.push({path,caps}); }
    rec(b,r,c,[],[[r,c]]);
    return out; }
  function allMoves(b,me){ let best=0; const capM=[];
    for(let r=0;r<8;r++)for(let c=0;c<8;c++){ if(side(b[r*8+c])!==me) continue;
      for(const cp of capturePaths(b,r,c)){ if(cp.caps.length>best)best=cp.caps.length; capM.push(cp); } }
    if(best>0) return capM.filter(m=>m.caps.length===best);
    const quiet=[];
    for(let r=0;r<8;r++)for(let c=0;c<8;c++){ const v=b[r*8+c]; if(side(v)!==me) continue;
      if(!isKing(v)){ const dr=(me===1)?-1:1;
        for(const dc of [-1,1]){ const nr=r+dr,nc=c+dc; if(inB(nr,nc)&&b[nr*8+nc]===0) quiet.push({path:[[r,c],[nr,nc]],caps:[]}); } }
      else { for(const [dr,dc] of DIAGS){ let rr=r+dr,cc=c+dc;
        while(inB(rr,cc)&&b[rr*8+cc]===0){ quiet.push({path:[[r,c],[rr,cc]],caps:[]}); rr+=dr;cc+=dc; } } } }
    return quiet; }
  function applyMv(b,mv,me){ const nb=b.slice();
    const [r0,c0]=mv.path[0]; const [r1,c1]=mv.path[mv.path.length-1];
    let v=nb[r0*8+c0]; nb[r0*8+c0]=0; mv.caps.forEach(i=> nb[i]=0);
    if(Math.abs(v)===1){ if(me===1&&r1===0)v=2; if(me===-1&&r1===7)v=-2; }
    nb[r1*8+c1]=v; return nb; }
  function initB(){ const b=new Array(64).fill(0);
    for(let r=0;r<3;r++)for(let c=0;c<8;c++) if((r+c)%2===0) b[r*8+c]=-1;
    for(let r=5;r<8;r++)for(let c=0;c<8;c++) if((r+c)%2===0) b[r*8+c]=1;
    return b; }
  const cnt=(b,me)=>{ let n=0; for(const v of b) if(side(v)===me)n++; return n; };
  const GRID={left:0.1073, top:0.1029, cw:0.0979, ch:0.0989};
  const pos=(r,c)=>[(GRID.left+(c+0.5)*GRID.cw)*100,(GRID.top+(r+0.5)*GRID.ch)*100];
  const samePath=(a,b)=> a.length===b.length && a.every((p,i)=>p[0]===b[i][0]&&p[1]===b[i][1]);
  return { id:'dames', label:'Les Dames', minP:2, maxP:2, family:'none',
    deal(names){ return {players:names.map(n=>({name:n})), b:initB(), turn:1, noProg:0}; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name); const me=i===0?1:-1;
      return {game:'dames', b:s.b, turn:s.turn, myTurn: s.turn===me,
        moves: s.turn===me? allMoves(s.b,me):[], names:s.players.map(p=>p.name),
        counts:[cnt(s.b,1),cnt(s.b,-1)]}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name); const me=i===0?1:-1;
      if(s.turn!==me || a.type!=='move') return {ok:false};
      const mv=allMoves(s.b,me).find(m=>samePath(m.path,a.path)); if(!mv) return {ok:false};
      s.b=applyMv(s.b,mv,me);
      const [er,ec]=mv.path[mv.path.length-1];
      s.noProg=(mv.caps.length||Math.abs(s.b[er*8+ec])===1)?0:s.noProg+1;
      const msg=mv.caps.length? name+' prend '+mv.caps.length+' pièce'+(mv.caps.length>1?'s':'')+' !' : name+' joue.';
      if(!allMoves(s.b,-me).length){ s.over=true; s.winner=name; }
      else if(cnt(s.b,-me)===0){ s.over=true; s.winner=name; }
      else if(s.noProg>=50){ s.over=true; s.draw=true; }
      else s.turn=-me;
      return {ok:true,msg}; },
    isOver(s){ if(!s.over) return null;
      if(s.draw) return {over:true,text:'Match nul — 25 coups de dames sans prise.'};
      return {over:true,text:'🏆 '+s.winner+' gagne la partie de dames !'}; },
    render(v,ui){
      ui.opps([]);
      function board(opts){ opts=opts||{};
        const bd=document.createElement('div'); bd.className='dames-board';
        bd.style.backgroundImage='url(dames/plateau.webp)';
        const shown=opts.board||v.b;
        for(let r=0;r<8;r++)for(let c=0;c<8;c++){
          if((r+c)%2!==0) continue;
          const val=shown[r*8+c]; const [x,y]=pos(r,c);
          const cell=document.createElement('div'); cell.className='dcell';
          cell.style.left=x+'%'; cell.style.top=y+'%';
          if(opts.sel&&opts.sel[0]===r&&opts.sel[1]===c) cell.classList.add('sel');
          if(opts.ghost&&opts.ghost.has(r*8+c)) cell.classList.add('ghosted');
          if(val){ const img=new Image(); img.className='pn'; img.src='dames/pion-'+(val>0?'blanc':'noir')+'.webp'; img.draggable=false; cell.appendChild(img);
            if(Math.abs(val)===2){ const cr=document.createElement('div'); cr.className='crown'; cr.textContent='👑'; cell.appendChild(cr); } }
          const key=r*8+c;
          if(opts.picks&&opts.picks.has(key)){ cell.classList.add('pick'); cell.addEventListener('click',()=>opts.onPick(r,c)); }
          if(opts.dests&&opts.dests.has(key)){ cell.classList.add('dest'); cell.addEventListener('click',()=>opts.onDest(r,c)); }
          bd.appendChild(cell); }
        const w=document.createElement('div'); w.style.width='100%'; w.appendChild(bd);
        const cc=document.createElement('div'); cc.className='dcount';
        cc.innerHTML='<span><img src="dames/pion-blanc.webp">'+v.counts[0]+'</span><span><img src="dames/pion-noir.webp">'+v.counts[1]+'</span>';
        w.appendChild(cc); return w; }
      ui.hand(null); ui.buttons([],()=>{});
      if(!v.myTurn){ ui.center(board({})); ui.say('L\u2019adversaire joue…'); return; }
      const mustCap=v.moves.length&&v.moves[0].caps.length>0;
      function pickPiece(){
        const starts=new Set(v.moves.map(m=>m.path[0][0]*8+m.path[0][1]));
        ui.say('À vous'+(mustCap?' — prise obligatoire !':' — touchez une pièce.'));
        ui.center(board({picks:starts, onPick:(r,c)=>follow(r,c)})); }
      function follow(sr,sc){
        let prefix=[[sr,sc]];
        let pool=v.moves.filter(m=>m.path[0][0]===sr&&m.path[0][1]===sc);
        step();
        function step(){
          const L=prefix.length;
          if(pool[0].path.length===L){ ui.send({type:'move',path:prefix}); return; }
          const nexts=new Set(); pool.forEach(m=>nexts.add(m.path[L][0]*8+m.path[L][1]));
          const gb=v.b.slice(); const ghost=new Set(pool[0].caps.slice(0,L-1));
          gb[sr*8+sc]=0; const cur=prefix[L-1]; gb[cur[0]*8+cur[1]]=v.b[sr*8+sc];
          ui.say(L===1?'Touchez la case d\u2019arriv\u00e9e.':'Continuez la rafle !');
          ui.center(board({board:gb, sel:cur, ghost, dests:nexts,
            onDest:(r,c)=>{ prefix.push([r,c]); pool=pool.filter(m=>m.path[L]&&m.path[L][0]===r&&m.path[L][1]===c); step(); },
            picks:(L===1?new Set([sr*8+sc]):null), onPick:()=>pickPiece()})); }
      }
      pickPiece();
    } };
})();

/* ================= LES ÉCHECS ================= */
const echecs=(function(){
  const N8=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const K8=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const DIAG=[[-1,-1],[-1,1],[1,-1],[1,1]], ORTH=[[-1,0],[1,0],[0,-1],[0,1]];
  const inB=(r,c)=> r>=0&&r<8&&c>=0&&c<8;
  function initB(){ const b=new Array(64).fill(0); const back=[4,2,3,5,6,3,2,4];
    for(let c=0;c<8;c++){ b[c]=-back[c]; b[8+c]=-1; b[48+c]=1; b[56+c]=back[c]; }
    return b; }
  function attacked(b,sq,by){ const r=sq>>3,c=sq&7; const pr=r+by;
    if(inB(pr,c-1)&&b[pr*8+c-1]===1*by) return true;
    if(inB(pr,c+1)&&b[pr*8+c+1]===1*by) return true;
    for(const [dr,dc] of N8){ const rr=r+dr,cc=c+dc; if(inB(rr,cc)&&b[rr*8+cc]===2*by) return true; }
    for(const [dr,dc] of K8){ const rr=r+dr,cc=c+dc; if(inB(rr,cc)&&b[rr*8+cc]===6*by) return true; }
    for(const [dr,dc] of DIAG){ let rr=r+dr,cc=c+dc;
      while(inB(rr,cc)){ const v=b[rr*8+cc]; if(v){ if(v===3*by||v===5*by) return true; break; } rr+=dr;cc+=dc; } }
    for(const [dr,dc] of ORTH){ let rr=r+dr,cc=c+dc;
      while(inB(rr,cc)){ const v=b[rr*8+cc]; if(v){ if(v===4*by||v===5*by) return true; break; } rr+=dr;cc+=dc; } }
    return false; }
  const kingSq=(b,s)=>{ for(let i=0;i<64;i++) if(b[i]===6*s) return i; return -1; };
  function applyM(st,m){ const b=st.b.slice(); let cast=st.cast, ep=-1, half=st.half+1;
    const piece=b[m.from]; const side=st.turn;
    if(m.capt||Math.abs(piece)===1) half=0;
    b[m.to]=m.promo? m.promo*side : piece; b[m.from]=0;
    if(m.epCap) b[m.to+8*side]=0;
    if(m.castle==='K'){ b[m.to-1]=4*side; b[(side===1?63:7)]=0; }
    if(m.castle==='Q'){ b[m.to+1]=4*side; b[(side===1?56:0)]=0; }
    if(Math.abs(piece)===6) cast &= side===1? ~3 : ~12;
    const CB={56:2,63:1,0:8,7:4};
    if(CB[m.from]) cast&=~CB[m.from];
    if(CB[m.to]) cast&=~CB[m.to];
    if(m.dbl) ep=m.from-8*side;
    return {b, turn:-side, cast, ep, half}; }
  function genMoves(st){ const {b}=st; const side=st.turn; const out=[];
    const push=m=>{ const ns=applyM(st,m); if(!attacked(ns.b,kingSq(ns.b,side),-side)) out.push(m); };
    for(let sq=0;sq<64;sq++){ const v=b[sq]; if(!v||Math.sign(v)!==side) continue;
      const r=sq>>3,c=sq&7,t=Math.abs(v);
      if(t===1){ const dr=-side, one=(r+dr)*8+c;
        if(inB(r+dr,c)&&b[one]===0){
          if(r+dr===0||r+dr===7){ for(const p of [5,4,3,2]) push({from:sq,to:one,promo:p}); }
          else push({from:sq,to:one});
          const sR=side===1?6:1;
          if(r===sR&&b[(r+2*dr)*8+c]===0) push({from:sq,to:(r+2*dr)*8+c,dbl:true}); }
        for(const dc of [-1,1]){ const rr=r+dr,cc=c+dc; if(!inB(rr,cc)) continue; const to=rr*8+cc;
          if(b[to]!==0&&Math.sign(b[to])===-side){
            if(rr===0||rr===7){ for(const p of [5,4,3,2]) push({from:sq,to,promo:p,capt:true}); }
            else push({from:sq,to,capt:true}); }
          else if(to===st.ep&&b[to]===0) push({from:sq,to,capt:true,epCap:true}); }
      } else if(t===2||t===6){
        for(const [dr,dc] of (t===2?N8:K8)){ const rr=r+dr,cc=c+dc; if(!inB(rr,cc)) continue;
          const to=rr*8+cc; if(b[to]===0||Math.sign(b[to])===-side) push({from:sq,to,capt:b[to]!==0}); }
        if(t===6){ const home=side===1?60:4;
          if(sq===home&&!attacked(b,home,-side)){
            if((st.cast&(side===1?1:4))&&b[home+1]===0&&b[home+2]===0&&
               !attacked(b,home+1,-side)&&!attacked(b,home+2,-side)&&b[home+3]===4*side)
              push({from:sq,to:home+2,castle:'K'});
            if((st.cast&(side===1?2:8))&&b[home-1]===0&&b[home-2]===0&&b[home-3]===0&&
               !attacked(b,home-1,-side)&&!attacked(b,home-2,-side)&&b[home-4]===4*side)
              push({from:sq,to:home-2,castle:'Q'}); } }
      } else { const dirs=t===3?DIAG:t===4?ORTH:DIAG.concat(ORTH);
        for(const [dr,dc] of dirs){ let rr=r+dr,cc=c+dc;
          while(inB(rr,cc)){ const to=rr*8+cc;
            if(b[to]===0) push({from:sq,to});
            else { if(Math.sign(b[to])===-side) push({from:sq,to,capt:true}); break; }
            rr+=dr;cc+=dc; } } } }
    return out; }
  const GRID={left:0.1277, top:0.1246, cw:0.0930, ch:0.0937};
  const PNAME={1:'pion',2:'cavalier',3:'fou',4:'tour',5:'dame',6:'roi'};
  const pos=(r,c)=>[(GRID.left+(c+0.5)*GRID.cw)*100,(GRID.top+(r+0.5)*GRID.ch)*100];
  const cnt=(b,s)=>{ let n=0; for(const v of b) if(v&&Math.sign(v)===s)n++; return n; };
  return { id:'echecs', label:'Les Échecs', minP:2, maxP:2, family:'none',
    _core:{initB,genMoves,applyM,attacked,kingSq},
    deal(names){ return {players:names.map(n=>({name:n})), b:initB(), turn:1, cast:15, ep:-1, half:0, reps:{}}; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name); const me=i===0?1:-1;
      const st={b:s.b,turn:s.turn,cast:s.cast,ep:s.ep,half:s.half};
      return {game:'echecs', b:s.b, turn:s.turn, myTurn:s.turn===me,
        moves: s.turn===me? genMoves(st):[],
        check: attacked(s.b, kingSq(s.b,s.turn), -s.turn),
        lastMv:s.lastMv||null, names:s.players.map(p=>p.name), counts:[cnt(s.b,1),cnt(s.b,-1)]}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name); const me=i===0?1:-1;
      if(s.turn!==me || a.type!=='move') return {ok:false};
      const st={b:s.b,turn:s.turn,cast:s.cast,ep:s.ep,half:s.half};
      const mv=genMoves(st).find(m=>m.from===a.from&&m.to===a.to&&(m.promo||0)===(a.promo||0));
      if(!mv) return {ok:false};
      const ns=applyM(st,mv);
      s.b=ns.b; s.turn=ns.turn; s.cast=ns.cast; s.ep=ns.ep; s.half=ns.half; s.lastMv={from:mv.from,to:mv.to};
      let msg=name+(mv.castle?' roque.':mv.promo?' promeut un pion !':mv.capt?' prend.':' joue.');
      const nst={b:s.b,turn:s.turn,cast:s.cast,ep:s.ep,half:s.half};
      const nm=genMoves(nst);
      const chk=attacked(s.b, kingSq(s.b,s.turn), -s.turn);
      if(!nm.length){ s.over=true; if(chk){ s.result='mat'; s.winner=name; msg='ÉCHEC ET MAT !'; } else s.result='pat'; }
      else if(s.half>=100){ s.over=true; s.result='50'; }
      else { const key=s.b.join(',')+s.turn+s.cast+s.ep;
        s.reps[key]=(s.reps[key]||0)+1;
        if(s.reps[key]>=3){ s.over=true; s.result='rep'; }
        else if(chk) msg+=' Échec !'; }
      return {ok:true,msg}; },
    isOver(s){ if(!s.over) return null;
      if(s.result==='mat') return {over:true,text:'♚ Échec et mat — victoire de '+s.winner+' !'};
      if(s.result==='pat') return {over:true,text:'Pat — match nul.'};
      if(s.result==='50') return {over:true,text:'Match nul (50 coups sans prise ni pion).'};
      return {over:true,text:'Match nul (triple répétition).'}; },
    render(v,ui){
      ui.opps([]);
      function board(opts){ opts=opts||{};
        const bd=document.createElement('div'); bd.className='chess-board';
        bd.style.backgroundImage='url(echecs/plateau.webp)';
        const chkSq=v.check? kingSq(v.b,v.turn) : -1;
        for(let r=0;r<8;r++)for(let c=0;c<8;c++){
          const i=r*8+c, val=v.b[i]; const [x,y]=pos(r,c);
          const cell=document.createElement('div'); cell.className='ccell';
          cell.style.left=x+'%'; cell.style.top=y+'%'; cell.style.zIndex=r+1;
          if(v.lastMv&&(i===v.lastMv.from||i===v.lastMv.to)) cell.classList.add('last');
          if(opts.sel===i) cell.classList.add('sel');
          if(i===chkSq) cell.classList.add('chk');
          if(val){ const img=new Image(); img.className='pc';
            img.src='echecs/'+(val>0?'b':'n')+'-'+PNAME[Math.abs(val)]+'.webp'; img.draggable=false; cell.appendChild(img); }
          if(opts.picks&&opts.picks.has(i)){ cell.classList.add('pick'); cell.addEventListener('click',()=>opts.onPick(i)); }
          if(opts.dests&&opts.dests.has(i)){ cell.classList.add('dest'); if(val)cell.classList.add('cap');
            cell.style.zIndex=20; cell.addEventListener('click',()=>opts.onDest(i)); }
          bd.appendChild(cell); }
        const w=document.createElement('div'); w.style.width='100%'; w.appendChild(bd);
        const cc=document.createElement('div'); cc.className='ccount';
        cc.innerHTML='<span><img src="echecs/b-pion.webp">'+v.counts[0]+'</span><span><img src="echecs/n-pion.webp">'+v.counts[1]+'</span>';
        w.appendChild(cc); return w; }
      ui.hand(null); ui.buttons([],()=>{});
      if(!v.myTurn){ ui.center(board({})); ui.say(v.check?'Échec !':'L\u2019adversaire joue…'); return; }
      function pickFrom(){
        const froms=new Set(v.moves.map(m=>m.from));
        ui.say('À vous'+(v.check?' — ÉCHEC au roi !':' — touchez une pièce.'));
        ui.center(board({picks:froms, onPick:from=>{
          const mine=v.moves.filter(m=>m.from===from);
          const dests=new Set(mine.map(m=>m.to));
          ui.say('Touchez la case d\u2019arriv\u00e9e (ou re-touchez la pièce).');
          ui.center(board({sel:from, dests, picks:new Set([from]), onPick:()=>pickFrom(),
            onDest:to=>{
              const cand=mine.filter(m=>m.to===to);
              if(cand.length>1){ ui.choose([{id:'5',label:'♛ Dame',primary:true},{id:'4',label:'♜ Tour'},{id:'3',label:'♝ Fou'},{id:'2',label:'♞ Cavalier'}],
                id=>ui.send({type:'move',from,to,promo:+id})); ui.say('Choisissez la promotion.'); }
              else ui.send({type:'move',from,to,promo:cand[0].promo||0});
            }})); }})); }
      pickFrom();
    } };
})();

/* ================= LE TOUT-CINQ ================= */
const pip=t=>t.a+t.b;
const toutcinq=(function(){
  function fullSet(){ const t=[]; for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)t.push({a,b}); return t; }
  function scoreEnds(chain){ if(chain.length===0) return 0;
    if(chain.length===1){ const n=chain[0]; return n.a===n.b? 2*n.a : n.a+n.b; }
    const l=chain[0], r=chain[chain.length-1];
    return ((l.a===l.b)?2*l.a:l.a)+((r.a===r.b)?2*r.b:r.b); }
  function startRound(s){
    const set=shuffle(fullSet()); const N=s.players.length; const per=N===2?7:5;
    s.players.forEach(p=>{ p.hand=set.splice(0,per); });
    s.yard=set;
    let starter=0,bv=-1,bt=null;
    s.players.forEach((p,i)=>p.hand.forEach(t=>{ const v=(t.a===t.b?100:0)+pip(t); if(v>bv){bv=v;starter=i;bt=t;} }));
    s.chain=[{a:bt.a,b:bt.b}]; s.L=bt.a; s.R=bt.b;
    s.players[starter].hand.splice(s.players[starter].hand.findIndex(t=>t.a===bt.a&&t.b===bt.b),1);
    const sc=scoreEnds(s.chain); if(sc%5===0&&sc>0) s.totals[starter]+=sc;
    s.turn=(starter+1)%N; s.passes=0;
    if(s.players[starter].hand.length===0) endRound(s, starter);
  }
  function endRound(s, outIdx){
    const N=s.players.length;
    if(outIdx>=0){ let opp=0; s.players.forEach((p,i)=>{ if(i!==outIdx) opp+=p.hand.reduce((a,t)=>a+pip(t),0); });
      s.totals[outIdx]+=Math.round(opp/5)*5; }
    else { const sums=s.players.map(p=>p.hand.reduce((a,t)=>a+pip(t),0));
      const mn=Math.min(...sums); const w=sums.indexOf(mn);
      s.totals[w]+=Math.round((sums.reduce((a,b)=>a+b,0)-mn)/5)*5; }
    if(s.totals.some(t=>t>=100)){ s.over=true; return; }
    startRound(s);
  }
  return { id:'toutcinq', label:'Le Tout-Cinq', minP:2, maxP:4, family:'domino',
    playable(t,L,R){ return t.a===L||t.b===L||t.a===R||t.b===R; },
    deal(names){ const s={players:names.map(n=>({name:n})), totals:names.map(()=>0)}; startRound(s); return s; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
      return {game:'toutcinq', chain:s.chain, L:s.L, R:s.R, yard:s.yard.length, myTurn:i===s.turn,
        ends:scoreEnds(s.chain), totals:s.totals, hand:p.hand,
        players:s.players.map((q,j)=>({name:q.name,count:q.hand.length,total:s.totals[j],turn:j===s.turn}))}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name); if(i!==s.turn) return {ok:false};
      const p=s.players[i]; const N=s.players.length;
      if(a.type==='play'){
        const k=p.hand.findIndex(t=>t.a===a.tile.a&&t.b===a.tile.b); if(k<0) return {ok:false};
        const t=p.hand[k]; const side=a.side;
        if(side==='R'&&!(t.a===s.R||t.b===s.R)) return {ok:false};
        if(side==='L'&&!(t.a===s.L||t.b===s.L)) return {ok:false};
        p.hand.splice(k,1);
        if(side==='R'){ const o=t.a===s.R?t.b:t.a; s.chain.push({a:s.R,b:o}); s.R=o; }
        else { const o=t.a===s.L?t.b:t.a; s.chain.unshift({a:o,b:s.L}); s.L=o; }
        s.passes=0;
        let msg=name+' pose le '+t.a+'-'+t.b;
        const sc=scoreEnds(s.chain);
        if(sc%5===0&&sc>0){ s.totals[i]+=sc; msg+=' et marque '+sc+' ! ('+s.totals[i]+')'; }
        if(p.hand.length===0){ msg+=' — fin de manche !'; endRound(s,i); return {ok:true,msg}; }
        s.turn=(s.turn+1)%N; return {ok:true,msg}; }
      if(a.type==='draw'){ if(!s.yard.length) return {ok:false};
        if(p.hand.some(t=>toutcinq.playable(t,s.L,s.R))) return {ok:false};
        p.hand.push(s.yard.shift()); return {ok:true,msg:name+' pioche'}; }
      if(a.type==='pass'){ if(s.yard.length||p.hand.some(t=>toutcinq.playable(t,s.L,s.R))) return {ok:false};
        s.passes++; s.turn=(s.turn+1)%N;
        if(s.passes>=N){ endRound(s,-1); return {ok:true,msg:'Manche bloquée — on compte.'}; }
        return {ok:true,msg:name+' passe'}; }
      return {ok:false}; },
    isOver(s){ if(!s.over) return null;
      const order=s.players.map((p,i)=>({n:p.name,t:s.totals[i]})).sort((a,b)=>b.t-a.t);
      return {over:true,text:'🏆 '+order[0].n+' atteint '+order[0].t+' points !<br>'+order.map(o=>o.n+' : '+o.t).join('<br>')}; },
    render(v,ui){
      ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count+' 🁢 · '+p.total+' pts',turn:p.turn})));
      const wrap=document.createElement('div'); wrap.style.width='100%';
      const board=document.createElement('div'); board.style.cssText='display:flex;align-items:center;gap:8px;width:100%';
      const bl=document.createElement('div'); bl.className='endbadge'; bl.innerHTML='<small>gauche</small>'+v.L;
      const ch=document.createElement('div'); ch.className='chain';
      v.chain.forEach(t=>{ ch.appendChild(window.Dominos? Dominos.el(t,{}) : Object.assign(document.createElement('span'),{textContent:t.a+'·'+t.b})); });
      const br=document.createElement('div'); br.className='endbadge'; br.innerHTML='<small>droite</small>'+v.R;
      board.appendChild(bl); board.appendChild(ch); board.appendChild(br); wrap.appendChild(board);
      const yd=document.createElement('div'); yd.className='yard';
      yd.textContent='Pioche : '+v.yard+' · Bouts = '+v.ends+(v.ends%5===0&&v.ends>0?' (×5 !)':'')+' · Vous : '+v.totals[v.players.findIndex(p=>p.name===ui.myName)]+' pts';
      wrap.appendChild(yd); ui.center(wrap);
      requestAnimationFrame(()=>{ ch.scrollLeft=ch.scrollWidth; });
      const opts=v.hand.filter(t=>toutcinq.playable(t,v.L,v.R));
      ui.say(v.myTurn?(opts.length?'À vous — touchez une tuile (les bouts en ×5 marquent !).':(v.yard?'Aucun coup — piochez.':'Bloqué — passez.')):'');
      const hand=document.createElement('div'); hand.className='hand';
      v.hand.forEach(t=>{ const ok=v.myTurn&&opts.includes(t);
        const el=window.Dominos? Dominos.el(t,{onClick: ok?(()=>{
          const mR=t.a===v.R||t.b===v.R, mL=t.a===v.L||t.b===v.L;
          if(mR&&mL&&v.L!==v.R) ui.choose([{id:'L',label:'◀ Gauche ('+v.L+')'},{id:'R',label:'Droite ('+v.R+') ▶'}], side=>ui.send({type:'play',tile:t,side}));
          else ui.send({type:'play',tile:t,side:mR?'R':'L'});
        }):null, disabled:!ok}) : Object.assign(document.createElement('span'),{textContent:t.a+'·'+t.b});
        if(ok) el.classList.add('play'); hand.appendChild(el); });
      ui.hand(hand);
      let btns=[]; if(v.myTurn&&!opts.length){ btns=v.yard?[{id:'draw',label:'Piocher'}]:[{id:'pass',label:'Passer'}]; }
      ui.buttons(btns, id=>ui.send({type:id}));
    } };
})();

/* ================= LA BATAILLE ================= */
const bataille=(function(){
  const RV={A:14,R:13,D:12,V:11,'10':10,'9':9,'8':8,'7':7,'6':6,'5':5,'4':4,'3':3,'2':2};
  function ensure(p){ if(!p.deck.length && p.won.length){ p.deck=shuffle(p.won); p.won=[]; } return p.deck.length>0; }
  return { id:'bataille', label:'La Bataille', minP:2, maxP:2, family:'cards',
    deal(names){ const d=shuffle(deck52());
      return {players:names.map((n,i)=>({name:n, deck:d.slice(i*26,i*26+26), won:[]})),
        up:[null,null], pot:[], turn:0, flips:0}; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name);
      return {game:'bataille', up:s.up, pot:s.pot.length, myTurn:i===s.turn && !s.over,
        counts:s.players.map(p=>p.deck.length+p.won.length),
        players:s.players.map((q,j)=>({name:q.name,count:q.deck.length+q.won.length,turn:j===s.turn}))}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
      if(i!==s.turn || a.type!=='flip' || s.over) return {ok:false};
      const p=s.players[i];
      if(!ensure(p)){ s.over=true; s.winner=s.players[1-i].name; return {ok:true,msg:name+' n\u2019a plus de cartes !'}; }
      s.up[i]=p.deck.shift(); s.flips++;
      let msg=name+' retourne '+s.up[i].r+SCH[s.up[i].s];
      if(s.up[0]&&s.up[1]){
        const a0=RV[s.up[0].r], a1=RV[s.up[1].r];
        if(a0===a1){ // bataille !
          msg='BATAILLE ! ('+s.up[0].r+' contre '+s.up[1].r+')';
          s.pot.push(s.up[0],s.up[1]); s.up=[null,null];
          for(const j of [0,1]){ const q=s.players[j];
            if(!ensure(q)){ s.over=true; s.winner=s.players[1-j].name; return {ok:true,msg}; }
            s.pot.push(q.deck.shift()); }
          s.turn=0;
        } else {
          const w=a0>a1?0:1;
          s.players[w].won.push(s.up[0],s.up[1],...s.pot);
          msg=s.players[w].name+' remporte le pli ('+(2+s.pot.length)+' cartes).';
          s.pot=[]; s.up=[null,null]; s.turn=w===0?0:1; s.turn=0;
        }
      } else s.turn=1-i;
      if(s.flips>600 && !s.over){ s.over=true;
        const c0=s.players[0].deck.length+s.players[0].won.length, c1=s.players[1].deck.length+s.players[1].won.length;
        s.winner=c0===c1?null:(c0>c1?s.players[0].name:s.players[1].name); }
      const c0=s.players[0].deck.length+s.players[0].won.length;
      const c1=s.players[1].deck.length+s.players[1].won.length;
      if(!s.over && (c0===0||c1===0)){ s.over=true; s.winner=c0===0?s.players[1].name:s.players[0].name; }
      return {ok:true,msg}; },
    isOver(s){ if(!s.over) return null;
      return {over:true, text: s.winner? '🏆 '+s.winner+' remporte la Bataille !' : 'Match nul — partie sans fin !'}; },
    render(v,ui){
      ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
      const w=document.createElement('div'); w.style.cssText='display:flex;flex-direction:column;align-items:center;gap:10px';
      const row=document.createElement('div'); row.style.cssText='display:flex;gap:18px;align-items:center';
      [0,1].forEach(j=>{ const c=v.up[j];
        row.appendChild(c? cEl(c,{}) : cEl({r:'A',s:'pique'},{back:true,disabled:true})); });
      w.appendChild(row);
      if(v.pot) { const d=document.createElement('div'); d.style.cssText='color:var(--accent);font-weight:bold'; d.textContent='⚔️ Bataille en cours — pot : '+v.pot+' cartes'; w.appendChild(d); }
      ui.center(w);
      ui.say(v.myTurn?'À vous — retournez votre carte !':'');
      ui.hand(null);
      ui.buttons(v.myTurn?[{id:'flip',label:'Retourner ma carte 🎴',primary:true}]:[], ()=>ui.send({type:'flip'}));
    } };
})();

/* ================= LE COCHON TROUÉ ================= */
const cochontroue=(function(){
  const HOLES=[{n:1,x:0.297,y:0.541},{n:2,x:0.492,y:0.599},{n:3,x:0.696,y:0.543},
               {n:4,x:0.295,y:0.723},{n:5,x:0.495,y:0.761},{n:6,x:0.693,y:0.741}];
  const remaining=s=>s.players.filter(p=>!p.finished).length;
  const nextActive=(s,from)=>{ const N=s.players.length; let k=(from+1)%N,h=0;
    while(s.players[k].finished&&h<N){k=(k+1)%N;h++;} return k; };
  function endTurn(s){ s.players[s.turn].turns=(s.players[s.turn].turns||0)+1; s.rolls=0;
    if(remaining(s)<=1){ s.over=true; return; }
    s.turn=nextActive(s,s.turn); }
  return { id:'cochontroue', label:'Le Cochon troué', minP:2, maxP:6, family:'none',
    deal(names){ const pigs=names.length<=4?10:8;
      return {players:names.map(n=>({name:n,hand:pigs,finished:false,turns:0})),
        holes:[false,false,false,false,false], turn:0, rolls:0, order:[], lastDie:0}; },
    view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
      const req=p.turns===0?1:(p.turns===1?2:0);
      return {game:'cochontroue', holes:s.holes, lastDie:s.lastDie,
        myTurn:i===s.turn && !p.finished && !s.over,
        canStop: i===s.turn && p.turns>=2 && s.rolls>=1,
        rollsLeft: req? (req-s.rolls) : -1,
        players:s.players.map((q,j)=>({name:q.name,count:q.finished?'✓':q.hand,turn:j===s.turn&&!q.finished}))}; },
    apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
      if(i!==s.turn || s.over) return {ok:false};
      const p=s.players[i]; if(p.finished) return {ok:false};
      if(a.type==='stop'){ if(!(p.turns>=2&&s.rolls>=1)) return {ok:false};
        endTurn(s); return {ok:true,msg:name+' s\u2019arrête.'}; }
      if(a.type!=='roll') return {ok:false};
      const v=1+Math.floor(Math.random()*6); s.lastDie=v; s.rolls++;
      let msg=name+' lance : '+v+'. ';
      let busted=false;
      if(v===6){ p.hand=Math.max(0,p.hand-1); msg+='Un cochon sort par le trou du milieu ! 🐷'; }
      else { const h=v-1;
        if(!s.holes[h]){ s.holes[h]=true; p.hand=Math.max(0,p.hand-1); msg+='Cochon posé au trou '+v+'.'; }
        else { const taken=s.holes.filter(Boolean).length; p.hand+=taken;
          s.holes=[false,false,false,false,false]; busted=true;
          msg+='Trou '+v+' occupé — '+name+' ramasse '+taken+' cochon'+(taken>1?'s':'')+' !'; } }
      if(p.hand===0){ p.finished=true; s.order.push(i); msg+=' 🎉 '+name+' n\u2019a plus de cochons !'; endTurn(s); return {ok:true,msg}; }
      if(busted){ endTurn(s); return {ok:true,msg}; }
      const req=p.turns===0?1:(p.turns===1?2:0);
      if(req && s.rolls>=req){ endTurn(s); }
      return {ok:true,msg}; },
    isOver(s){ if(!s.over) return null;
      const loser=s.players.find(p=>!p.finished);
      const names=s.order.map(i=>s.players[i].name);
      return {over:true, text:'💩 '+(loser?loser.name:'?')+' garde ses cochons et perd !<br>Sortis : '+names.map(esc).join(', ')}; },
    render(v,ui){
      ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
      const w=document.createElement('div'); w.style.cssText='display:flex;flex-direction:column;align-items:center;gap:8px;width:100%';
      const board=document.createElement('div'); board.className='cochon-board'; board.style.backgroundImage='url(cochon/board.webp)';
      HOLES.forEach(h=>{ const d=document.createElement('div'); d.className='cochon-hole'+(h.n===6?' exit':'');
        d.style.left=(h.x*100)+'%'; d.style.top=(h.y*100)+'%'; d.style.width='9%';
        if(h.n<=5 && v.holes[h.n-1]){ const img=new Image(); img.className='peg'; img.src='cochon/peg-clair.webp'; d.appendChild(img); }
        board.appendChild(d); });
      w.appendChild(board);
      const die=document.createElement('div'); die.className='ndie';
      const PIPS={1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[28,25],[72,25],[28,50],[72,50],[28,75],[72,75]]};
      (PIPS[v.lastDie]||[]).forEach(([x,y])=>{ const p=document.createElement('div'); p.className='npip'; p.style.left=x+'%'; p.style.top=y+'%'; die.appendChild(p); });
      w.appendChild(die); ui.center(w);
      ui.say(v.myTurn?(v.rollsLeft>0?('Lancez le dé ('+v.rollsLeft+' lancer'+(v.rollsLeft>1?'s':'')+' ce tour).'):(v.canStop?'Relancer ou s\u2019arrêter ?':'Lancez le dé !')):'');
      ui.hand(null);
      const btns=[]; if(v.myTurn){ btns.push({id:'roll',label:'Lancer le dé 🎲',primary:true});
        if(v.canStop) btns.push({id:'stop',label:'Je m\u2019arrête ✋'}); }
      ui.buttons(btns, id=>ui.send({type:id}));
    } };
})();

/* ---- enregistrement ---- */
const add=[awale,awale234,kalah,dames,echecs,toutcinq,bataille,cochontroue];
add.forEach(m=>{ NG[m.id]=m; NG.list.push(m); });
})();
