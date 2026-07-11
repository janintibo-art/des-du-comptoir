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
  const mkMat=(name,r,g,b,sp,pw)=>{ const m=new BABYLON.StandardMaterial(name,sc); m.diffuseColor=new BABYLON.Color3(r,g,b); m.specularColor=new BABYLON.Color3(sp,sp,sp); m.specularPower=pw||42; m.emissiveColor=new BABYLON.Color3(r*0.10,g*0.10,b*0.10); return m; };
  B.matW=mkMat('pw',0.93,0.89,0.80,0.55,60); B.matB=mkMat('pb',0.11,0.10,0.11,0.6,70);
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

function P3D(type, w){ const sc=B.scene; const P=[];
  const cyl=(db,dt,h,y)=>{ const m=BABYLON.MeshBuilder.CreateCylinder('p',{diameterBottom:db,diameterTop:dt,height:h,tessellation:20},sc); m.position.y=y; return m; };
  const sph=(d,y)=>{ const m=BABYLON.MeshBuilder.CreateSphere('p',{diameter:d,segments:14},sc); m.position.y=y; return m; };
  const box=(x,y2,z,py,pz,rx)=>{ const m=BABYLON.MeshBuilder.CreateBox('p',{width:x,height:y2,depth:z},sc); m.position.set(0,py,pz||0); if(rx)m.rotation.x=rx; return m; };
  const tor=(d,t,y)=>{ const m=BABYLON.MeshBuilder.CreateTorus('p',{diameter:d,thickness:t,tessellation:18},sc); m.position.y=y; return m; };
  P.push(cyl(w*0.74,w*0.6,w*0.14,w*0.07)); P.push(cyl(w*0.5,w*0.42,w*0.08,w*0.17));
  if(type==='pion'){ P.push(cyl(w*0.34,w*0.24,w*0.42,w*0.42)); P.push(tor(w*0.34,w*0.06,w*0.64)); P.push(sph(w*0.4,w*0.86)); }
  else if(type==='tour'){ P.push(cyl(w*0.44,w*0.4,w*0.6,w*0.5)); P.push(cyl(w*0.56,w*0.56,w*0.16,w*0.86));
    for(let k=0;k<6;k++){ const a=k*Math.PI/3; const b=BABYLON.MeshBuilder.CreateBox('p',{width:w*0.12,height:w*0.16,depth:w*0.12},sc); b.position.set(Math.cos(a)*w*0.22,w*0.98,Math.sin(a)*w*0.22); P.push(b);} }
  else if(type==='fou'){ P.push(cyl(w*0.46,w*0.16,w*0.82,w*0.55)); P.push(tor(w*0.3,w*0.05,w*0.9)); P.push(sph(w*0.26,w*1.06)); P.push(sph(w*0.1,w*1.24)); }
  else if(type==='cavalier'){ P.push(cyl(w*0.44,w*0.34,w*0.4,w*0.36));
    P.push(box(w*0.24,w*0.5,w*0.6,w*0.78,w*0.06,-0.5)); P.push(box(w*0.2,w*0.2,w*0.34,w*0.7,w*0.34,-0.2));
    const ear=BABYLON.MeshBuilder.CreateCylinder('p',{diameterTop:0,diameterBottom:w*0.12,height:w*0.18,tessellation:10},sc); ear.position.set(-w*0.08,w*1.02,-w*0.16); P.push(ear);
    const ear2=ear.clone('p'); ear2.position.set(w*0.08,w*1.02,-w*0.16); P.push(ear2); }
  else if(type==='dame'){ P.push(cyl(w*0.48,w*0.3,w*1.0,w*0.6)); P.push(tor(w*0.44,w*0.06,w*1.12));
    for(let k=0;k<6;k++){ const a=k*Math.PI/3; const sp2=sph(w*0.11,w*1.2); sp2.position.set(Math.cos(a)*w*0.2,w*1.2,Math.sin(a)*w*0.2); P.push(sp2);} P.push(sph(w*0.16,w*1.32)); }
  else if(type==='roi'){ P.push(cyl(w*0.48,w*0.32,w*1.05,w*0.62)); P.push(tor(w*0.42,w*0.06,w*1.16)); P.push(sph(w*0.2,w*1.3));
    P.push(box(w*0.1,w*0.34,w*0.1,w*1.5)); P.push(box(w*0.24,w*0.1,w*0.1,w*1.5)); }
  else if(type==='man'){ P.push(cyl(w*0.82,w*0.78,w*0.26,w*0.13)); P.push(tor(w*0.66,w*0.06,w*0.26)); P.push(cyl(w*0.5,w*0.5,w*0.03,w*0.27)); }
  else if(type==='king'){ P.push(cyl(w*0.82,w*0.78,w*0.24,w*0.12)); P.push(cyl(w*0.78,w*0.74,w*0.22,w*0.34)); P.push(tor(w*0.6,w*0.06,w*0.46)); P.push(sph(w*0.24,w*0.6)); }
  else { P.push(sph(w*0.4,w*0.5)); }
  return BABYLON.Mesh.MergeMeshes(P,true,true,undefined,false,false); }
B.update=function(boardArr,opts){ if(!B.ready) return; opts=opts||{}; const S=B.cfg.size, PS=B.PS, w=sqWorld();
  B._onPick=(i)=>{ if(opts.onCell) opts.onCell(i); };
  clearDynamic();
  // pièces 3D modélisées (debout)
  for(let i=0;i<boardArr.length;i++){ const v=boardArr[i]; if(!v) continue; const r=Math.floor(i/S), c=i%S;
    let type='pion', colW=v>0; if(opts.pieceType){ const pt=opts.pieceType(v); if(!pt) continue; type=pt.t; colW=(pt.c==='w'); }
    const mesh=P3D(type,w); if(!mesh) continue; const p=sqPos(r,c); mesh.name='pc:'+i; mesh.position.set(p.x,0,p.z);
    mesh.material=colW?B.matW:B.matB; mesh.isPickable=true; if(opts.ghost && opts.ghost.has(i)) mesh.visibility=0.4;
    B.shadow&&B.shadow.addShadowCaster(mesh); B.pieces[i]=mesh; }
  // animation de glisse du dernier coup
  if(opts.lastMv && opts.lastMv.from>=0 && opts.lastMv.to>=0 && B.pieces[opts.lastMv.to]){
    const kk=opts.lastMv.from+':'+opts.lastMv.to;
    if(B._lastAnim!==kk){ B._lastAnim=kk; const mesh=B.pieces[opts.lastMv.to];
      const fr=Math.floor(opts.lastMv.from/S), fc=opts.lastMv.from%S; const fp=sqPos(fr,fc); const tp=mesh.position.clone();
      mesh.position.set(fp.x,0,fp.z);
      const fps=60,dur=14; const a=new BABYLON.Animation('gl','position',fps,BABYLON.Animation.ANIMATIONTYPE_VECTOR3,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
      a.setKeys([{frame:0,value:new BABYLON.Vector3(fp.x,0,fp.z)},{frame:dur,value:tp}]);
      const e=new BABYLON.SineEase(); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT); a.setEasingFunction(e);
      B.scene.beginDirectAnimation(mesh,[a],0,dur,false); } }
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
