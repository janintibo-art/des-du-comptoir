'use strict';
/* Rendu 3D (Babylon.js) pour Le Cochon troué : petits cochons ROSES modélisés (corps + groin +
   oreilles + bâtonnet) qui plongent dans les trous du plateau (votre image board.webp).
   Pig3D.mount(parent, HOLES, boardImg) ; Pig3D.setState(holes[5], pegStyle, flashExit) */
(function(){
if(typeof window==='undefined') return;
const G={ canvas:null, eng:null, scene:null, cam:null, ready:false, PS:12,
  pigs:{}, exitRing:null, HOLES:null, mat:{}, _dropSound:null };
function holeWorld(h){ return new BABYLON.Vector3((h.x-0.5)*G.PS, 0, (h.y-0.5)*G.PS); }

function makePig(name, tint){ const sc=G.scene; const root=new BABYLON.TransformNode(name,sc);
  const pink=G.mat[tint]||G.mat.clair;
  // bâtonnet
  const stick=BABYLON.MeshBuilder.CreateCylinder(name+'_st',{height:0.9,diameter:0.15,tessellation:12},sc);
  stick.material=G.mat.wood; stick.position.y=0.45; stick.parent=root;
  // corps (ellipsoïde)
  const body=BABYLON.MeshBuilder.CreateSphere(name+'_bd',{diameter:1,segments:14},sc);
  body.scaling=new BABYLON.Vector3(1.0,0.82,1.25); body.position.y=1.05; body.material=pink; body.parent=root;
  // tête
  const head=BABYLON.MeshBuilder.CreateSphere(name+'_hd',{diameter:0.72,segments:14},sc);
  head.position.set(0,1.12,0.6); head.material=pink; head.parent=root;
  // groin
  const snout=BABYLON.MeshBuilder.CreateCylinder(name+'_sn',{height:0.14,diameter:0.34,tessellation:16},sc);
  snout.rotation.x=Math.PI/2; snout.position.set(0,1.08,0.95); snout.material=pink; snout.parent=root;
  const n1=BABYLON.MeshBuilder.CreateSphere(name+'_n1',{diameter:0.07},sc); n1.position.set(-0.07,1.08,1.02); n1.material=G.mat.black; n1.parent=root;
  const n2=n1.clone(name+'_n2'); n2.position.set(0.07,1.08,1.02); n2.parent=root;
  // oreilles
  const ear=BABYLON.MeshBuilder.CreateCylinder(name+'_e1',{height:0.001,diameterTop:0,diameterBottom:0.3,tessellation:3},sc);
  ear.position.set(-0.22,1.42,0.54); ear.rotation.x=-0.5; ear.material=pink; ear.parent=root;
  const ear2=ear.clone(name+'_e2'); ear2.position.set(0.22,1.42,0.54); ear2.parent=root;
  // yeux
  const eye=BABYLON.MeshBuilder.CreateSphere(name+'_y1',{diameter:0.1},sc); eye.position.set(-0.16,1.22,0.9); eye.material=G.mat.black; eye.parent=root;
  const eye2=eye.clone(name+'_y2'); eye2.position.set(0.16,1.22,0.9); eye2.parent=root;
  // queue (petit tore)
  const tail=BABYLON.MeshBuilder.CreateTorus(name+'_tl',{diameter:0.22,thickness:0.05,tessellation:14},sc);
  tail.position.set(0,1.15,-0.64); tail.rotation.y=Math.PI/2; tail.material=pink; tail.parent=root;
  [stick,body,head,snout].forEach(m=>G.shadow&&G.shadow.addShadowCaster(m));
  return root;
}

G.mount=function(parent, HOLES, boardImg){ G.HOLES=HOLES;
  if(G.canvas){ if(G.canvas.parentNode!==parent) parent.appendChild(G.canvas); if(G.eng) setTimeout(()=>G.eng.resize(),0); return; }
  const cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:74vh;max-height:80vh;display:block;border-radius:12px;touch-action:none;outline:none;background:#0c0c0a';
  parent.appendChild(cv); G.canvas=cv;
  const eng=new BABYLON.Engine(cv,true,{stencil:true,preserveDrawingBuffer:true}); G.eng=eng;
  const sc=new BABYLON.Scene(eng); sc.clearColor=new BABYLON.Color4(0.05,0.05,0.045,1); G.scene=sc;
  const cam=new BABYLON.ArcRotateCamera('c',-Math.PI/2,0.16,G.PS*0.82,new BABYLON.Vector3(0,0,0),sc);
  cam.attachControl(cv,true); cam.lowerBetaLimit=0.02; cam.upperBetaLimit=0.9; cam.lowerRadiusLimit=G.PS*0.6; cam.upperRadiusLimit=G.PS*1.9;
  cam.wheelPrecision=36; cam.panningSensibility=0; cam.minZ=0.05; G.cam=cam;
  const hemi=new BABYLON.HemisphericLight('h',new BABYLON.Vector3(0,1,0.2),sc); hemi.intensity=0.98; hemi.groundColor=new BABYLON.Color3(0.12,0.1,0.1);
  const dir=new BABYLON.DirectionalLight('d',new BABYLON.Vector3(-0.3,-1,0.35),sc); dir.position=new BABYLON.Vector3(4,12,-4); dir.intensity=0.55;
  G.shadow=new BABYLON.ShadowGenerator(1024,dir); G.shadow.useBlurExponentialShadowMap=true; G.shadow.blurKernel=18;
  // matériaux
  const mk=(r,g,b,sp)=>{ const m=new BABYLON.StandardMaterial('m',sc); m.diffuseColor=new BABYLON.Color3(r,g,b); m.specularColor=new BABYLON.Color3(sp||0.25,sp||0.25,sp||0.25); m.specularPower=32; return m; };
  G.mat.clair=mk(0.98,0.72,0.76,0.35); G.mat.fonce=mk(0.86,0.5,0.56,0.35);
  G.mat.wood=mk(0.72,0.55,0.32,0.2); G.mat.black=mk(0.05,0.04,0.05,0.4);
  // plateau (votre image posée à plat)
  const g=BABYLON.MeshBuilder.CreateGround('bd',{width:G.PS,height:G.PS},sc);
  const bm=new BABYLON.StandardMaterial('bdm',sc); const t=new BABYLON.Texture(boardImg,sc); t.hasAlpha=true;
  bm.diffuseTexture=t; bm.useAlphaFromDiffuseTexture=true; bm.specularColor=new BABYLON.Color3(0.05,0.05,0.05); g.material=bm; g.receiveShadows=true;
  // anneau du trou de sortie (n:6)
  const ex=HOLES.find(h=>h.n===6); if(ex){ const p=holeWorld(ex); const tor=BABYLON.MeshBuilder.CreateTorus('exit',{diameter:1.1,thickness:0.09,tessellation:26},sc);
    tor.position.set(p.x,0.06,p.z); const em=new BABYLON.StandardMaterial('em',sc); em.emissiveColor=new BABYLON.Color3(0.5,0.2,0.15); em.disableLighting=true; tor.material=em; tor.setEnabled(false); G.exitRing=tor; }
  eng.runRenderLoop(()=>sc.render());
  G._resize=()=>{ try{ eng.resize(); }catch(e){} }; addEventListener('resize',G._resize); setTimeout(G._resize,60);
  G.ready=true;
};

function dropPig(i, tint){ const h=G.HOLES[i]; const p=holeWorld(h); const pig=makePig('pig'+i,tint); pig.scaling.setAll(0.5);
  pig.position.set(p.x, 4.5, p.z); G.pigs[i]=pig;
  const fps=60,dur=16; const a=new BABYLON.Animation('d','position.y',fps,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  a.setKeys([{frame:0,value:4.5},{frame:dur,value:-0.12},{frame:dur+3,value:0.12},{frame:dur+6,value:-0.12}]);
  const e=new BABYLON.QuadraticEase(); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN); a.setEasingFunction(e);
  G.scene.beginDirectAnimation(pig,[a],0,dur+6,false); }

function flyOut(pig){ if(!pig) return; const fps=60,dur=18; const a=new BABYLON.Animation('o','position.y',fps,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  a.setKeys([{frame:0,value:pig.position.y},{frame:dur,value:7}]);
  const rot=new BABYLON.Animation('r','rotation.z',fps,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT); rot.setKeys([{frame:0,value:0},{frame:dur,value:6}]);
  G.scene.beginDirectAnimation(pig,[a,rot],0,dur,false,1,()=>pig.dispose()); }

G.setState=function(holes, pegStyle, flashExit){ if(!G.ready) return; const tint=(pegStyle==='fonce')?'fonce':'clair';
  for(let i=0;i<5;i++){ if(holes[i] && !G.pigs[i]){ dropPig(i,tint); }
    else if(!holes[i] && G.pigs[i]){ flyOut(G.pigs[i]); delete G.pigs[i]; } }
  if(G.exitRing){ G.exitRing.setEnabled(!!flashExit); }
};

G.unmount=function(){ try{ if(G._resize) removeEventListener('resize',G._resize); if(G.eng) G.eng.dispose(); }catch(e){}
  if(G.canvas&&G.canvas.parentNode) G.canvas.parentNode.removeChild(G.canvas);
  G.canvas=null;G.eng=null;G.scene=null;G.ready=false;G.pigs={};G.exitRing=null;G.mat={}; };
window.Pig3D=G;
})();
