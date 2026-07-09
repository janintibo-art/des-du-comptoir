/* Service worker — Les Dés du Comptoir (hors-ligne) */
const V='ddc-20260709170059';
const CORE=["./", "./awale-234.html", "./awale-kalah.html", "./awale-oware.html", "./awale.js", "./card-shell.js", "./cards.css", "./cards.js", "./carte-bataille.html", "./carte-hearts.html", "./carte-huit.html", "./carte-menteur.html", "./carte-pouilleux.html", "./carte-president.html", "./carte-rami.html", "./carte-scopa.html", "./carte-tarot.html", "./cochon-troue.html", "./dames-classique.html", "./dice-engine.js", "./domino-classique.html", "./domino-matador.html", "./domino-toutcinq.html", "./domino-train.html", "./dominos.js", "./echecs-classique.html", "./echelles.html", "./favicon.png", "./game-10000.html", "./game-421.html", "./game-boite.html", "./game-boston.html", "./game-chicago.html", "./game-cochon.html", "./game-core.js", "./game-martinetti.html", "./game-mexico.html", "./game-passedix.html", "./game-poker.html", "./game-yams.html", "./game-zanzibar.html", "./icon-192.png", "./icon-512.png", "./index.html", "./manifest.webmanifest", "./net-games.js", "./net-games2.js", "./net-games3.js", "./net-games4.js", "./net-games5.js", "./net-games6.js", "./net.js", "./oie-delirant.html", "./origins-data.js", "./p4.html", "./parcours.js", "./reglages.html", "./regles.html", "./rules-data.js", "./salon.html", "./stats.html", "./style.css", "./sw.js", "./tournoi.html", "./uno.html"];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message', e=>{ if(e.data==='skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(res=>{
      if(res && res.status===200 && res.type==='basic'){ const cp=res.clone(); caches.open(V).then(c=>c.put(req,cp)); }
      return res;
    }).catch(()=> req.mode==='navigate' ? caches.match('./index.html') : Response.error()))
  );
});
