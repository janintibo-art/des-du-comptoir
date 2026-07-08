'use strict';
/* Awalé (Oware) : rendu du plateau, graines et réservoirs, avec styles au choix.
   pits 0-5 = joueur du bas (0), 6-11 = joueur du haut (1). Semailles anti-horaires. */
const Awale=(function(){
  const BOARDS=[
    {id:'board1', label:'Plateau royal', w:1574, h:478,
      top:0.205, bot:0.645, cols:[0.243,0.346,0.450,0.554,0.657,0.761],
      storeL:[0.145,0.425], storeR:[0.863,0.425], pit:0.086},
    {id:'board2', label:'Plateau sculpté', w:1657, h:496,
      top:0.175, bot:0.545, cols:[0.235,0.348,0.460,0.573,0.686,0.800],
      storeL:[0.070,0.36], storeR:[0.930,0.36], pit:0.094},
  ];
  const SEEDN=14;
  let boardId='board1'; try{ const b=localStorage.getItem('awBoard'); if(b&&BOARDS.some(x=>x.id===b))boardId=b; }catch(e){}
  let seedSel='mix'; try{ const sdv=localStorage.getItem('awSeed'); if(sdv!=null)seedSel=sdv; }catch(e){}
  const B=()=>BOARDS.find(b=>b.id===boardId)||BOARDS[0];
  const boardImg=()=>'awale/boards/'+boardId+'.webp';
  const seedFile=k=>'awale/seeds/seed'+(seedSel==='mix'?(((k%SEEDN)+SEEDN)%SEEDN):seedSel)+'.webp';
  function buildSkinSelect(sel,onChange){ sel.innerHTML='';
    BOARDS.forEach(b=>{ const o=document.createElement('option'); o.value=b.id; o.textContent=b.label; sel.appendChild(o); });
    sel.value=boardId; sel.addEventListener('change',()=>{ boardId=sel.value; try{localStorage.setItem('awBoard',boardId);}catch(e){} if(onChange)onChange(); }); }
  function buildSeedSelect(sel,onChange){ sel.innerHTML='';
    const mix=document.createElement('option'); mix.value='mix'; mix.textContent='Graines assorties'; sel.appendChild(mix);
    for(let i=0;i<SEEDN;i++){ const o=document.createElement('option'); o.value=''+i; o.textContent='Graine '+(i+1); sel.appendChild(o); }
    sel.value=seedSel; sel.addEventListener('change',()=>{ seedSel=sel.value; try{localStorage.setItem('awSeed',seedSel);}catch(e){} if(onChange)onChange(); }); }
  function pitCenter(b,i){ return i<6 ? [b.cols[i], b.bot] : [b.cols[11-i], b.top]; }
  function render(container, s, opts){
    opts=opts||{}; const b=B(); container.innerHTML='';
    const wrap=document.createElement('div'); wrap.className='awale-board';
    wrap.style.aspectRatio=b.w+'/'+b.h; wrap.style.backgroundImage='url('+boardImg()+')';
    for(let i=0;i<12;i++){ const c=pitCenter(b,i); const cnt=s.pits[i];
      const pit=document.createElement('div'); pit.className='awale-pit';
      pit.style.left=(c[0]*100)+'%'; pit.style.top=(c[1]*100)+'%'; pit.style.width=(b.pit*100)+'%';
      const seeds=document.createElement('div'); seeds.className='seeds';
      const showN=Math.min(cnt,10);
      for(let k=0;k<showN;k++){ const img=document.createElement('img'); img.src=seedFile(i*7+k); img.className='seed'; img.draggable=false;
        const ang=(k/Math.max(1,showN))*6.283+i*1.7; const rr=(showN>1?0.62:0);
        img.style.left=(50+Math.cos(ang)*rr*32)+'%'; img.style.top=(50+Math.sin(ang)*rr*32)+'%';
        seeds.appendChild(img); }
      const badge=document.createElement('div'); badge.className='cnt'; badge.textContent=cnt; pit.appendChild(seeds); pit.appendChild(badge);
      if(opts.legalPits && opts.legalPits.has(i)){ pit.classList.add('play'); if(opts.onPit) pit.addEventListener('click',()=>opts.onPit(i)); }
      wrap.appendChild(pit);
    }
    const mkStore=(pos,count,who,turn)=>{ const st=document.createElement('div'); st.className='awale-store'+(turn?' turn':'');
      st.style.left=(pos[0]*100)+'%'; st.style.top=(pos[1]*100)+'%';
      st.innerHTML='<div class="stlbl">'+who+'</div><div class="stcnt">'+count+'</div>'; wrap.appendChild(st); };
    const nm=opts.names||['Bas','Haut'];
    mkStore(b.storeR, s.stores[0], nm[0], s.turn===0);
    mkStore(b.storeL, s.stores[1], nm[1], s.turn===1);
    container.appendChild(wrap);
  }
  return {BOARDS, boardImg, seedFile, buildSkinSelect, buildSeedSelect, render, board:()=>boardId,
    // exposé pour le sélecteur du shell
    el:()=>document.createElement('span') };
})();
