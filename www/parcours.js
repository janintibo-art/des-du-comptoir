'use strict';
/* Socle commun aux jeux de parcours (oie, échelles) :
   - choix des pions (5 personnages découpés OU pastilles colorées)
   - rendu d'un plateau image avec pions posés sur un chemin de cases. */
(function(){
const PAWNS=[
  {id:'roi',    label:'👑 Roi',      img:'pions/pion-roi.webp'},
  {id:'fusee',  label:'🚀 Fusée',    img:'pions/pion-fusee.webp'},
  {id:'monstre',label:'👾 Monstre',  img:'pions/pion-monstre.webp'},
  {id:'clown',  label:'🤡 Clown',    img:'pions/pion-clown.webp'},
  {id:'mage',   label:'🧙 Magicien', img:'pions/pion-mage.webp'},
];
const DOTS=[
  {id:'dot-r', label:'🔴 Rouge',  color:'#d63b3b'},
  {id:'dot-b', label:'🔵 Bleu',   color:'#3366cc'},
  {id:'dot-g', label:'🟢 Vert',   color:'#3aa63a'},
  {id:'dot-y', label:'🟡 Jaune',  color:'#e6b800'},
  {id:'dot-p', label:'🟣 Violet', color:'#8a4fd0'},
];
const byId=id=> PAWNS.find(p=>p.id===id) || DOTS.find(p=>p.id===id);

/* élément visuel d'un pion (image ou pastille) */
function pawnEl(id){
  const p=byId(id); const d=document.createElement('div'); d.className='pc-pawn';
  if(p && p.img){ const im=new Image(); im.src=p.img; im.alt=''; d.appendChild(im); }
  else { d.classList.add('dot'); d.style.background=(p&&p.color)||'#888'; }
  return d;
}

/* Sélecteur de pion pour un joueur (renvoie un <select>) */
function buildPawnSelect(sel, taken){
  sel.innerHTML=''; taken=taken||[];
  const og1=document.createElement('optgroup'); og1.label='Personnages';
  PAWNS.forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=p.label; og1.appendChild(o); });
  const og2=document.createElement('optgroup'); og2.label='Pastilles';
  DOTS.forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=p.label; og2.appendChild(o); });
  sel.appendChild(og1); sel.appendChild(og2);
}

/* Rendu du plateau : container, cfg={image, path:[{x,y}...en fractions 0..1], links?}, 
   state={pawns:[{pos,pawnId}]}, opts={highlightCell} */
function drawBoard(container, cfg, state, opts){
  opts=opts||{}; container.innerHTML='';
  const wrap=document.createElement('div'); wrap.className='pc-board';
  wrap.style.backgroundImage='url('+cfg.image+')';
  // liens dessinés (échelles/serpents) — optionnel, léger
  if(cfg.links && cfg.links.length){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','pc-links'); svg.setAttribute('viewBox','0 0 100 100'); svg.setAttribute('preserveAspectRatio','none');
    cfg.links.forEach(l=>{ const a=cfg.path[l.from-1], b=cfg.path[l.to-1]; if(!a||!b)return;
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',a.x*100); line.setAttribute('y1',a.y*100);
      line.setAttribute('x2',b.x*100); line.setAttribute('y2',b.y*100);
      line.setAttribute('class', l.to>l.from?'up':'down'); svg.appendChild(line); });
    wrap.appendChild(svg);
  }
  // pions : regrouper par case pour décaler ceux qui se superposent
  const byCell={}; (state.pawns||[]).forEach((pw,i)=>{ const k=pw.pos; (byCell[k]=byCell[k]||[]).push({pw,i}); });
  Object.keys(byCell).forEach(k=>{ const list=byCell[k]; const cell=Number(k);
    const p = cell<=0? cfg.start : (cfg.path[cell-1]||cfg.start);
    if(!p) return;
    list.forEach(({pw},j)=>{ const el=pawnEl(pw.pawnId);
      const n=list.length; const ang=(j/Math.max(1,n))*Math.PI*2; const rad=n>1?2.4:0;
      el.style.left=(p.x*100 + Math.cos(ang)*rad)+'%';
      el.style.top =(p.y*100 + Math.sin(ang)*rad)+'%';
      if(opts.highlight!=null && opts.highlight===pw.pos) el.classList.add('hi');
      wrap.appendChild(el); });
  });
  container.appendChild(wrap);
  return wrap;
}

window.Parcours={ PAWNS, DOTS, byId, pawnEl, buildPawnSelect, drawBoard };
})();
