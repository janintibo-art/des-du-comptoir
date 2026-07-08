'use strict';
/* Dominos : jeu double-six, styles illustrés (webp) ou texte, rendu HTML. */
const Dominos=(function(){
  const SKINS=[
    {id:'classique',label:'Classique couleurs'},
    {id:'graphique',label:'Noir & blanc'},
    {id:'bois',label:'Bois gravé'},
    {id:'arcade',label:'Arcade smileys'},
    {id:'bonbons',label:'Cœurs bonbons'},
    {id:'neon',label:'Étoiles néon'},
    {id:'gemmes',label:'Gemmes'},
    {id:'kawaii',label:'Pattes kawaii'},
    {id:'musique',label:'Notes de musique'},
    {id:'galaxie',label:'Galaxie'},
  ];
  let skin='classique';
  try{ const s=localStorage.getItem('domSkin'); if(s&&SKINS.some(k=>k.id===s)) skin=s; }catch(e){}
  function fullSet(){ const t=[]; for(let a=0;a<=6;a++) for(let b=a;b<=6;b++) t.push({a,b}); return t; }
  function shuffle(d){ for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; }
  function file(t){ const a=Math.min(t.a,t.b),b=Math.max(t.a,t.b); return a+'-'+b; }
  const pip=t=>t.a+t.b;
  function el(t,opts){
    opts=opts||{};
    const d=document.createElement('button');
    d.className='domino'+(opts.horizontal?' horiz':'')+(opts.flip?' flip':'')+(opts.disabled?' off':'');
    if(opts.back){ d.classList.add('back'); d.innerHTML='<span class="dg">🁢</span>'; }
    else{
      const img=new Image(); img.src='dominos/'+skin+'/'+file(t)+'.webp';
      img.alt=t.a+'|'+t.b; img.draggable=false;
      img.onerror=()=>{ d.classList.add('txt'); d.textContent=t.a+' · '+t.b; };
      d.appendChild(img);
      d.setAttribute('aria-label', t.a+' '+t.b);
    }
    if(opts.onClick && !opts.disabled) d.addEventListener('click', ()=>opts.onClick(t));
    else d.disabled=true;
    return d;
  }
  function buildSkinSelect(sel,onChange){
    SKINS.forEach(k=>{ const o=document.createElement('option'); o.value=k.id; o.textContent=k.label; sel.appendChild(o); });
    sel.value=skin;
    sel.addEventListener('change', ()=>{ skin=sel.value; try{ localStorage.setItem('domSkin',skin); }catch(e){} if(onChange) onChange(skin); });
  }
  return {SKINS,fullSet,shuffle,file,pip,el,buildSkinSelect,skin:()=>skin};
})();
