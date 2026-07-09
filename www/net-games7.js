'use strict';
/* Module réseau : Reversi / Othello (2 joueurs, information publique). */
(function(){
const NG=window.NetGames; if(!NG) return;
const SKINS=[
  {id:'bois',   img:'reversi/bois.webp',   G:{x0:0.157,y0:0.156,dx:0.0980,dy:0.0980}},
  {id:'marbre', img:'reversi/marbre.webp', G:{x0:0.116,y0:0.116,dx:0.1090,dy:0.1085}},
];
function curSkin(){ let id='bois'; try{ id=localStorage.getItem('reversiSkin')||'bois'; }catch(e){} return SKINS.find(s=>s.id===id)||SKINS[0]; }
const DISC={1:'reversi/pion-noir.webp','-1':'reversi/pion-blanc.webp'};
const D=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
function startO(){ const b=new Array(64).fill(0); b[27]=1;b[28]=-1;b[35]=-1;b[36]=1; return b; }
function flips(b,sq,p){ if(b[sq]!==0) return null; const r=sq>>3,c=sq&7,out=[];
  for(const [dr,dc] of D){ let rr=r+dr,cc=c+dc,line=[];
    while(rr>=0&&rr<8&&cc>=0&&cc<8){ const x=rr*8+cc; if(b[x]===-p){line.push(x);rr+=dr;cc+=dc;} else if(b[x]===p){ if(line.length)out.push(...line); break; } else break; } }
  return out.length?out:null; }
function legal(b,p){ const m=[]; for(let s=0;s<64;s++) if(b[s]===0&&flips(b,s,p)) m.push(s); return m; }
function counts(b){ let n=0,w=0; for(let s=0;s<64;s++){ if(b[s]===1)n++; else if(b[s]===-1)w++; } return {n,w}; }

const reversi={
  id:'reversi', label:'Reversi / Othello', minP:2, maxP:2, family:'reversi',
  deal(names){ return {players:names.map(n=>({name:n})), b:startO(), turn:1}; }, // P0=noir(1), P1=blanc(-1)
  view(s,name){ const i=s.players.findIndex(p=>p.name===name); const me=i===0?1:-1;
    const cc=counts(s.b);
    return {game:'reversi', b:s.b, turn:s.turn, me, myTurn: !s.over && s.turn===me,
      legal: (!s.over && s.turn===me)? legal(s.b,me):[], counts:cc,
      names:s.players.map(p=>p.name),
      players:s.players.map((p,j)=>({name:p.name, mark:j===0?'⚫':'⚪', turn:(j===0?1:-1)===s.turn, score:(j===0?cc.n:cc.w)}))}; },
  apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name); const me=i===0?1:-1;
    if(s.over || s.turn!==me || a.type!=='play') return {ok:false};
    const f=flips(s.b,a.sq,me); if(!f) return {ok:false};
    s.b[a.sq]=me; f.forEach(x=>s.b[x]=me);
    let msg=name+' retourne '+f.length+' pion'+(f.length>1?'s':'')+'.';
    const opp=-me;
    if(legal(s.b,opp).length){ s.turn=opp; }
    else if(legal(s.b,me).length){ msg+=' '+s.players[i===0?1:0].name+' passe !'; /* même joueur rejoue */ }
    else { s.over=true; }
    const cc=counts(s.b); if(cc.n+cc.w===64) s.over=true;
    return {ok:true,msg}; },
  isOver(s){ if(!s.over) return null; const cc=counts(s.b);
    const t = cc.n>cc.w? ('⚫ '+s.players[0].name+' gagne') : cc.w>cc.n? ('⚪ '+s.players[1].name+' gagne') : 'Match nul';
    return {over:true, text:t+' !<br>'+s.players[0].name+' : '+cc.n+' — '+s.players[1].name+' : '+cc.w}; },
  render(v,ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name+' '+p.mark, count:p.score, turn:p.turn})));
    const sk=curSkin(); const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:8px;width:100%';
    const sc=document.createElement('div'); sc.style.cssText='font-size:14px;opacity:.9';
    sc.innerHTML='⚫ '+v.names[0]+' : <b>'+v.counts.n+'</b> &nbsp; ⚪ '+v.names[1]+' : <b>'+v.counts.w+'</b>';
    wrap.appendChild(sc);
    const bd=document.createElement('div'); bd.className='rv-board'; bd.style.backgroundImage='url('+sk.img+')';
    const G=sk.G; const size=G.dx*100*0.82;
    for(let s=0;s<64;s++){ if(v.b[s]===0)continue; const col=s&7,row=s>>3;
      const d=document.createElement('div'); d.className='rv-disc'; d.style.left=((G.x0+col*G.dx)*100)+'%'; d.style.top=((G.y0+row*G.dy)*100)+'%'; d.style.width=size+'%'; d.style.height=size+'%';
      const im=new Image(); im.src=DISC[v.b[s]]; d.appendChild(im); bd.appendChild(d); }
    (v.legal||[]).forEach(s=>{ const col=s&7,row=s>>3; const h=document.createElement('div'); h.className='rv-hint';
      h.style.left=((G.x0+col*G.dx)*100)+'%'; h.style.top=((G.y0+row*G.dy)*100)+'%'; h.style.width=(size*0.5)+'%'; h.style.height=(size*0.5)+'%';
      h.addEventListener('click',()=>ui.send({type:'play',sq:s})); bd.appendChild(h); });
    wrap.appendChild(bd); ui.center(wrap); ui.hand(null); ui.buttons([],()=>{});
    ui.say(v.myTurn?'À vous — touchez une case surlignée.':'En attente de l\u2019adversaire…');
  }
};
NG['reversi']=reversi; NG.list.push(reversi);
})();
