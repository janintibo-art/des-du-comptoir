'use strict';
/* Rendu 3D partagé (Babylon.js) pour les jeux de plateau 8x8 (dames, échecs).
   Réutilise la logique 2D : mêmes index i=r*8+c, mêmes picks/dests, callback onCell(i).
   cfg = { plateau, grid:{left,top,cw,ch}, size, pieceSrc(v) }
   update(boardArr, opts) où opts = { sel, dests:Set, picks:Set, lastMv:{from,to}, chkSq, ghost:Set, onCell(i), pieceSrc, king(v) } */
(function(){
if(typeof window==='undefined') return;
const B={ eng:null, scene:null, cam:null, canvas:null, cfg:null, PS:10,
  tiles:[], pieces:{}, highlights:[], texCache:{}, matCache:{}, crownTex:null, ready:false, _onPick:null };

function tex(src){ if(!B.texCache[src]){ const t=new BABYLON.Texture(src,B.scene); t.hasAlpha=true; B.texCache[src]=t; } return B.texCache[src]; }
function pieceMat(src){ if(!B.matCache[src]){ const m=new BABYLON.StandardMaterial('pm_'+src,B.scene); m.diffuseTexture=tex(src);
  m.useAlphaFromDiffuseTexture=true; m.emissiveColor=new BABYLON.Color3(0.55,0.55,0.55); m.disableLighting=true; m.backFaceCulling=false; B.matCache[src]=m; } return B.matCache[src]; }
function sqPos(r,c){ const G=B.cfg.grid, PS=B.PS; const fx=G.left+(c+0.5)*G.cw, fy=G.top+(r+0.5)*G.ch; return new BABYLON.Vector3((fx-0.5)*PS,0,(fy-0.5)*PS); }
function sqWorld(){ return B.cfg.grid.cw*B.PS; }

B.mount=function(parent,cfg){ B.cfg=cfg;
  if(B.canvas){ if(B.canvas.parentNode!==parent) parent.appendChild(B.canvas); if(B.eng) setTimeout(()=>B.eng.resize(),0); return; }
  const cv=document.createElement('canvas'); cv.id='b3dCanvas';
  cv.style.cssText='width:100%;height:78vh;max-height:82vh;display:block;border-radius:12px;touch-action:none;outline:none;background:#0c0c0a';
  parent.appendChild(cv); B.canvas=cv;
  const eng=new BABYLON.Engine(cv,true,{stencil:true,preserveDrawingBuffer:true}); B.eng=eng;
  const sc=new BABYLON.Scene(eng); sc.clearColor=new BABYLON.Color4(0.05,0.05,0.045,1); B.scene=sc;
  const PS=B.PS;
  const cam=new BABYLON.ArcRotateCamera('c',-Math.PI/2,0.66,PS*1.15,BABYLON.Vector3.Zero(),sc);
  cam.attachControl(cv,true); cam.lowerBetaLimit=0.12; cam.upperBetaLimit=1.30;
  cam.lowerRadiusLimit=PS*0.75; cam.upperRadiusLimit=PS*2.0; cam.wheelPrecision=40; cam.panningSensibility=0; cam.minZ=0.05; B.cam=cam;
  const hemi=new BABYLON.HemisphericLight('h',new BABYLON.Vector3(0,1,0),sc); hemi.intensity=0.95; hemi.groundColor=new BABYLON.Color3(0.12,0.12,0.14);
  const dir=new BABYLON.DirectionalLight('d',new BABYLON.Vector3(-0.35,-1,0.45),sc); dir.position=new BABYLON.Vector3(PS*0.5,PS*1.2,-PS*0.5); dir.intensity=0.55;
  B.shadow=new BABYLON.ShadowGenerator(1024,dir); B.shadow.useBlurExponentialShadowMap=true; B.shadow.blurKernel=16;
  // plateau (image posée à plat)
  const g=BABYLON.MeshBuilder.CreateGround('bd',{width:PS,height:PS},sc);
  const m=new BABYLON.StandardMaterial('bdm',sc); const t=new BABYLON.Texture(cfg.plateau,sc); t.hasAlpha=true;
  m.diffuseTexture=t; m.useAlphaFromDiffuseTexture=true; m.specularColor=new BABYLON.Color3(0.05,0.05,0.05); g.material=m; g.receiveShadows=true; B.ground=g;
  // couronne (dames) via texture dynamique
  const ct=new BABYLON.DynamicTexture('crown',{width:96,height:96},sc,false); ct.hasAlpha=true;
  const cx=ct.getContext(); cx.clearRect(0,0,96,96); cx.font='72px serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('👑',48,54); ct.update(); B.crownTex=ct;
  // picking
  sc.onPointerObservable.add(pi=>{ if(pi.type!==BABYLON.PointerEventTypes.POINTERPICK) return; const r=pi.pickInfo; if(!r||!r.hit||!r.pickedMesh) return;
    const n=r.pickedMesh.name; let i=-1; if(n.startsWith('sq:')) i=+n.slice(3); else if(n.startsWith('pc:')) i=+n.slice(3); if(i>=0 && B._onPick) B._onPick(i); });
  eng.runRenderLoop(()=>sc.render());
  B._resize=()=>{ try{ eng.resize(); }catch(e){} }; addEventListener('resize',B._resize); setTimeout(B._resize,60);
  // tuiles de picking (créées une fois)
  const S=cfg.size; B.tiles=[]; for(let r=0;r<S;r++)for(let c=0;c<S;c++){ const i=r*S+c;
    const tile=BABYLON.MeshBuilder.CreateBox('sq:'+i,{width:cfg.grid.cw*PS*0.98,depth:cfg.grid.ch*PS*0.98,height:0.05},sc);
    const p=sqPos(r,c); tile.position.set(p.x,0.025,p.z); tile.visibility=0.0001; tile.isPickable=true; B.tiles.push(tile); }
  B.ready=true;
};

function clearDynamic(){ Object.values(B.pieces).forEach(p=>{ p.dispose(); }); B.pieces={};
  B.highlights.forEach(h=>h.dispose()); B.highlights=[]; }

function addDisc(i,color,ring,alpha){ const S=B.cfg.size, r=Math.floor(i/S), c=i%S; const p=sqPos(r,c); const w=sqWorld();
  if(ring){ const tor=BABYLON.MeshBuilder.CreateTorus('hl',{diameter:w*0.92,thickness:w*0.07,tessellation:26},B.scene);
    tor.position.set(p.x,0.06,p.z); const tm=new BABYLON.StandardMaterial('tm',B.scene); tm.emissiveColor=color; tm.disableLighting=true; tor.material=tm; tor.isPickable=false; B.highlights.push(tor); }
  else { const d=BABYLON.MeshBuilder.CreateDisc('hl',{radius:w*0.20,tessellation:24},B.scene); d.rotation.x=Math.PI/2; d.position.set(p.x,0.06,p.z);
    const dm=new BABYLON.StandardMaterial('dm',B.scene); dm.emissiveColor=color; dm.disableLighting=true; dm.alpha=alpha||0.85; d.material=dm; d.isPickable=false; B.highlights.push(d); } }

B.update=function(boardArr,opts){ if(!B.ready) return; opts=opts||{}; const S=B.cfg.size, PS=B.PS, w=sqWorld();
  B._onPick=(i)=>{ if(opts.onCell) opts.onCell(i); };
  clearDynamic();
  // pièces (standees face caméra)
  const pw=w*1.18, ph=w*1.7;
  for(let i=0;i<boardArr.length;i++){ const v=boardArr[i]; if(!v) continue; const r=Math.floor(i/S), c=i%S; const src=(opts.pieceSrc||B.cfg.pieceSrc)(v); if(!src) continue;
    const pl=BABYLON.MeshBuilder.CreatePlane('pc:'+i,{width:pw,height:ph},B.scene); pl.billboardMode=BABYLON.Mesh.BILLBOARDMODE_Y;
    const p=sqPos(r,c); pl.position.set(p.x, ph*0.5, p.z); pl.material=pieceMat(src); pl.isPickable=true;
    if(opts.ghost && opts.ghost.has(i)){ pl.visibility=0.35; }
    B.shadow&&B.shadow.addShadowCaster(pl); B.pieces[i]=pl;
    if(opts.king && opts.king(v)){ const cr=BABYLON.MeshBuilder.CreatePlane('crown',{width:w*0.5,height:w*0.5},B.scene); cr.billboardMode=BABYLON.Mesh.BILLBOARDMODE_Y;
      cr.position.set(p.x, ph*0.96, p.z); const cm=new BABYLON.StandardMaterial('cm',B.scene); cm.diffuseTexture=B.crownTex; cm.useAlphaFromDiffuseTexture=true; cm.emissiveColor=new BABYLON.Color3(1,1,1); cm.disableLighting=true; cm.backFaceCulling=false; cr.material=cm; cr.isPickable=false; B.pieces['k'+i]=cr; } }
  // surbrillances
  const ACC=new BABYLON.Color3(0.90,0.66,0.32), RED=new BABYLON.Color3(0.90,0.36,0.30);
  if(opts.lastMv){ if(opts.lastMv.from>=0) addDisc(opts.lastMv.from,ACC.scale(0.5),true); if(opts.lastMv.to>=0) addDisc(opts.lastMv.to,ACC.scale(0.5),true); }
  if(opts.sel!=null && opts.sel>=0) addDisc(opts.sel,ACC,true);
  if(opts.chkSq!=null && opts.chkSq>=0) addDisc(opts.chkSq,RED,true);
  if(opts.dests) opts.dests.forEach(i=>{ if(boardArr[i]) addDisc(i,ACC,true); else addDisc(i,ACC,false); });
};

B.unmount=function(){ try{ if(B._resize) removeEventListener('resize',B._resize); if(B.eng) B.eng.dispose(); }catch(e){}
  if(B.canvas && B.canvas.parentNode) B.canvas.parentNode.removeChild(B.canvas);
  B.canvas=null; B.eng=null; B.scene=null; B.ready=false; B.tiles=[]; B.pieces={}; B.highlights=[]; B.texCache={}; B.matCache={}; B.crownTex=null; };

window.Board3D=B;
})();
