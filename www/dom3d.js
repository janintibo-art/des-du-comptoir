'use strict';
/* Rendu 3D (Babylon.js) pour les dominos : cha\u00eene de tuiles pos\u00e9es sur un tapis + main du joueur.
   Utilise vos textures de tuiles (dominos/<skin>/<a-b>.webp). Deux points d'entr\u00e9e :
     DOM3D.setChain(chain, L, R, skin)          -> pose la cha\u00eene sur le tapis
     DOM3D.setHand(hand, playable, onPick, skin) -> pose la main (tuiles cliquables) */
(function(){
if(typeof window==='undefined') return;
const D={ canvas:null, eng:null, scene:null, cam:null, ready:false,
  chainMeshes:[], handMeshes:[], _onPick:null, texCache:{} };
const TW=1.9, TD=0.95; // largeur/profondeur d'une tuile
function tileTex(skin,a,b){ const lo=Math.min(a,b),hi=Math.max(a,b); const src='dominos/'+skin+'/'+lo+'-'+hi+'.webp';
  if(!D.texCache[src]){ const t=new BABYLON.Texture(src,D.scene); t.hasAlpha=true; D.texCache[src]=t; } return {tex:D.texCache[src],flip:(a>b)}; }

D.mount=function(parent){ if(D.canvas){ if(D.canvas.parentNode!==parent) parent.appendChild(D.canvas); if(D.eng) setTimeout(()=>D.eng.resize(),0); return; }
  const cv=document.createElement('canvas'); cv.style.cssText='width:100%;height:72vh;max-height:80vh;display:block;border-radius:12px;touch-action:none;outline:none;background:#0c0c0a';
  parent.appendChild(cv); D.canvas=cv;
  const eng=new BABYLON.Engine(cv,true,{stencil:true,preserveDrawingBuffer:true}); D.eng=eng;
  const sc=new BABYLON.Scene(eng); sc.clearColor=new BABYLON.Color4(0.04,0.05,0.04,1); D.scene=sc;
  const cam=new BABYLON.ArcRotateCamera('c',Math.PI/2,0.78,15,new BABYLON.Vector3(0,0,1.5),sc);
  cam.attachControl(cv,true); cam.lowerBetaLimit=0.12; cam.upperBetaLimit=1.35; cam.lowerRadiusLimit=9; cam.upperRadiusLimit=26;
  cam.wheelPrecision=30; cam.panningSensibility=0; cam.minZ=0.05; D.cam=cam;
  const hemi=new BABYLON.HemisphericLight('h',new BABYLON.Vector3(0,1,0),sc); hemi.intensity=0.95; hemi.groundColor=new BABYLON.Color3(0.08,0.12,0.08);
  const dir=new BABYLON.DirectionalLight('d',new BABYLON.Vector3(-0.3,-1,0.35),sc); dir.position=new BABYLON.Vector3(4,12,-4); dir.intensity=0.5;
  D.shadow=new BABYLON.ShadowGenerator(1024,dir); D.shadow.useBlurExponentialShadowMap=true; D.shadow.blurKernel=18;
  // tapis de feutre
  const felt=BABYLON.MeshBuilder.CreateGround('felt',{width:34,height:20},sc);
  const fm=new BABYLON.StandardMaterial('fm',sc); fm.diffuseColor=new BABYLON.Color3(0.10,0.32,0.16); fm.specularColor=new BABYLON.Color3(0.02,0.05,0.03); felt.material=fm; felt.receiveShadows=true;
  const border=BABYLON.MeshBuilder.CreateBox('bd',{width:35,height:0.6,depth:21},sc); border.position.y=-0.35; const bm=new BABYLON.StandardMaterial('bm',sc); bm.diffuseColor=new BABYLON.Color3(0.28,0.18,0.10); border.material=bm;
  sc.onPointerObservable.add(pi=>{ if(pi.type!==BABYLON.PointerEventTypes.POINTERPICK) return; const r=pi.pickInfo; if(!r||!r.hit||!r.pickedMesh) return;
    const n=r.pickedMesh.name; if(n.startsWith('h:') && D._onPick){ const idx=+n.slice(2); D._onPick(idx); } else if(n.startsWith('tr:') && D._onPickTrain){ D._onPickTrain(+n.slice(3)); } });
  eng.runRenderLoop(()=>sc.render());
  D._resize=()=>{ try{ eng.resize(); }catch(e){} }; addEventListener('resize',D._resize); setTimeout(D._resize,60);
  D.ready=true;
};

function makeTile(name, tile, skin, scale){ scale=scale||1; const w=TW*scale, d=TD*scale;
  const root=new BABYLON.TransformNode(name+'_root',D.scene);
  const body=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:0.22*scale,depth:d},D.scene);
  const bmat=new BABYLON.StandardMaterial('tb',D.scene); bmat.diffuseColor=new BABYLON.Color3(0.93,0.91,0.86); bmat.specularColor=new BABYLON.Color3(0.3,0.3,0.3); body.material=bmat;
  body.parent=root; D.shadow&&D.shadow.addShadowCaster(body);
  const face=BABYLON.MeshBuilder.CreatePlane(name+'_f',{width:w*0.98,height:d*0.98},D.scene); face.rotation.x=Math.PI/2; face.position.y=0.12*scale; face.parent=root;
  const {tex,flip}=tileTex(skin,tile.a,tile.b); const fm=new BABYLON.StandardMaterial('tf',D.scene); fm.diffuseTexture=tex; fm.useAlphaFromDiffuseTexture=true; fm.emissiveColor=new BABYLON.Color3(0.35,0.35,0.35); fm.specularColor=new BABYLON.Color3(0.1,0.1,0.1); fm.backFaceCulling=false; face.material=fm;
  if(flip){ face.rotation.y=Math.PI; } // orienter a|b comme pos\u00e9
  return {root,body,face};
}

D.setChain=function(chain, L, R, skin){ if(!D.ready) return; D.chainMeshes.forEach(m=>m.root.dispose()); D.chainMeshes=[];
  const n=chain.length; if(!n) return; const gap=0.12; const total=n*(TW+gap);
  const maxW=30; const scale=Math.min(1, maxW/total); const step=(TW+gap)*scale;
  let x=-(n-1)*step/2;
  chain.forEach((t,i)=>{ const m=makeTile('c'+i,t,skin,scale); m.root.position.set(x,0.11*scale,-2.0); m.root.rotation.y=0; D.chainMeshes.push(m); x+=step; });
};

D.setHand=function(hand, playable, onPick, skin){ if(!D.ready) return; D.handMeshes.forEach(m=>m.root.dispose()); D.handMeshes=[];
  D._onPick=(idx)=>{ const t=hand[idx]; if(!t) return; if(playable && playable.indexOf(t)>=0 && onPick) onPick(t); };
  const n=hand.length; if(!n) return; const gap=0.18; const total=n*(TW+gap); const maxW=28; const scale=Math.min(1.05, maxW/total); const step=(TW+gap)*scale;
  let x=-(n-1)*step/2;
  hand.forEach((t,i)=>{ const m=makeTile('h'+i,t,skin,scale); m.body.name='h:'+i; m.face.name='h:'+i; // pickable via nom
    m.root.position.set(x,0.11*scale,4.6); const ok=playable && playable.indexOf(t)>=0;
    if(ok){ m.face.material.emissiveColor=new BABYLON.Color3(0.6,0.5,0.25); m.root.position.z=4.2; }
    else { m.face.material.emissiveColor=new BABYLON.Color3(0.22,0.22,0.22); }
    D.handMeshes.push(m); x+=step; });
};


D.setTrains=function(trainsData, opts){ if(!D.ready) return; opts=opts||{};
  // trainsData: [{tiles:[{a,b}], end, label, target:bool}] ; moteur 6-6 au centre
  D.chainMeshes.forEach(m=>m.root.dispose()); D.chainMeshes=[];
  const n=trainsData.length; const skin=opts.skin||'ivoire';
  // moteur central
  const eng=makeTile('eng',{a:6,b:6},skin,0.9); eng.root.position.set(0,0.11,0); eng.root.rotation.y=Math.PI/2;
  D.chainMeshes.push(eng);
  const maxLen=Math.max(1,...trainsData.map(t=>t.tiles.length));
  const step=Math.min(1.7, 13/(maxLen+2));
  trainsData.forEach((tr,ti)=>{ const ang=(ti/n)*Math.PI*2 - Math.PI/2;
    const dx=Math.cos(ang), dz=Math.sin(ang);
    tr.tiles.forEach((t,k)=>{ const m=makeTile('t'+ti+'_'+k,t,skin,Math.min(0.85, step/(TW*0.55)));
      const r=1.6+k*step; m.root.position.set(dx*r,0.10,dz*r); m.root.rotation.y=-ang; D.chainMeshes.push(m); });
    // pastille de bout (cliquable si cible)
    const endR=1.6+tr.tiles.length*step+step*0.6;
    const disc=BABYLON.MeshBuilder.CreateCylinder('tr:'+ti,{diameter:1.0,height:0.06,tessellation:24},D.scene);
    disc.position.set(dx*endR,0.05,dz*endR);
    const dm=new BABYLON.StandardMaterial('trm'+ti,D.scene);
    dm.emissiveColor= tr.target? new BABYLON.Color3(0.9,0.66,0.3): new BABYLON.Color3(0.22,0.28,0.22);
    dm.disableLighting=true; disc.material=dm; disc.isPickable=!!tr.target; D.chainMeshes.push({root:disc});
    if(tr.target){ let tm=Math.random()*6; D.scene.onBeforeRenderObservable.add(()=>{ tm+=0.06; if(!disc.isDisposed()) disc.scaling.setAll(1+Math.sin(tm)*0.1); }); }
  });
  D._onPickTrain=opts.onPickTrain||null;
};

D.unmount=function(){ try{ if(D._resize) removeEventListener('resize',D._resize); if(D.eng) D.eng.dispose(); }catch(e){}
  if(D.canvas&&D.canvas.parentNode) D.canvas.parentNode.removeChild(D.canvas);
  D.canvas=null;D.eng=null;D.scene=null;D.ready=false;D.chainMeshes=[];D.handMeshes=[];D.texCache={}; };
window.DOM3D=D;
})();
