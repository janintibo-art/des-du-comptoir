'use strict';
/* Rendu 3D (Babylon.js) pour le Puissance 4 : grille verticale (votre image du plateau, trous
   transparents) + jetons-cylindres qui TOMBENT dans les colonnes.
   P43D.render(container, b, opts, cfg)
     b = {cells[ROWS][COLS], heights[COLS]}
     opts = {falling:{col,r,p}, cols:bool, onCol(c), hint}
     cfg = {plateau, GRID:{left,top,stepx,stepy,rad}, COLS, ROWS, winLine} */
(function(){
if(typeof window==='undefined') return;
const P={ canvas:null, eng:null, scene:null, cam:null, ready:false, PW:10, PH:7.6,
  toks:[], cols:[], hint:null, matR:null, matY:null, _onCol:null, cfg:null, animating:false };

function fxOf(c){ return P.cfg.GRID.left + c*P.cfg.GRID.stepx; }
function fyOf(r){ return P.cfg.GRID.top + (P.cfg.ROWS-1-r)*P.cfg.GRID.stepy; } // r=0 en bas
function wx(c){ return (fxOf(c)-0.5)*P.PW; }
function wy(r){ return (0.5-fyOf(r))*P.PH; }
const TOPY=()=> P.PH*0.62;

P.mount=function(parent, cfg){ P.cfg=cfg; P.PH=P.PW*(966/1274);
  if(P.canvas){ if(P.canvas.parentNode!==parent) parent.appendChild(P.canvas); if(P.eng) setTimeout(()=>P.eng.resize(),0); return; }
  const cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:70vh;max-height:78vh;display:block;border-radius:12px;touch-action:none;outline:none;background:#0c0c0a';
  parent.appendChild(cv); P.canvas=cv;
  const eng=new BABYLON.Engine(cv,true,{stencil:true,preserveDrawingBuffer:true}); P.eng=eng;
  const sc=new BABYLON.Scene(eng); sc.clearColor=new BABYLON.Color4(0.05,0.05,0.06,1); P.scene=sc;
  const cam=new BABYLON.ArcRotateCamera('c',Math.PI/2,1.30,P.PH*1.15,new BABYLON.Vector3(0,0,0),sc);
  cam.attachControl(cv,true); cam.lowerBetaLimit=0.5; cam.upperBetaLimit=1.55; cam.lowerRadiusLimit=P.PH*0.8; cam.upperRadiusLimit=P.PH*2.0;
  cam.wheelPrecision=40; cam.panningSensibility=0; cam.minZ=0.05; P.cam=cam;
  const hemi=new BABYLON.HemisphericLight('h',new BABYLON.Vector3(0,1,0.3),sc); hemi.intensity=0.9;
  const dir=new BABYLON.DirectionalLight('d',new BABYLON.Vector3(-0.2,-0.6,1),sc); dir.position=new BABYLON.Vector3(2,6,-8); dir.intensity=0.55;
  // panneau (image du plateau, trous transparents)
  const panel=BABYLON.MeshBuilder.CreatePlane('panel',{width:P.PW,height:P.PH,sideOrientation:BABYLON.Mesh.DOUBLESIDE},sc);
  const m=new BABYLON.StandardMaterial('pm',sc); const t=new BABYLON.Texture(cfg.plateau,sc); t.hasAlpha=true;
  m.diffuseTexture=t; m.useAlphaFromDiffuseTexture=true; m.specularColor=new BABYLON.Color3(0.15,0.15,0.2); m.emissiveColor=new BABYLON.Color3(0.10,0.10,0.14); panel.material=m; panel.position.z=0; panel.isPickable=false; P.panel=panel;
  // fond sombre derrière (pour que les trous vides soient noirs)
  const back=BABYLON.MeshBuilder.CreatePlane('back',{width:P.PW,height:P.PH},sc); back.position.z=0.28; const bm=new BABYLON.StandardMaterial('bm',sc); bm.diffuseColor=new BABYLON.Color3(0.03,0.03,0.05); bm.specularColor=new BABYLON.Color3(0,0,0); back.material=bm; back.isPickable=false;
  // matériaux jetons
  const mk=(r,g,bl)=>{ const mm=new BABYLON.StandardMaterial('t',sc); mm.diffuseColor=new BABYLON.Color3(r,g,bl); mm.specularColor=new BABYLON.Color3(1,1,1); mm.specularPower=64; mm.emissiveColor=new BABYLON.Color3(r*0.25,g*0.25,bl*0.25); return mm; };
  P.matR=mk(0.86,0.20,0.18); P.matY=mk(0.95,0.80,0.20);
  // colonnes de clic (7 boîtes verticales devant le plateau)
  const S=cfg.COLS; P.cols=[]; for(let c=0;c<S;c++){ const box=BABYLON.MeshBuilder.CreateBox('col:'+c,{width:cfg.GRID.stepx*P.PW*0.96,height:P.PH*0.98,depth:0.5},sc);
    box.position.set(wx(c),0,-0.3); box.visibility=0.0001; box.isPickable=true; P.cols.push(box); }
  sc.onPointerObservable.add(pi=>{ if(pi.type!==BABYLON.PointerEventTypes.POINTERPICK) return; const r=pi.pickInfo; if(!r||!r.hit||!r.pickedMesh) return;
    const n=r.pickedMesh.name; if(n.startsWith('col:') && P._onCol) P._onCol(+n.slice(4)); });
  eng.runRenderLoop(()=>sc.render());
  P._resize=()=>{ try{ eng.resize(); }catch(e){} }; addEventListener('resize',P._resize); setTimeout(P._resize,60);
  P.ready=true;
};

function tokenMesh(color){ const d=P.cfg.GRID.rad*2*P.PW*0.94; const cyl=BABYLON.MeshBuilder.CreateCylinder('tk',{diameter:d,height:0.22,tessellation:28},P.scene);
  cyl.rotation.x=Math.PI/2; // axe -> Z (face vers la caméra)
  cyl.material = color>0?P.matR:P.matY; return cyl; }

function rebuild(b,cfg){ P.toks.forEach(t=>t.dispose()); P.toks=[];
  for(let c=0;c<cfg.COLS;c++) for(let r=0;r<b.heights[c];r++){ const v=b.cells[r][c]; if(!v) continue;
    const cyl=tokenMesh(v); cyl.position.set(wx(c),wy(r),0.03);
    if(cfg.winLine && cfg.winLine.some(([wr,wc])=>wr===r&&wc===c)){ cyl.material=cyl.material.clone('w'); cyl.material.emissiveColor=new BABYLON.Color3(0.6,0.6,0.4); }
    P.toks.push(cyl); } }

function animateDrop(col,r,p){ return new Promise(res=>{ const cyl=tokenMesh(p); cyl.position.set(wx(col),TOPY(),0.03); P.toks.push(cyl);
  const targetY=wy(r); const fps=60, dur=Math.max(14, Math.round((TOPY()-targetY)/P.PH*40));
  const a=new BABYLON.Animation('drop','position.y',fps,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  a.setKeys([{frame:0,value:TOPY()},{frame:dur,value:targetY},{frame:dur+4,value:targetY+0.12},{frame:dur+8,value:targetY}]);
  const ease=new BABYLON.QuadraticEase(); ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN); a.setEasingFunction(ease);
  P.scene.beginDirectAnimation(cyl,[a],0,dur+8,false,1,()=>res()); }); }

P.render=function(container, b, opts, cfg){ P.mount(container, cfg); if(!P.ready) return; opts=opts||{}; P.cfg=cfg;
  P._onCol=(c)=>{ if(opts.cols && opts.onCol) opts.onCol(c); };
  // colonnes cliquables : léger halo si jouable
  P.cols.forEach((box,c)=>{ box.isPickable = !!(opts.cols && b.heights[c]<cfg.ROWS); });
  if(opts.falling){ animateDrop(opts.falling.col, opts.falling.r, opts.falling.p); return; }
  rebuild(b,cfg);
};
P.unmount=function(){ try{ if(P._resize) removeEventListener('resize',P._resize); if(P.eng) P.eng.dispose(); }catch(e){}
  if(P.canvas && P.canvas.parentNode) P.canvas.parentNode.removeChild(P.canvas);
  P.canvas=null; P.eng=null; P.scene=null; P.ready=false; P.toks=[]; P.cols=[]; };
window.P43D=P;
})();
