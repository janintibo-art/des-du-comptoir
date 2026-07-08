'use strict';
/* Cartes à jouer : paquet de 52 ou tarot de 78, styles illustrés (webp) ou dessin,
   rendu HTML. Réutilisable pour tous les jeux de cartes du Comptoir. */
const Cards = (function(){
  const SUITS = ['pique','coeur','carreau','trefle'];
  const SUIT_CHAR = {pique:'\u2660', coeur:'\u2665', carreau:'\u2666', trefle:'\u2663'};
  const SUIT_RED = {pique:false, coeur:true, carreau:true, trefle:false};
  const RANKS = ['A','2','3','4','5','6','7','8','9','10','V','D','R'];         // jeu de 52
  const RANKS_T = ['A','2','3','4','5','6','7','8','9','10','V','C','D','R'];   // couleurs du tarot

  /* Styles de cartes — libellés modifiables librement */
  const SKINS = [
    {id:'jeu1',    label:'Illustré n°1',    img:true,  tarot:false},
    {id:'jeu2',    label:'Illustré n°2',    img:true,  tarot:false},
    {id:'jeu3',    label:'Illustré n°3',    img:true,  tarot:false},
    {id:'taverne', label:'Tarot Taverne',   img:true,  tarot:true},
    {id:'retro',   label:'Tarot Rétro',     img:true,  tarot:true},
    {id:'dessin',  label:'Simple (dessin)', img:false, tarot:false},
  ];
  let skin = 'jeu1';
  try{ const s = localStorage.getItem('cardSkin'); if(s && SKINS.some(k=>k.id===s)) skin = s; }catch(e){}
  const skinObj = ()=> SKINS.find(k=>k.id===skin);

  function deck(){
    const d = [];
    SUITS.forEach(s => RANKS.forEach(r => d.push({r, s})));
    return d;
  }
  function deckTarot(){
    const d = [];
    SUITS.forEach(s => RANKS_T.forEach(r => d.push({r, s})));
    for(let n = 1; n <= 21; n++) d.push({atout:n});
    d.push({excuse:true});
    return d;
  }
  function shuffle(d){
    for(let i = d.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }
  function label(c){
    if(c.excuse) return 'Excuse';
    if(c.atout) return 'Atout ' + c.atout;
    return c.r + SUIT_CHAR[c.s];
  }
  function same(a, b){
    if(!a || !b) return false;
    if(a.excuse || b.excuse) return !!a.excuse === !!b.excuse;
    if(a.atout || b.atout) return a.atout === b.atout;
    return a.r === b.r && a.s === b.s;
  }
  function file(c){
    if(c.excuse) return 'excuse';
    if(c.atout) return 'atout-' + c.atout;
    return c.s + '-' + c.r;
  }
  function textHTML(c){
    if(c.excuse) return '<span class="rk">EX</span><span class="st">\u2605</span>';
    if(c.atout) return '<span class="rk">'+c.atout+'</span><span class="st">\u2605</span>';
    return '<span class="rk">'+c.r+'</span><span class="st">'+SUIT_CHAR[c.s]+'</span>';
  }

  /* rendu d'une carte ; opts: {back, onClick, disabled} */
  function el(c, opts){
    opts = opts || {};
    const d = document.createElement('button');
    d.className = 'pcard'
      + (opts.back ? ' back' : (c && !c.atout && !c.excuse && SUIT_RED[c.s] ? ' red' : ''))
      + (opts.disabled ? ' off' : '');
    if(opts.back){
      d.innerHTML = '<span class="st">\ud83c\udfb2</span>';
    } else if(skinObj().img){
      d.classList.add('img');
      const img = new Image();
      img.src = 'cards/' + skin + '/' + file(c) + '.webp';
      img.alt = label(c); img.draggable = false;
      img.onerror = ()=>{ d.classList.remove('img'); d.innerHTML = textHTML(c); };
      d.appendChild(img);
      d.setAttribute('aria-label', label(c));
    } else {
      d.innerHTML = textHTML(c);
      d.setAttribute('aria-label', label(c));
    }
    if(opts.onClick && !opts.disabled) d.addEventListener('click', ()=> opts.onClick(c));
    else d.disabled = true;
    return d;
  }

  function buildSkinSelect(sel, onChange){
    SKINS.forEach(k=>{
      const o = document.createElement('option');
      o.value = k.id; o.textContent = k.label;
      sel.appendChild(o);
    });
    sel.value = skin;
    sel.addEventListener('change', ()=>{
      skin = sel.value;
      try{ localStorage.setItem('cardSkin', skin); }catch(e){}
      if(onChange) onChange(skin);
    });
  }

  return {SUITS, SUIT_CHAR, RANKS, RANKS_T, SKINS,
          deck, deckTarot, shuffle, label, same, file, el, buildSkinSelect,
          skin: ()=> skin};
})();
