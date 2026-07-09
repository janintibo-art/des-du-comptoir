'use strict';
/* Rendu 3D (Babylon.js) pour le Reversi/Othello. Chaque pion = un disque \u00e0 DEUX faces
   (noir dessus / blanc dessous) ; changer de camp = le RETOURNER (rotation \u03c0). Diff d'\u00e9tat
   automatique : nouveau pion -> apparition ; camp invers\u00e9 -> flip anim\u00e9.
   R3D.render(container, b, opts) ; opts = {hints:Array<sq>, onPick(sq), skin:{img,G:{x0,y0,dx,dy}}} */
(function(){
if(typeof window==='undefined') return;
const R={ canvas:null, eng:null, scene:null, cam:null, ready:false, PS:10,
  discs:{}, tiles:[], hints:[], discMat:null, _onPick:null, skinId:null, lastB:null };

function G(){ return R.skin.G; }
function wpos(sq){ const c=sq&7, r=sq>>3, g=G(); const fx=g.x0+c*g.dx, fy=g.y0+r*g.dy; return new BABYLON.Vector3((fx-0.5)*R.PS,0,(fy-0.5)*R.PS); }
function discD(){ return G().dx*R.PS*0.82; }

R.mount=function(parent, skin){ R.skin=skin;
  if(R.canvas){ if(R.canvas.parentNode!==parent) parent.appendChild(R.canvas); if(R.eng) setTimeout(()=>R.eng.resize(),0);
    if(R.skinId!==skin.id){ R.skinId=skin.id; if(R.ground) R.ground.material.diffuseTexture=new BABYLON.Texture(skin.img,R.scene); R.lastB=null; clearDiscs(); } return; }
  const cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:74vh;max-height:80vh;display:block;border-radius:12px;touch-action:none;outline:none;background:#0c0c0a';
  parent.appendChild(cv); R.canvas=cv;
  const eng=new BABYLON.Engine(cv,true,{stencil:true,preserveDrawingBuffer:true}); R.eng=eng;
  const sc=new BABYLON.Scene(eng); sc.clearColor=new BABYLON.Color4(0.05,0.05,0.045,1); R.scene=sc;
  const cam=new BABYLON.ArcRotateCamera('c',-Math.PI/2,0.62,R.PS*1.05,BABYLON.Vector3.Zero(),sc);
  cam.attachControl(cv,true); cam.lowerBetaLimit=0.10; cam.upperBetaLimit=1.25; cam.lowerRadiusLimit=R.PS*0.7; cam.upperRadiusLimit=R.PS*1.9;
  cam.wheelPrecision=40; cam.panningSensibility=0; cam.minZ=0.05; R.cam=cam;
  const hemi=new BABYLON.HemisphericLight('h',new BABYLON.Vector3(0,1,0),sc); hemi.intensity=0.92; hemi.groundColor=new BABYLON.Color3(0.1,0.1,0.12);
  const dir=new BABYLON.DirectionalLight('d',new BABYLON.Vector3(-0.35,-1,0.4),sc); dir.position=new BABYLON.Vector3(R.PS*0.5,R.PS,-R.PS*0.5); dir.intensity=0.55;
  R.shadow=new BABYLON.ShadowGenerator(1024,dir); R.shadow.useBlurExponentialShadowMap=true; R.shadow.blurKernel=16;
  const g=BABYLON.MeshBuilder.CreateGround('bd',{width:R.PS,height:R.PS},sc);
  const m=new BABYLON.StandardMaterial('bdm',sc); const t=new BABYLON.Texture(skin.img,sc); t.hasAlpha=true;
  m.diffuseTexture=t; m.useAlphaFromDiffuseTexture=true; m.specularColor=new BABYLON.Color3(0.05,0.05,0.05); g.material=m; g.receiveShadows=true; R.ground=g; R.skinId=skin.id;
  const dm=new BABYLON.StandardMaterial('dm',sc); dm.diffuseColor=new BABYLON.Color3(1,1,1); dm.specularColor=new BABYLON.Color3(1,1,1); dm.specularPower=60; dm.useVertexColor=true; R.discMat=dm;
  // tuiles de clic 8x8
  R.tiles=[]; for(let sq=0;sq<64;sq++){ const box=BABYLON.MeshBuilder.CreateBox('sq:'+sq,{width:G().dx*R.PS*0.9,depth:G().dy*R.PS*0.9,height:0.05},sc);
    const p=wpos(sq); box.position.set(p.x,0.02,p.z); box.visibility=0.0001; box.isPickable=true; R.tiles.push(box); }
  sc.onPointerObservable.add(pi=>{ if(pi.type!==BABYLON.PointerEventTypes.POINTERPICK) return; const r=pi.pickInfo; if(!r||!r.hit||!r.pickedMesh) return;
    const n=r.pickedMesh.name; let sq=-1; if(n.startsWith('sq:'))sq=+n.slice(3); else if(n.startsWith('d:'))sq=+n.slice(2); if(sq>=0&&R._onPick)R._onPick(sq); });
  eng.runRenderLoop(()=>sc.render());
  R._resize=()=>{ try{ eng.resize(); }catch(e){} }; addEventListener('resize',R._resize); setTimeout(R._resize,60);
  R.ready=true; R.lastB=null;
};

function makeDisc(sq,owner){ const c=BABYLON.MeshBuilder.CreateCylinder('d:'+sq,{height:0.15,diameter:discD(),tessellation:40,
    faceColors:[ new BABYLON.Color4(0.92,0.90,0.86,1), new BABYLON.Color4(0.12,0.12,0.13,1), new BABYLON.Color4(0.03,0.03,0.04,1) ]},R.scene); // 0=bas=blanc, 1=tube, 2=haut=noir
  c.material=R.discMat; const p=wpos(sq); c.position.set(p.x,0.09,p.z); c.rotation.x = owner===1?0:Math.PI; // 1=noir dessus
  R.shadow&&R.shadow.addShadowCaster(c); R.discs[sq]=c; c._owner=owner; return c; }
function clearDiscs(){ Object.values(R.discs).forEach(d=>d.dispose()); R.discs={}; }
function animFlip(disc,owner){ const from=disc.rotation.x, to=owner===1?0:Math.PI;
  const fps=60,dur=16; const a=new BABYLON.Animation('f','rotation.x',fps,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  a.setKeys([{frame:0,value:from},{frame:dur,value:to}]); const e=new BABYLON.SineEase(); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT); a.setEasingFunction(e);
  const ay=new BABYLON.Animation('fy','position.y',fps,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  ay.setKeys([{frame:0,value:0.09},{frame:dur/2,value:0.5},{frame:dur,value:0.09}]);
  R.scene.beginDirectAnimation(disc,[a,ay],0,dur,false); disc._owner=owner; }
function popIn(disc){ disc.scaling.setAll(0.1); const fps=60,dur=10; const a=new BABYLON.Animation('p','scaling',fps,BABYLON.Animation.ANIMATIONTYPE_VECTOR3,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  a.setKeys([{frame:0,value:new BABYLON.Vector3(0.1,0.1,0.1)},{frame:dur,value:new BABYLON.Vector3(1,1,1)}]); const e=new BABYLON.BackEase(); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); a.setEasingFunction(e);
  R.scene.beginDirectAnimation(disc,[a],0,dur,false); }

R.update=function(b,opts){ if(!R.ready) return; opts=opts||{}; R._onPick=(sq)=>{ if(opts.hints&&opts.hints.indexOf(sq)>=0&&opts.onPick)opts.onPick(sq); };
  // diff avec lastB
  for(let sq=0;sq<64;sq++){ const nv=b[sq]|0, ov=R.lastB?R.lastB[sq]|0:0;
    if(nv===0 && R.discs[sq]){ R.discs[sq].dispose(); delete R.discs[sq]; continue; }
    if(nv!==0 && !R.discs[sq]){ const d=makeDisc(sq,nv); popIn(d); continue; }
    if(nv!==0 && R.discs[sq] && R.discs[sq]._owner!==nv){ animFlip(R.discs[sq],nv); } }
  R.lastB=Int8Array.from(b);
  // indices de coups
  R.hints.forEach(h=>h.dispose()); R.hints=[];
  (opts.hints||[]).forEach(sq=>{ const p=wpos(sq); const tor=BABYLON.MeshBuilder.CreateTorus('h',{diameter:discD()*0.9,thickness:discD()*0.09,tessellation:24},R.scene);
    tor.position.set(p.x,0.05,p.z); const tm=new BABYLON.StandardMaterial('hm',R.scene); tm.emissiveColor=new BABYLON.Color3(0.9,0.66,0.32); tm.disableLighting=true; tor.material=tm; tor.isPickable=false; R.hints.push(tor); });
};

R.render=function(container,b,opts){ R.mount(container, opts.skin); R.update(b,opts); };
R.unmount=function(){ try{ if(R._resize) removeEventListener('resize',R._resize); if(R.eng) R.eng.dispose(); }catch(e){}
  if(R.canvas&&R.canvas.parentNode) R.canvas.parentNode.removeChild(R.canvas);
  R.canvas=null;R.eng=null;R.scene=null;R.ready=false;R.discs={};R.tiles=[];R.hints=[];R.lastB=null; };
window.R3D=R;
})();
