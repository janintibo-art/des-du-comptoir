'use strict';
/* Module réseau : Monopoli (2-5 joueurs). L'hôte fait autorité : économie complète,
   résolution automatique (loyers, taxes, cartes, prison, faillite avec hypothèque de
   secours) ; seules les décisions passent par le joueur : lancer, acheter, construire,
   hypothéquer. Compatible mode Table (le plateau se dessine pour tous). */
(function(){
const NG=window.NetGames; if(!NG) return;

/* ---------- données du plateau (40 cases, mêmes valeurs que monopoly.html) ---------- */
const G={brown:'#7a5230',lb:'#7fb2d9',pink:'#d2489b',orange:'#e2841c',red:'#c0392b',yellow:'#f0c419',green:'#2e8b3d',blue:'#12324f'};
function rue(n,nf,p,g,r,hc){ return {t:'street',n,nf,p,g,r,hc,m:p/2}; }
function rail(n,nf){ return {t:'rail',n,nf,p:200,r:[25,50,100,200],m:100}; }
function util(n,nf){ return {t:'utility',n,nf,p:150,m:75}; }
const LAYOUT=[
 {t:'go',n:'Départ',nf:'Départ'},
 rue('Boulevard de Belleville','Quartier des Docks',60,'brown',[2,10,30,90,160,250],50),
 {t:'chest',n:'Caisse de Communauté',nf:'Caisse de Communauté'},
 rue('Rue Lecourbe','Allée des Hackers',60,'brown',[4,20,60,180,320,450],50),
 {t:'tax',n:'Impôt sur le Revenu',nf:'Impôt sur le Revenu',tax:200},
 rail('Gare Montparnasse','Gare Navette Alpha'),
 rue('Avenue Mozart','Avenue des Androïdes',100,'lb',[6,30,90,270,400,550],50),
 {t:'chance',n:'Chance',nf:'Imprévu'},
 rue('Boulevard de la Villette','Secteur Solaire',100,'lb',[6,30,90,270,400,550],50),
 rue('Avenue de Neuilly','Allée Cosmos',120,'lb',[8,40,100,300,450,600],50),
 {t:'jail',n:'Prison / Visite',nf:'Prison / Visite'},
 rue('Rue de Paradis','Rue des Drones',140,'pink',[10,50,150,450,625,750],100),
 util('Compagnie d\u2019Électricité','Compagnie d\u2019Énergie Quantique'),
 rue('Avenue de la République','Avenue Orbite',140,'pink',[10,50,150,450,625,750],100),
 rue('Boulevard de Clichy','Cours des Météores',160,'pink',[12,60,180,500,700,900],100),
 rail('Gare Saint-Lazare','Gare Orbitale Sigma'),
 rue('Faubourg Saint-Honoré','Faubourg des Cyborgs',180,'orange',[14,70,200,550,750,950],100),
 {t:'chest',n:'Caisse de Communauté',nf:'Caisse de Communauté'},
 rue('Place Pigalle','Place du Réacteur',180,'orange',[14,70,200,550,750,950],100),
 rue('Boulevard Saint-Michel','Boulevard Hologramme',200,'orange',[16,80,220,600,800,1000],100),
 {t:'parking',n:'Parking Gratuit',nf:'Parking Gratuit'},
 rue('Avenue Matignon','Avenue Quantique',220,'red',[18,90,250,700,875,1050],150),
 {t:'chance',n:'Chance',nf:'Imprévu'},
 rue('Boulevard Malesherbes','Cours des Nébuleuses',220,'red',[18,90,250,700,875,1050],150),
 rue('Avenue Henri-Martin','Avenue Hyperion',240,'red',[20,100,300,750,925,1100],150),
 rail('Gare de Lyon','Gare Hyperloop Prime'),
 rue('Faubourg Poissonnière','Quartier des Satellites',260,'yellow',[22,110,330,800,975,1150],150),
 rue('Rue La Fayette','Rue du Warp',260,'yellow',[22,110,330,800,975,1150],150),
 util('Compagnie des Eaux','Réseau des Eaux Synthétiques'),
 rue('Avenue de Breteuil','Boulevard du Zénith',280,'yellow',[24,120,360,850,1025,1200],150),
 {t:'gotojail',n:'Allez en Prison',nf:'Allez en Prison'},
 rue('Avenue Foch','Avenue Néo-Tokyo',300,'green',[26,130,390,900,1100,1275],200),
 rue('Boulevard des Capucines','Place des Pulsars',300,'green',[26,130,390,900,1100,1275],200),
 {t:'chest',n:'Caisse de Communauté',nf:'Caisse de Communauté'},
 rue('Avenue des Champs-Élysées','Avenue des Astres',320,'green',[28,150,450,1000,1200,1400],200),
 rail('Gare du Nord','Gare Stellaire Nord'),
 {t:'chance',n:'Chance',nf:'Imprévu'},
 rue('Place de la Bourse','Promenade Galactique',320,'blue',[35,175,500,1100,1300,1500],200),
 {t:'tax',n:'Taxe de Luxe',nf:'Taxe de Luxe',tax:100},
 rue('Avenue Montaigne','Avenue Cosmopolis',400,'blue',[50,200,600,1400,1700,2000],200),
];
const NB=LAYOUT.length;
const THEMES={
  ancien:{board:'monopoly/plateau-ancien.webp',cur:'F',pions:['monopoly/anc-pion-chapeau.webp','monopoly/anc-pion-montre.webp','monopoly/anc-pion-cle.webp','monopoly/anc-pion-bateau.webp','monopoly/anc-pion-chat.webp'],maison:'monopoly/anc-maison.webp',hotel:'monopoly/anc-hotel.webp'},
  futur:{board:'monopoly/plateau-futur.webp',cur:'¤',pions:['monopoly/fut-pion-1.webp','monopoly/fut-pion-2.webp','monopoly/fut-pion-3.webp','monopoly/fut-pion-4.webp','monopoly/fut-pion-5.webp'],maison:'monopoly/fut-maison.webp',hotel:'monopoly/fut-hotel.webp'},
};
function curTheme(){ let id='ancien'; try{ id=localStorage.getItem('monoTheme')||'ancien'; }catch(e){} return THEMES[id]?id:'ancien'; }
function nameOf(i,th){ const c=LAYOUT[i]; return (th==='futur'&&c.nf)?c.nf:c.n; }
const RING={lo:0.115,hi:0.885,band:0.058,N:9};
function cellPos(i){ const {lo,hi,band,N}=RING; const span=(hi-lo)/N;
  if(i===0)return{x:1-band,y:1-band}; if(i===10)return{x:band,y:1-band}; if(i===20)return{x:band,y:band}; if(i===30)return{x:1-band,y:band};
  if(i<=9)return{x:hi-span*(i-0.5),y:1-band}; if(i<=19)return{x:band,y:hi-span*(i-10.5)};
  if(i<=29)return{x:lo+span*(i-20.5),y:band}; return{x:1-band,y:lo+span*(i-30.5)}; }
const CHANCE=[
 ['Avancez jusqu\u2019au Départ.',{go0:1}],['La banque vous verse un dividende de 50.',{money:50}],
 ['Reculez de 3 cases.',{move:-3}],['Réparations : payez 25 par maison, 100 par hôtel.',{repairs:[25,100]}],
 ['Allez à la gare la plus proche.',{nearestRail:1}],['Votre bien prend de la valeur : recevez 100.',{money:100}],
 ['Amende pour excès de vitesse : payez 15.',{money:-15}],['Concours d\u2019élégance : recevez 25.',{money:25}],
 ['Sortez de prison — carte à conserver.',{getout:1}],['Allez directement en prison.',{tojail:1}],
 ['Fête municipale : recevez 20.',{money:20}],['Les impôts vous remboursent : recevez 20.',{money:20}],
 ['Voyage express : avancez de 3 cases.',{move:3}],['Petit héritage : recevez 100.',{money:100}],
 ['Perte au jeu : payez 50.',{money:-50}],['Votre navire arrive : recevez 50.',{money:50}]];
const CHEST=[
 ['Erreur de la banque en votre faveur : recevez 200.',{money:200}],['Honoraires du notaire : payez 50.',{money:-50}],
 ['Vente de tableaux : recevez 75.',{money:75}],['Frais de médecin : payez 50.',{money:-50}],
 ['Héritage : recevez 100.',{money:100}],['Prime d\u2019assurance : recevez 100.',{money:100}],
 ['Anniversaire : chaque joueur vous donne 10.',{birthday:10}],['Travaux : payez 40 par maison, 115 par hôtel.',{repairs:[40,115]}],
 ['Bourse d\u2019étude : recevez 50.',{money:50}],['Impôt sur le revenu : payez 20.',{money:-20}],
 ['Remboursement : recevez 150.',{money:150}],['2e prix de beauté : recevez 10.',{money:10}],
 ['Frais d\u2019école : payez 50.',{money:-50}],['Recettes : recevez 25.',{money:25}],
 ['Sortez de prison — carte à conserver.',{getout:1}],['Allez au Départ.',{go0:1}]];
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

/* ---------- logique hôte ---------- */
const railIdx=[],utilIdx=[]; LAYOUT.forEach((c,i)=>{ if(c.t==='rail')railIdx.push(i); if(c.t==='utility')utilIdx.push(i); });
function ownsAll(s,pi,g){ if(!g)return false; for(let i=0;i<NB;i++) if(LAYOUT[i].g===g&&s.owner[i]!==pi) return false; return true; }
function rentOf(s,i,dice){ const c=LAYOUT[i],o=s.owner[i]; if(o<0||s.mort[i]) return 0;
  if(c.t==='rail'){ const n=railIdx.filter(x=>s.owner[x]===o).length; return c.r[Math.max(0,n-1)]; }
  if(c.t==='utility'){ const n=utilIdx.filter(x=>s.owner[x]===o).length; return dice*(n>=2?10:4); }
  if(s.houses[i]>0) return c.r[Math.min(5,s.houses[i])];
  let b=c.r[0]; if(ownsAll(s,o,c.g)) b*=2; return b; }
function canBuild(s,pi,i){ const c=LAYOUT[i]; return c.t==='street'&&s.owner[i]===pi&&!s.mort[i]&&ownsAll(s,pi,c.g)&&s.houses[i]<5&&s.players[pi].money>=c.hc; }
function raiseCash(s,pi){ const p=s.players[pi];
  for(let i=0;i<NB&&p.money<0;i++){ while(s.houses[i]>0&&s.owner[i]===pi&&p.money<0){ s.houses[i]--; p.money+=Math.floor(LAYOUT[i].hc/2); } }
  const props=[]; for(let i=0;i<NB;i++) if(s.owner[i]===pi&&!s.mort[i]&&s.houses[i]===0&&LAYOUT[i].m) props.push(i);
  props.sort((a,b)=>LAYOUT[b].m-LAYOUT[a].m);
  for(const i of props){ if(p.money>=0)break; s.mort[i]=true; p.money+=LAYOUT[i].m; } }
function bankrupt(s,pi){ if(s.players[pi].money<0) raiseCash(s,pi);
  if(s.players[pi].money<0){ s.players[pi].alive=false;
    for(let i=0;i<NB;i++) if(s.owner[i]===pi){ s.owner[i]=-1; s.houses[i]=0; s.mort[i]=false; }
    return true; } return false; }
function alive(s){ return s.players.filter(p=>p.alive).length; }
function nextTurn(s){ if(alive(s)<=1){ const w=s.players.find(p=>p.alive); s.winner=w?w.name:null; return; }
  do{ s.turn=(s.turn+1)%s.players.length; }while(!s.players[s.turn].alive); s.phase='pre'; }
function draw(s,isCh){ const d=isCh?s.chance:s.chest; if(!d.length) d.push(...shuffle((isCh?CHANCE:CHEST).map((_,k)=>k)));
  return (isCh?CHANCE:CHEST)[d.shift()]; }
function resolve(s,pi,dice){ const p=s.players[pi]; const i=p.pos; const c=LAYOUT[i]; const cur='';
  if(c.t==='gotojail'){ p.pos=10; p.jail=3; s.ev=p.name+' file en prison ! 🔒'; return 'end'; }
  if(c.t==='tax'){ p.money-=c.tax; s.ev=p.name+' paie '+c.tax+' de taxe.'; if(bankrupt(s,pi)) s.ev+=' 💸 Faillite !'; return 'end'; }
  if(c.t==='chance'||c.t==='chest'){ const card=draw(s,c.t==='chance');
    s.ev='🃏 '+p.name+' : « '+card[0]+' »'; return applyCard(s,pi,card[1],dice); }
  if(c.t==='street'||c.t==='rail'||c.t==='utility'){ const o=s.owner[i];
    if(o<0){ if(p.money>=c.p){ s.phase='buy'; s.buyIdx=i; return 'wait'; } s.ev=p.name+' ne peut pas acheter '+c.n+'.'; return 'end'; }
    if(o===pi){ s.ev=p.name+' est chez lui.'; return 'end'; }
    const r=rentOf(s,i,dice); p.money-=r; if(!bankrupt(s,pi)) s.players[o].money+=r;
    s.ev=p.name+' paie '+r+' de loyer à '+s.players[o].name+'.'+(p.alive?'':' 💸 Faillite !'); return 'end'; }
  s.ev=p.name+' se repose ('+nameOf(i,'ancien')+').'; return 'end'; }
function applyCard(s,pi,fx,dice){ const p=s.players[pi];
  if(fx.money){ p.money+=fx.money; if(fx.money<0&&bankrupt(s,pi)) s.ev+=' 💸 Faillite !'; return 'end'; }
  if(fx.go0){ p.pos=0; p.money+=200; return 'end'; }
  if(fx.tojail){ p.pos=10; p.jail=3; return 'end'; }
  if(fx.getout){ p.getout=(p.getout||0)+1; return 'end'; }
  if(fx.birthday){ s.players.forEach((q,j)=>{ if(j!==pi&&q.alive){ q.money-=fx.birthday; p.money+=fx.birthday; if(bankrupt(s,j)) s.ev+=' ('+q.name+' en faillite !)'; } }); return 'end'; }
  if(fx.repairs){ let cost=0; for(let i=0;i<NB;i++) if(s.owner[i]===pi) cost+= s.houses[i]===5?fx.repairs[1]:s.houses[i]*fx.repairs[0];
    if(cost>0){ p.money-=cost; if(bankrupt(s,pi)) s.ev+=' 💸 Faillite !'; } return 'end'; }
  if(fx.move){ let np=(p.pos+fx.move)%NB; if(np<0)np+=NB; if(fx.move>0&&p.pos+fx.move>=NB)p.money+=200; p.pos=np; return resolve(s,pi,dice); }
  if(fx.nearestRail){ let d=1; while(LAYOUT[(p.pos+d)%NB].t!=='rail'&&d<NB)d++; if(p.pos+d>=NB)p.money+=200; p.pos=(p.pos+d)%NB; return resolve(s,pi,dice); }
  return 'end'; }

const monopoly={
  id:'monopoly', label:'Monopoli 🎩', minP:2, maxP:5, family:'monopoly',
  deal(names){ return { players:names.map(n=>({name:n,pos:0,money:1500,alive:true,jail:0,getout:0})),
      owner:new Array(NB).fill(-1), houses:new Array(NB).fill(0), mort:new Array(NB).fill(false),
      turn:0, phase:'pre', dice:null, chance:shuffle(CHANCE.map((_,k)=>k)), chest:shuffle(CHEST.map((_,k)=>k)),
      ev:'La partie commence — chacun part avec 1500 !', winner:null }; },
  view(s,name){ const me=s.players.findIndex(p=>p.name===name); const my=s.players[me]||{};
    const myTurn = !s.winner && me===s.turn && my.alive!==false;
    const v={ game:'monopoly', owner:s.owner, houses:s.houses, mort:s.mort, dice:s.dice, ev:s.ev, phase:s.phase, myTurn,
      winner:s.winner, meIdx:me,
      players:s.players.map((p,j)=>({name:p.name,money:p.money,pos:p.pos,alive:p.alive,jail:p.jail>0,turn:j===s.turn,idx:j})) };
    if(myTurn&&s.phase==='buy'){ const c=LAYOUT[s.buyIdx]; v.buy={i:s.buyIdx,price:c.p}; }
    if(myTurn&&s.phase==='pre'){ v.canBuild=[]; v.bank=[];
      for(let i=0;i<NB;i++){ if(canBuild(s,me,i)) v.canBuild.push(i);
        if(s.owner[i]===me){ if(!s.mort[i]&&s.houses[i]===0&&LAYOUT[i].m) v.bank.push({i,mode:'m'});
          else if(s.mort[i]&&my.money>=Math.ceil(LAYOUT[i].m*1.1)) v.bank.push({i,mode:'u'}); } } }
    return v; },
  apply(s,name,a){ const pi=s.players.findIndex(p=>p.name===name);
    if(s.winner||pi!==s.turn||!s.players[pi].alive) return {ok:false};
    const p=s.players[pi];
    if(s.phase==='buy'){
      if(a.type==='buy'){ const c=LAYOUT[s.buyIdx]; if(p.money>=c.p){ p.money-=c.p; s.owner[s.buyIdx]=pi; s.ev=p.name+' achète '+c.n+' ! 🏠'; } nextTurn(s); return {ok:true,msg:s.ev}; }
      if(a.type==='pass'){ s.ev=p.name+' passe son tour d\u2019achat.'; nextTurn(s); return {ok:true,msg:s.ev}; }
      return {ok:false}; }
    if(s.phase!=='pre') return {ok:false};
    if(a.type==='build'){ const i=a.i|0; if(!canBuild(s,pi,i)) return {ok:false};
      p.money-=LAYOUT[i].hc; s.houses[i]++; s.ev=p.name+(s.houses[i]===5?' bâtit un HÔTEL !':' bâtit une maison.'); return {ok:true,msg:s.ev}; }
    if(a.type==='bank'){ const i=a.i|0;
      if(a.mode==='m'&&s.owner[i]===pi&&!s.mort[i]&&s.houses[i]===0&&LAYOUT[i].m){ s.mort[i]=true; p.money+=LAYOUT[i].m; s.ev=p.name+' hypothèque '+LAYOUT[i].n+'.'; return {ok:true,msg:s.ev}; }
      if(a.mode==='u'&&s.owner[i]===pi&&s.mort[i]){ const c=Math.ceil(LAYOUT[i].m*1.1); if(p.money>=c){ s.mort[i]=false; p.money-=c; s.ev=p.name+' lève l\u2019hypothèque de '+LAYOUT[i].n+'.'; return {ok:true,msg:s.ev}; } }
      return {ok:false}; }
    if(a.type!=='roll') return {ok:false};
    const d1=1+Math.floor(Math.random()*6), d2=1+Math.floor(Math.random()*6); s.dice=[d1,d2]; const tot=d1+d2;
    if(p.jail>0){
      if(d1===d2){ p.jail=0; s.ev=p.name+' fait un double et sort de prison !'; }
      else { p.jail--; if(p.jail===0){ p.money-=50; s.ev=p.name+' paie 50 et sort.'; if(bankrupt(s,pi)){ s.ev+=' 💸 Faillite !'; nextTurn(s); return {ok:true,msg:s.ev}; } }
        else { s.ev=p.name+' reste en prison ('+p.jail+' essai'+(p.jail>1?'s':'')+').'; nextTurn(s); return {ok:true,msg:s.ev}; } } }
    else s.ev=p.name+' fait '+d1+' + '+d2+'.';
    const passed = p.pos+tot>=NB; p.pos=(p.pos+tot)%NB; if(passed){ p.money+=200; s.ev+=' (+200 Départ)'; }
    const r=resolve(s,pi,tot);
    if(r!=='wait') nextTurn(s);
    return {ok:true,msg:s.ev}; },
  isOver(s){ if(!s.winner) return null;
    return {over:true, text:'🎩 <b>'+s.winner+'</b> est le dernier propriétaire solvable !'}; },
  render(v,ui){
    const th=curTheme(), TH=THEMES[th], CUR=TH.cur;
    ui.opps(v.players.filter(p=>p.name!==ui.myName).map(p=>({name:p.name+(p.jail?' 🔒':'')+(p.alive?'':' 💸'), count:p.money, turn:p.turn})));
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:8px;width:100%';
    const me=v.players.find(p=>p.name===ui.myName);
    if(me){ const m=document.createElement('div'); m.style.cssText='font-size:14px'; m.innerHTML='💰 Votre argent : <b style="color:var(--accent)">'+me.money+'</b>'+CUR+(me.jail?' — 🔒 en prison':''); wrap.appendChild(m); }
    const bd=document.createElement('div');
    bd.style.cssText='position:relative;width:100%;max-width:520px;aspect-ratio:1/1;background-size:contain;background-repeat:no-repeat;background-position:center;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.5)';
    bd.style.backgroundImage='url('+TH.board+')';
    const COLS=['#e0a34c','#4a90d9','#5cb85c','#d9534f','#9b59b6'];
    for(let i=0;i<NB;i++){ if(v.owner[i]>=0){ const pos=cellPos(i); const d=document.createElement('div');
      d.style.cssText='position:absolute;width:11px;height:11px;border-radius:50%;border:2px solid #fff;transform:translate(-50%,-50%);z-index:2;background:'+COLS[v.owner[i]%5]+(v.mort[i]?';opacity:.35':'');
      d.style.left=(pos.x*100)+'%'; d.style.top=(pos.y*100)+'%'; bd.appendChild(d); } }
    for(let i=0;i<NB;i++){ if(v.houses[i]>0){ const pos=cellPos(i); const n=v.houses[i]===5?1:v.houses[i]; const src=v.houses[i]===5?TH.hotel:TH.maison;
      for(let h=0;h<n;h++){ const im=new Image(); im.src=src; im.style.cssText='position:absolute;height:3%;z-index:2;transform:translate(-50%,-50%)';
        im.style.left=(pos.x*100+(h-(n-1)/2)*2.4)+'%'; im.style.top=(pos.y*100-5.5)+'%'; bd.appendChild(im); } } }
    const byCell={}; v.players.forEach(p=>{ if(!p.alive)return; (byCell[p.pos]=byCell[p.pos]||[]).push(p); });
    Object.keys(byCell).forEach(k=>{ byCell[k].forEach((p,j)=>{ const pos=cellPos(p.pos); const el=document.createElement('div');
      el.style.cssText='position:absolute;width:5.5%;transform:translate(-50%,-65%);z-index:3;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))';
      const off=byCell[k].length>1?(j-(byCell[k].length-1)/2)*2.6:0;
      el.style.left=(pos.x*100+off)+'%'; el.style.top=(pos.y*100)+'%';
      const im=new Image(); im.src=TH.pions[p.idx%5]; im.style.width='100%'; el.appendChild(im); bd.appendChild(el); }); });
    wrap.appendChild(bd);
    if(v.dice){ const d=document.createElement('div'); d.style.cssText='font-size:15px;opacity:.9'; d.textContent='🎲 '+v.dice[0]+' + '+v.dice[1]+' = '+(v.dice[0]+v.dice[1]); wrap.appendChild(d); }
    if(v.ev){ const e=document.createElement('div'); e.style.cssText='font-size:13.5px;opacity:.85;text-align:center;max-width:480px'; e.textContent=v.ev; wrap.appendChild(e); }
    ui.center(wrap); ui.hand(null);
    if(!v.myTurn){ ui.buttons([],()=>{}); ui.say(v.winner?('Victoire de '+v.winner+' !'):'Au tour de '+((v.players.find(p=>p.turn)||{}).name||'…')); return; }
    if(v.phase==='buy'&&v.buy){ const c=LAYOUT[v.buy.i];
      ui.say('Acheter '+nameOf(v.buy.i,th)+' pour '+v.buy.price+CUR+' ?');
      ui.buttons([{id:'buy',label:'🏠 Acheter ('+v.buy.price+CUR+')',primary:true},{id:'pass',label:'Passer'}], id=>ui.send({type:id})); return; }
    const btns=[{id:'roll',label:'🎲🎲 Lancer les dés',primary:true}];
    if(v.canBuild&&v.canBuild.length) btns.push({id:'build',label:'🏠 Construire'});
    if(v.bank&&v.bank.length) btns.push({id:'bank',label:'🏦 Hypothèques'});
    ui.say(me&&me.jail?'Prison : tentez un double !':'À vous de jouer.');
    ui.buttons(btns, id=>{
      if(id==='roll'){ ui.send({type:'roll'}); return; }
      if(id==='build'){ ui.choose(v.canBuild.map(i=>({id:''+i,label:(v.houses[i]===4?'🏨 ':'🏠 ')+nameOf(i,th)+' ('+LAYOUT[i].hc+CUR+')'})).concat([{id:'x',label:'Annuler'}]),
        c=>{ if(c!=='x') ui.send({type:'build',i:+c}); }); return; }
      if(id==='bank'){ ui.choose(v.bank.map(b=>({id:b.mode+b.i,label:(b.mode==='m'?'🏦 Hypothéquer ':'💵 Lever ')+nameOf(b.i,th)+(b.mode==='m'?' (+'+LAYOUT[b.i].m+CUR+')':' (-'+Math.ceil(LAYOUT[b.i].m*1.1)+CUR+')')})).concat([{id:'x',label:'Annuler'}]),
        c=>{ if(c!=='x') ui.send({type:'bank',mode:c[0],i:+c.slice(1)}); }); return; }
    });
  }
};
NG['monopoly']=monopoly; NG.list.push(monopoly);
})();
