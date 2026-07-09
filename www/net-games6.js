'use strict';
/* Module réseau : Puissance 4 (2 joueurs, info publique). */
(function(){
const NG=window.NetGames; if(!NG) return;
const COLS=7, ROWS=6;
const GRID={left:0.1950, top:0.1513, stepx:0.1011, stepy:0.1180, rad:0.0359};
const canPlay=(b,c)=> b.heights[c]<ROWS;
function play(b,c,p){ const r=b.heights[c]; b.cells[r][c]=p; b.heights[c]++; return r; }
function winAt(b,r,c,p){ const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(const [dr,dc] of dirs){ let cnt=1;
    for(const s of [1,-1]){ let rr=r+dr*s,cc=c+dc*s;
      while(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS&&b.cells[rr][cc]===p){ cnt++; rr+=dr*s; cc+=dc*s; } }
    if(cnt>=4) return true; } return false; }
function winCells(b,p){ const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ if(b.cells[r][c]!==p)continue;
    for(const [dr,dc] of dirs){ const line=[[r,c]]; let rr=r+dr,cc=c+dc;
      while(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS&&b.cells[rr][cc]===p){ line.push([rr,cc]); rr+=dr; cc+=dc; }
      if(line.length>=4) return line.slice(0,4); } } return null; }
const isDraw=b=> b.heights.every(h=>h===ROWS);
const cellX=c=>(GRID.left+c*GRID.stepx)*100;
const cellY=r=>(GRID.top+(ROWS-1-r)*GRID.stepy)*100;
const tokImg=p=> p>0?'p4/jeton-rouge.webp':'p4/jeton-jaune.webp';

const p4={
  id:'p4', label:'Puissance 4', minP:2, maxP:2, family:'none',
  deal(names){ return {players:names.map(n=>({name:n})),
    cells:Array.from({length:ROWS},()=>new Array(COLS).fill(0)), heights:new Array(COLS).fill(0), turn:1}; },
  view(s,name){ const i=s.players.findIndex(p=>p.name===name); const me=i===0?1:-1;
    return {game:'p4', cells:s.cells, heights:s.heights, turn:s.turn, myTurn: !s.over && s.turn===me,
      me, winLine:s.winLine||null, names:s.players.map(p=>p.name),
      players:s.players.map((p,j)=>({name:p.name, mark:j===0?'🔴':'🟡', turn:(j===0?1:-1)===s.turn}))}; },
  apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name); const me=i===0?1:-1;
    if(s.over || s.turn!==me || a.type!=='drop') return {ok:false};
    const c=a.col; if(!(c>=0&&c<COLS) || !canPlay(s,c)) return {ok:false};
    const r=play(s,c,me);
    let msg=name+' joue la colonne '+(c+1)+'.';
    if(winAt(s,r,c,me)){ s.over=true; s.winner=i; s.winLine=winCells(s,me); }
    else if(isDraw(s)){ s.over=true; s.draw=true; }
    else s.turn=-me;
    return {ok:true,msg}; },
  isOver(s){ if(!s.over) return null;
    if(s.draw) return {over:true,text:'Match nul — plateau plein !'};
    return {over:true,text:'🔴🟡 '+s.players[s.winner].name+' aligne quatre — gagné !'}; },
  render(v,ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name+' '+p.mark,count:'',turn:p.turn})));
    const wrap=document.createElement('div'); wrap.className='p4-wrap';
    const tl=document.createElement('div'); tl.className='p4-layer';
    for(let col=0;col<COLS;col++) for(let r=0;r<v.heights[col];r++){
      const t=document.createElement('div'); t.className='p4-token';
      t.style.left=cellX(col)+'%'; t.style.top=cellY(r)+'%'; t.style.width=(GRID.rad*2*100)+'%';
      const img=new Image(); img.src=tokImg(v.cells[r][col]); t.appendChild(img);
      if(v.winLine && v.winLine.some(([wr,wc])=>wr===r&&wc===col)) t.style.filter='drop-shadow(0 0 8px #fff) drop-shadow(0 0 14px var(--accent))';
      tl.appendChild(t);
    }
    wrap.appendChild(tl);
    const board=document.createElement('div'); board.className='p4-board'; wrap.appendChild(board);
    if(v.myTurn){ const cols=document.createElement('div'); cols.className='p4-cols';
      for(let col=0;col<COLS;col++){ const cc=document.createElement('div');
        cc.className='p4-col'+(v.heights[col]<ROWS?' play':'');
        if(v.heights[col]<ROWS){ const cx=col; cc.addEventListener('click',()=>ui.send({type:'drop',col:cx})); }
        cols.appendChild(cc); }
      wrap.appendChild(cols); }
    ui.center(wrap);
    ui.hand(null); ui.buttons([],()=>{});
    ui.say(v.myTurn? ('À vous '+(v.me>0?'🔴':'🟡')+' — touchez une colonne.') : 'En attente de l\u2019adversaire…');
  }
};
NG['p4']=p4; NG.list.push(p4);
})();
