'use strict';
/* Rendu 3D (Babylon.js) pour l'Awalé — réutilise la géométrie 2D (BOARDS) et l'état s.
   Awale3D.render(container, board, s, opts, boardImg, seedFile) :
     board = {w,h,top,bot,cols[6],storeL,storeR,pit}
     s = {pits[12], stores[2], turn}   opts = {names, legalPits:Set, onPit(i)} */
(function(){
if(typeof window==='undefined') return;
const A={ canvas:null, eng:null, scene:null, cam:null, ready:false, PW:12, PD:4,
  pits:[], dyn:[], numTex:{}, seedMats:[], _onPick:null, cfg:null };

function pitFrac(b,i){ return i<6 ? [b.cols[i], b.bot] : [b.cols[11-i], b.top]; }
function toWorld(fx,fy){ return new BABYLON.Vector3((fx-0.5)*A.PW, 0, (fy-0.5)*A.PD); }
function numTexture(n){ if(A.numTex[n]) return A.numTex[n]; const t=new BABYLON.DynamicTexture('n'+n,{width:64,height:64},A.scene,false);
  t.hasAlpha=true; const c=t.getContext(); c.clearRect(0,0,64,64); c.fillStyle='#f2e8d5'; c.font='bold 40px Georgia'; c.textAlign='center'; c.textBaseline='middle';
  c.strokeStyle='rgba(0,0,0,.7)'; c.lineWidth=5; c.strokeText(''+n,32,34); c.fillText(''+n,32,34); t.update(); A.numTex[n]=t; return t; }

A.mount=function(parent, board, boardImg){ A.cfg={board,boardImg};
  A.PD = A.PW * (board.h/board.w);
  if(A.canvas){ if(A.canvas.parentNode!==parent) parent.appendChild(A.canvas); if(A.eng) setTimeout(()=>A.eng.resize(),0);
    if(A.ground && A.ground.material && A.ground.material.diffuseTexture && A.ground.material.diffuseTexture.url!==boardImg){ A.ground.material.diffuseTexture=new BABYLON.Texture(boardImg,A.scene); } return; }
  const cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:60vh;max-height:70vh;display:block;border-radius:12px;touch-action:none;outline:none;background:#0c0c0a';
  parent.appendChild(cv); A.canvas=cv;
  const eng=new BABYLON.Engine(cv,true,{stencil:true,preserveDrawingBuffer:true}); A.eng=eng;
  const sc=new BABYLON.Scene(eng); sc.clearColor=new BABYLON.Color4(0.05,0.05,0.045,1); A.scene=sc;
  const cam=new BABYLON.ArcRotateCamera('c',-Math.PI/2,0.62,A.PW*0.92,BABYLON.Vector3.Zero(),sc);
  cam.attachControl(cv,true); cam.lowerBetaLimit=0.12; cam.upperBetaLimit=1.25; cam.lowerRadiusLimit=A.PW*0.6; cam.upperRadiusLimit=A.PW*1.8;
  cam.wheelPrecision=40; cam.panningSensibility=0; cam.minZ=0.05; A.cam=cam;
  const hemi=new BABYLON.HemisphericLight('h',new BABYLON.Vector3(0,1,0),sc); hemi.intensity=0.92; hemi.groundColor=new BABYLON.Color3(0.12,0.1,0.08);
  const dir=new BABYLON.DirectionalLight('d',new BABYLON.Vector3(-0.35,-1,0.4),sc); dir.position=new BABYLON.Vector3(A.PW*0.4,A.PW,-A.PW*0.4); dir.intensity=0.6;
  A.shadow=new BABYLON.ShadowGenerator(1024,dir); A.shadow.useBlurExponentialShadowMap=true; A.shadow.blurKernel=16;
  // plateau (image posée à plat)
  const g=BABYLON.MeshBuilder.CreateGround('bd',{width:A.PW,height:A.PD},sc);
  const m=new BABYLON.StandardMaterial('bdm',sc); const t=new BABYLON.Texture(boardImg,sc); t.hasAlpha=true;
  m.diffuseTexture=t; m.useAlphaFromDiffuseTexture=true; m.specularColor=new BABYLON.Color3(0.06,0.05,0.04); g.material=m; g.receiveShadows=true; A.ground=g;
  // matériaux graines (assorties, brillantes)
  const mkS=(r,gg,bl)=>{ const mm=new BABYLON.StandardMaterial('s',sc); mm.diffuseColor=new BABYLON.Color3(r,gg,bl); mm.specularColor=new BABYLON.Color3(0.7,0.65,0.55); mm.specularPower=48; return mm; };
  A.seedMats=[mkS(0.55,0.32,0.16), mkS(0.72,0.5,0.22), mkS(0.4,0.22,0.12), mkS(0.8,0.68,0.42), mkS(0.5,0.4,0.2)];
  // zones de clic : 12 trous + 2 réservoirs
  A.pits=[]; for(let i=0;i<12;i++){ const [fx,fy]=pitFrac(board,i); const p=toWorld(fx,fy);
    const z=BABYLON.MeshBuilder.CreateCylinder('pit:'+i,{diameter:board.pit*A.PW*1.05,height:0.1,tessellation:20},sc);
    z.position.set(p.x,0.05,p.z); z.visibility=0.0001; z.isPickable=true; A.pits.push(z); }
  sc.onPointerObservable.add(pi=>{ if(pi.type!==BABYLON.PointerEventTypes.POINTERPICK) return; const r=pi.pickInfo; if(!r||!r.hit||!r.pickedMesh) return;
    const n=r.pickedMesh.name; if(n.startsWith('pit:') && A._onPick) A._onPick(+n.slice(4)); });
  eng.runRenderLoop(()=>sc.render());
  A._resize=()=>{ try{ eng.resize(); }catch(e){} }; addEventListener('resize',A._resize); setTimeout(A._resize,60);
  A.ready=true;
};

function clearDyn(){ A.dyn.forEach(d=>d.dispose()); A.dyn=[]; }

A.update=function(board, s, opts, seedFile){ if(!A.ready) return; opts=opts||{}; clearDyn();
  const oldP=A._lastPits||null; let fromPit=-1;
  if(oldP){ for(let i=0;i<12;i++){ if(oldP[i]>0 && s.pits[i]===0 && (oldP[i]>=s.pits[i]+2||true)){ fromPit=i; break; } } }
  A._lastPits=s.pits.slice();
  A._onPick=(i)=>{ if(opts.legalPits && opts.legalPits.has(i) && opts.onPit) opts.onPit(i); };
  const PW=A.PW, pitR=board.pit*PW*0.42, seedR=board.pit*PW*0.11;
  // graines dans chaque trou
  for(let i=0;i<12;i++){ const cnt=s.pits[i]; const [fx,fy]=pitFrac(board,i); const p=toWorld(fx,fy);
    const showN=Math.min(cnt,16);
    const oldCnt=oldP?Math.min(oldP[i],16):showN;
    for(let k=0;k<showN;k++){ const sp=BABYLON.MeshBuilder.CreateSphere('sd',{diameter:seedR*2,segments:10},A.scene);
      const ring=Math.floor(k/6), idx=k%6, ang=idx*(Math.PI/3)+i*1.3+ring*0.5, rr=(showN>1?(0.35+ring*0.28):0)*pitR;
      const ty=seedR + ring*seedR*1.2, tx=p.x+Math.cos(ang)*rr, tz=p.z+Math.sin(ang)*rr;
      sp.material=A.seedMats[(i*7+k)%A.seedMats.length]; A.shadow&&A.shadow.addShadowCaster(sp); A.dyn.push(sp);
      if(oldP && k>=oldCnt && fromPit>=0){ // nouvelle graine -> chute décalée (ordre du semis)
        const stepIdx=((i-fromPit)+12)%12; sp.position.set(tx, ty+3, tz); sp.setEnabled(false);
        const fps=60,dur=10; const a=new BABYLON.Animation('dr','position.y',fps,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        a.setKeys([{frame:0,value:ty+3},{frame:dur,value:ty},{frame:dur+3,value:ty+seedR*0.7},{frame:dur+6,value:ty}]);
        setTimeout(()=>{ try{ if(sp.isDisposed&&sp.isDisposed())return; sp.setEnabled(true); A.scene.beginDirectAnimation(sp,[a],0,dur+6,false); }catch(e){} }, 120*stepIdx);
      } else { sp.position.set(tx, ty, tz); } }
    // surbrillance trou jouable
    if(opts.legalPits && opts.legalPits.has(i)){ const tor=BABYLON.MeshBuilder.CreateTorus('pl',{diameter:board.pit*PW*1.0,thickness:board.pit*PW*0.07,tessellation:26},A.scene);
      tor.position.set(p.x,0.06,p.z); const tm=new BABYLON.StandardMaterial('tm',A.scene); tm.emissiveColor=new BABYLON.Color3(0.9,0.66,0.32); tm.disableLighting=true; tor.material=tm; tor.isPickable=false; A.dyn.push(tor); }
    // nombre au-dessus
    if(cnt>0){ const pl=BABYLON.MeshBuilder.CreatePlane('num',{width:pitR*1.1,height:pitR*1.1},A.scene); pl.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;
      pl.position.set(p.x, seedR*2 + Math.min(cnt,16)/6*seedR*1.2 + pitR*0.8, p.z);
      const nm=new BABYLON.StandardMaterial('nm',A.scene); nm.diffuseTexture=numTexture(cnt); nm.useAlphaFromDiffuseTexture=true; nm.emissiveColor=new BABYLON.Color3(1,1,1); nm.disableLighting=true; nm.backFaceCulling=false; pl.material=nm; pl.isPickable=false; A.dyn.push(pl); }
  }
  // réservoirs : petit tas + nombre
  const stores=[[board.storeR,s.stores[0],0],[board.storeL,s.stores[1],1]];
  stores.forEach(([pos,count,who])=>{ const p=toWorld(pos[0],pos[1]);
    const showN=Math.min(count,20);
    for(let k=0;k<showN;k++){ const sp=BABYLON.MeshBuilder.CreateSphere('sd',{diameter:seedR*2,segments:8},A.scene);
      const ang=k*1.3, ring=Math.floor(k/7), rr=(0.3+ring*0.25)*pitR;
      sp.position.set(p.x+Math.cos(ang)*rr, seedR+ring*seedR, p.z+Math.sin(ang)*rr);
      sp.material=A.seedMats[k%A.seedMats.length]; A.dyn.push(sp); }
    const pl=BABYLON.MeshBuilder.CreatePlane('num',{width:pitR*1.3,height:pitR*1.3},A.scene); pl.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;
    pl.position.set(p.x, pitR*1.2, p.z); const nm=new BABYLON.StandardMaterial('nm',A.scene); nm.diffuseTexture=numTexture(count); nm.useAlphaFromDiffuseTexture=true; nm.emissiveColor=new BABYLON.Color3(1,0.9,0.7); nm.disableLighting=true; nm.backFaceCulling=false; pl.material=nm; pl.isPickable=false; A.dyn.push(pl); });
};

A.render=function(container, board, s, opts, boardImg, seedFile){ A.mount(container, board, boardImg); A.update(board, s, opts, seedFile); };
A.unmount=function(){ try{ if(A._resize) removeEventListener('resize',A._resize); if(A.eng) A.eng.dispose(); }catch(e){}
  if(A.canvas && A.canvas.parentNode) A.canvas.parentNode.removeChild(A.canvas);
  A.canvas=null; A.eng=null; A.scene=null; A.ready=false; A.pits=[]; A.dyn=[]; A.numTex={}; A.seedMats=[]; };
window.Awale3D=A;
})();
