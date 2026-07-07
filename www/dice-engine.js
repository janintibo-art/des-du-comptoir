'use strict';
/* Moteur de dés partagé — Babylon.js + Cannon.js
   Usage : const t = DiceTable({diceCount:5}); t.throwDice(subset).then(...) */
(function(){

const SKINS = ['fantasy','neon','tribal','ocean','candy','ice','gothic','crystal','steampunk','biomech','streetart','origami'];
const SKIN_LABELS = {fantasy:'Fantaisie',neon:'Néon sci-fi',tribal:'Tribal',ocean:'Océan & perles',
  candy:'Pâtisserie',ice:'Glace',gothic:'Gothique',crystal:'Cristal arcane',steampunk:'Steampunk',
  biomech:'Biomécanique',streetart:'Street art',origami:'Origami'};

// Babylon CreateBox : faces 0 avant(+z) 1 arrière(-z) 2 droite(+x) 3 gauche(-x) 4 dessus(+y) 5 dessous(-y)
const FACE_VALUE = [2,5,3,4,1,6]; // faces opposées = 7
const LOCAL_NORMAL = {
  1:[0,1,0], 6:[0,-1,0], 2:[0,0,1], 5:[0,0,-1], 3:[1,0,0], 4:[-1,0,0],
};
const rand = (a,b)=> a + Math.random()*(b-a);

window.DICE_SKINS = SKINS;
window.DICE_SKIN_LABELS = SKIN_LABELS;

window.DiceTable = function(opts){
  opts = opts || {};
  const count = opts.diceCount || 3;
  const D = 1.6;
  const AREA = opts.area || (count > 3 ? 16 : 13);
  const canvas = document.getElementById(opts.canvasId || 'render');

  const engine = new BABYLON.Engine(canvas, true, {antialias:true});
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = BABYLON.Color4.FromHexString('#141410FF');
  scene.enablePhysics(new BABYLON.Vector3(0,-9.81,0), new BABYLON.CannonJSPlugin());

  const camera = new BABYLON.ArcRotateCamera('cam', -Math.PI/2, 0.85, AREA*1.18, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 8; camera.upperRadiusLimit = AREA*2;
  camera.upperBetaLimit = 1.3; camera.wheelPrecision = 40;

  new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0,1,0), scene).intensity = 0.55;
  const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.4,-1,0.3), scene);
  sun.position = new BABYLON.Vector3(6,14,-4); sun.intensity = 0.9;
  const shadows = new BABYLON.ShadowGenerator(1024, sun);
  shadows.useBlurExponentialShadowMap = true; shadows.blurScale = 2;

  // Tapis
  const table = BABYLON.MeshBuilder.CreateGround('table', {width:70, height:70}, scene);
  const feltMat = new BABYLON.StandardMaterial('felt', scene);
  feltMat.diffuseColor = BABYLON.Color3.FromHexString('#1d4a33');
  feltMat.specularColor = new BABYLON.Color3(0.02,0.02,0.02);
  table.material = feltMat; table.receiveShadows = true;
  table.physicsImpostor = new BABYLON.PhysicsImpostor(table, BABYLON.PhysicsImpostor.BoxImpostor,
    {mass:0, restitution:0.3, friction:0.6}, scene);

  // Rebords + murs invisibles
  const woodMat = new BABYLON.StandardMaterial('wood', scene);
  woodMat.diffuseColor = BABYLON.Color3.FromHexString('#4a3320');
  woodMat.specularColor = new BABYLON.Color3(0.05,0.05,0.05);
  [[0,-AREA/2],[0,AREA/2],[-AREA/2,0],[AREA/2,0]].forEach(([x,z],i)=>{
    const vert = i>1;
    const rail = BABYLON.MeshBuilder.CreateBox('rail'+i,
      {width: vert?0.5:AREA+0.5, depth: vert?AREA+0.5:0.5, height:0.7}, scene);
    rail.position.set(x, 0.35, z);
    rail.material = woodMat; rail.receiveShadows = true;
    rail.physicsImpostor = new BABYLON.PhysicsImpostor(rail, BABYLON.PhysicsImpostor.BoxImpostor,
      {mass:0, restitution:0.4, friction:0.4}, scene);
    const wall = BABYLON.MeshBuilder.CreateBox('wall'+i,
      {width: vert?0.5:AREA+0.5, depth: vert?AREA+0.5:0.5, height:9}, scene);
    wall.position.set(x, 4.5, z); wall.isVisible = false;
    wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall, BABYLON.PhysicsImpostor.BoxImpostor,
      {mass:0, restitution:0.3}, scene);
  });

  const faceUV = FACE_VALUE.map(v => {
    const col=(v-1)%3, row=Math.floor((v-1)/3);
    return new BABYLON.Vector4(col/3, 1-(row+1)/2, (col+1)/3, 1-row/2);
  });
  const matCache = {};
  function skinMaterial(skin){
    if(!matCache[skin]){
      const m = new BABYLON.StandardMaterial('m_'+skin, scene);
      m.diffuseTexture = new BABYLON.Texture('textures/'+skin+'/atlas.jpg', scene);
      m.specularColor = new BABYLON.Color3(0.12,0.12,0.12);
      matCache[skin] = m;
    }
    return matCache[skin];
  }

  const dice = [...Array(count)].map((_,i)=>{
    const mesh = BABYLON.MeshBuilder.CreateBox('die'+i, {size:D, faceUV, wrap:true}, scene);
    mesh.position.set((i-(count-1)/2)*2.4, D/2, 0);
    mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor,
      {mass:0, restitution:0.35, friction:0.55}, scene);
    shadows.addShadowCaster(mesh);
    const halo = BABYLON.MeshBuilder.CreateTorus('halo'+i, {diameter:D*1.7, thickness:0.07}, scene);
    const hm = new BABYLON.StandardMaterial('hm'+i, scene);
    hm.emissiveColor = BABYLON.Color3.FromHexString('#e0a34c');
    hm.disableLighting = true; halo.material = hm; halo.isVisible = false;
    return {mesh, halo, haloMat:hm, value:1, kept:false, aside:false, selectable:false, index:i};
  });

  function localNormalWorld(d, v){
    const n = LOCAL_NORMAL[v];
    return BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(n[0],n[1],n[2]), d.mesh.getWorldMatrix()).normalize();
  }
  function topValue(d){
    let best=1, bestDot=-2;
    for(const v of [1,2,3,4,5,6]){
      const w = localNormalWorld(d, v);
      if(w.y > bestDot){ bestDot = w.y; best = v; }
    }
    return best;
  }
  function snapUpright(d){
    const v = topValue(d);
    d.value = v;
    const q = d.mesh.rotationQuaternion.clone();
    const w = localNormalWorld(d, v);
    const up = BABYLON.Vector3.Up();
    const axis = BABYLON.Vector3.Cross(w, up);
    const angle = Math.acos(Math.min(1, Math.max(-1, BABYLON.Vector3.Dot(w, up))));
    const target = axis.length() < 1e-4 ? q : BABYLON.Quaternion.RotationAxis(axis.normalize(), angle).multiply(q);
    const rotA = new BABYLON.Animation('snap','rotationQuaternion',60,BABYLON.Animation.ANIMATIONTYPE_QUATERNION,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    rotA.setKeys([{frame:0,value:q},{frame:10,value:target}]);
    const posA = new BABYLON.Animation('snapY','position.y',60,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    posA.setKeys([{frame:0,value:d.mesh.position.y},{frame:10,value:D/2}]);
    scene.beginDirectAnimation(d.mesh, [rotA, posA], 0, 10, false);
  }

  let rolling = false;
  function throwDice(subset){
    subset = subset || dice.filter(d=>!d.kept && !d.aside);
    return new Promise(resolve=>{
      if(!subset.length) return resolve(dice.map(d=>d.value));
      rolling = true;
      subset.forEach((d,i)=>{
        const imp = d.mesh.physicsImpostor;
        imp.setMass(1);
        d.mesh.position.set(rand(-2.5,2.5) + (i-(subset.length-1)/2)*1.6, rand(3.5,5), AREA/2 - 2.2);
        d.mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(
          new BABYLON.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize(), rand(0,Math.PI*2));
        imp.setLinearVelocity(new BABYLON.Vector3(rand(-1.5,1.5) - d.mesh.position.x*0.3, rand(-1,0.5), rand(-9,-6)));
        imp.setAngularVelocity(new BABYLON.Vector3(rand(-14,14), rand(-14,14), rand(-14,14)));
      });
      let calm = 0;
      const t0 = performance.now();
      const obs = scene.onBeforeRenderObservable.add(()=>{
        const still = subset.every(d=>{
          const lv = d.mesh.physicsImpostor.getLinearVelocity();
          const av = d.mesh.physicsImpostor.getAngularVelocity();
          return lv.length() < 0.12 && av.length() < 0.25;
        });
        calm = still ? calm+1 : 0;
        if(calm > 25 || performance.now()-t0 > 7000){
          scene.onBeforeRenderObservable.remove(obs);
          subset.forEach(d=>{
            d.mesh.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
            d.mesh.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
            d.mesh.physicsImpostor.setMass(0);
            snapUpright(d);
          });
          setTimeout(()=>{ rolling = false; resolve(dice.map(d=>d.value)); }, 260);
        }
      });
    });
  }

  function moveTo(d, x, z, frames){
    frames = frames || 14;
    const px = new BABYLON.Animation('mx','position.x',60,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    px.setKeys([{frame:0,value:d.mesh.position.x},{frame:frames,value:x}]);
    const pz = new BABYLON.Animation('mz','position.z',60,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    pz.setKeys([{frame:0,value:d.mesh.position.z},{frame:frames,value:z}]);
    return new Promise(r=> scene.beginDirectAnimation(d.mesh, [px,pz], 0, frames, false, 1, r));
  }

  function setHalo(d, color){
    if(!color){ d.halo.isVisible = false; return; }
    d.haloMat.emissiveColor = BABYLON.Color3.FromHexString(color);
    d.halo.isVisible = true;
  }

  let pickCb = null;
  scene.onPointerObservable.add(pi=>{
    if(pi.type !== BABYLON.PointerEventTypes.POINTERPICK || rolling || !pickCb) return;
    const hit = pi.pickInfo && pi.pickInfo.pickedMesh;
    const d = dice.find(dd => dd.mesh === hit);
    if(d) pickCb(d);
  });

  function applySkin(name){
    dice.forEach(d=> d.mesh.material = skinMaterial(name));
    try{ localStorage.setItem('diceSkin', name); }catch(e){}
  }
  function buildSkinSelect(sel){
    SKINS.forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=SKIN_LABELS[s]; sel.appendChild(o); });
    let saved = null;
    try{ saved = localStorage.getItem('diceSkin'); }catch(e){}
    sel.value = saved && SKINS.includes(saved) ? saved : SKINS[0];
    sel.addEventListener('change', ()=> applySkin(sel.value));
    applySkin(sel.value);
  }

  engine.runRenderLoop(()=>{
    dice.forEach(d=>{
      if(d.halo.isVisible) d.halo.position.set(d.mesh.position.x, 0.03, d.mesh.position.z);
    });
    scene.render();
  });
  addEventListener('resize', ()=> engine.resize());

  return { scene, dice, D, AREA, throwDice, moveTo, setHalo, applySkin, buildSkinSelect,
           onPick: cb => pickCb = cb, isRolling: ()=> rolling };
};
})();
