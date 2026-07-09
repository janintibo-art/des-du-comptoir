'use strict';
/* Module réseau : UNO (2-4 joueurs, mains cachées, hôte autoritaire). */
(function(){
const NG=window.NetGames; if(!NG) return;
const COLORS=['R','G','B','Y'];
const CNAME={R:'Rouge',G:'Vert',B:'Bleu',Y:'Jaune'};
const VLABEL={skip:'Passer ⊘',rev:'Inverser ↯',d2:'+2',wild:'Joker',wild4:'+4'};
const fileFor=c=> c.c==='W' ? 'uno/'+(c.v==='wild4'?'W4':'W')+'.webp' : 'uno/'+c.c+'-'+c.v+'.webp';
const vlabel=c=> VLABEL[c.v]||c.v;
const shuffle=d=>{ for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; };
function buildDeck(){ const d=[]; for(const c of COLORS){ d.push({c,v:'0'});
  for(const v of ['1','2','3','4','5','6','7','8','9','skip','rev','d2']){ d.push({c,v}); d.push({c,v}); } }
  for(let i=0;i<4;i++){ d.push({c:'W',v:'wild'}); d.push({c:'W',v:'wild4'}); } return d; }
const playable=(card,top)=> card.c==='W' || card.c===top.color || card.v===top.v;
const sameCard=(a,b)=> a&&b&&a.c===b.c&&a.v===b.v;
function reshuffle(s){ if(s.draw.length||s.discard.length<2) return; const keep=s.discard.pop(); s.draw=shuffle(s.discard); s.discard=[keep]; }
function drawN(s,pi,n){ for(let i=0;i<n;i++){ reshuffle(s); if(!s.draw.length)break; s.players[pi].hand.push(s.draw.shift()); } }
function advance(s,steps){ const N=s.players.length; s.turn=((s.turn+s.dir*steps)%N+N)%N; }

const uno={
  id:'uno', label:'UNO', minP:2, maxP:4, family:'none',
  deal(names){ const draw=shuffle(buildDeck());
    const players=names.map(n=>({name:n, hand:draw.splice(0,7)}));
    let start=draw.shift(),g=0; while(start.v==='wild4'&&g++<50){ draw.push(start); shuffle(draw); start=draw.shift(); }
    return {players, draw, discard:[start], top:{color:start.c==='W'?COLORS[Math.floor(Math.random()*4)]:start.c, v:start.v},
      dir:1, turn:0, phase:'play', drawn:null, msg:null}; },
  view(s,name){ const i=s.players.findIndex(p=>p.name===name); const p=s.players[i];
    return {game:'uno', top:s.top, dir:s.dir, drawCount:s.draw.length,
      myTurn: !s.over && i===s.turn, phase:s.phase, hand:p.hand,
      drawn: (s.phase==='drawn'&&i===s.turn)? s.drawn : null,
      msg:s.msg, names:s.players.map(q=>q.name),
      players:s.players.map((q,j)=>({name:q.name, count:q.hand.length, turn:j===s.turn}))}; },
  apply(s,name,a){ const i=s.players.findIndex(p=>p.name===name);
    if(s.over || i!==s.turn) return {ok:false};
    const p=s.players[i], N=s.players.length;
    function doPlay(card, chosen){ const idx=p.hand.findIndex(c=>sameCard(c,card)); if(idx<0) return null;
      if(!playable(card,s.top)) return null;
      if(card.c==='W' && !COLORS.includes(chosen)) return null;
      p.hand.splice(idx,1); s.discard.push(card);
      s.top={color: card.c==='W'?chosen:card.c, v:card.v}; s.phase='play'; s.drawn=null;
      let msg=name+' joue '+vlabel(card)+(card.c==='W'?(' → '+CNAME[chosen]):'');
      if(p.hand.length===0){ s.over=true; s.winner=i; return {ok:true,msg}; }
      if(card.v==='skip'){ advance(s,2); }
      else if(card.v==='rev'){ s.dir=-s.dir; advance(s,N===2?2:1); }
      else if(card.v==='d2'){ const nx=((s.turn+s.dir)%N+N)%N; drawN(s,nx,2); msg+=' — '+s.players[nx].name+' pioche 2 !'; advance(s,2); }
      else if(card.v==='wild4'){ const nx=((s.turn+s.dir)%N+N)%N; drawN(s,nx,4); msg+=' — '+s.players[nx].name+' pioche 4 !'; advance(s,2); }
      else advance(s,1);
      s.msg=msg; return {ok:true,msg}; }
    if(a.type==='play'){ if(s.phase!=='play') return {ok:false}; const r=doPlay(a.card,a.color); return r||{ok:false}; }
    if(a.type==='draw'){ if(s.phase!=='play') return {ok:false};
      drawN(s,i,1); s.drawn=p.hand[p.hand.length-1]||null; s.phase='drawn'; s.msg=name+' pioche.'; return {ok:true,msg:s.msg}; }
    if(a.type==='playdrawn'){ if(s.phase!=='drawn'||!s.drawn) return {ok:false};
      if(!sameCard(a.card,s.drawn)) return {ok:false}; const r=doPlay(a.card,a.color); return r||{ok:false}; }
    if(a.type==='pass'){ if(s.phase!=='drawn') return {ok:false}; s.phase='play'; s.drawn=null; advance(s,1); s.msg=name+' passe.'; return {ok:true,msg:s.msg}; }
    return {ok:false}; },
  isOver(s){ if(!s.over) return null; return {over:true, text:'🎴 '+s.players[s.winner].name+' pose sa dernière carte — UNO !'}; },
  render(v,ui){
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name,count:p.count,turn:p.turn})));
    const t=document.createElement('div'); t.className='uno-table';
    const info=document.createElement('div'); info.className='uno-info';
    info.innerHTML='Couleur : <span class="uno-color color-'+v.top.color+'"></span> '+CNAME[v.top.color]+' <span class="uno-dir">'+(v.dir>0?'↻':'↺')+'</span>';
    t.appendChild(info);
    const piles=document.createElement('div'); piles.className='uno-piles';
    const disc=document.createElement('div'); disc.className='uno-card'; const di=new Image(); di.src=fileFor(v.top.v==='wild'||v.top.v==='wild4'?{c:'W',v:v.top.v}:{c:v.top.color,v:v.top.v}); disc.appendChild(di);
    const draw=document.createElement('div'); draw.className='uno-draw'; draw.innerHTML='<div class="big">🂠</div><div>Pioche</div><div>('+v.drawCount+')</div>';
    if(v.myTurn && v.phase==='play') draw.addEventListener('click',()=>ui.send({type:'draw'}));
    piles.appendChild(disc); piles.appendChild(draw); t.appendChild(piles);
    ui.center(t);
    // hand
    const playCard=(card,drawn)=>{ if(card.c==='W'){ ui.say('Choisissez une couleur.');
        ui.choose([{id:'R',label:'🔴 Rouge',primary:true},{id:'G',label:'🟢 Vert'},{id:'B',label:'🔵 Bleu'},{id:'Y',label:'🟡 Jaune'}],
          col=>ui.send({type:drawn?'playdrawn':'play', card, color:col})); }
      else ui.send({type:drawn?'playdrawn':'play', card}); };
    const hand=document.createElement('div'); hand.className='uno-hand';
    v.hand.forEach(card=>{ const b=document.createElement('button');
      const canPlay = v.myTurn && (v.phase==='play'? playable(card,v.top) : (v.drawn && card.c===v.drawn.c && card.v===v.drawn.v && playable(card,v.top)));
      b.className='unocard'+(canPlay?' play':(v.myTurn?' off':''));
      const im=new Image(); im.src=fileFor(card); im.draggable=false; b.appendChild(im);
      if(canPlay) b.addEventListener('click',()=>playCard(card, v.phase==='drawn')); else b.disabled=true;
      hand.appendChild(b); });
    ui.hand(hand);
    if(v.phase==='drawn' && v.myTurn){
      const btns=[]; if(v.drawn && playable(v.drawn,v.top)) btns.push({id:'playdrawn',label:'Jouer '+vlabel(v.drawn),primary:true});
      btns.push({id:'pass',label:'Garder & passer'});
      ui.buttons(btns, id=>{ if(id==='pass') ui.send({type:'pass'}); else playCard(v.drawn,true); });
    } else ui.buttons([],()=>{});
    ui.say(v.msg? v.msg : (v.myTurn? (v.phase==='drawn'?'Jouez la carte piochée ou passez.':'À vous — couleur ou valeur, ou piochez.') : 'En attente…'));
  }
};
NG['uno']=uno; NG.list.push(uno);
})();
