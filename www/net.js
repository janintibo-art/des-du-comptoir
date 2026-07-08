'use strict';
/* Couche réseau multi-téléphones (PeerJS / WebRTC).
   L'hôte fait autorité : il tient l'état du jeu et envoie à chaque invité
   sa vue privée. Code de table court, échange de messages JSON. */
const Net = (function(){
  const PREFIX = 'ddc-salon-';
  const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sans lettres ambiguës
  function makeCode(){
    let c = '';
    for(let i = 0; i < 4; i++) c += ALPHABET[Math.floor(Math.random()*ALPHABET.length)];
    return c;
  }
  function newPeer(id){
    return new Peer(id, {debug: 1});
  }

  /* ------- HÔTE ------- */
  function host(name, cb){
    // cb: {onReady(code), onJoin(player), onLeave(player), onMessage(player, msg), onError(e)}
    const code = makeCode();
    const peer = newPeer(PREFIX + code);
    const guests = []; // {conn, name, id}
    const api = {
      code, name, isHost: true,
      players(){ return [{name, host:true}, ...guests.map(g=>({name:g.name}))]; },
      sendTo(gName, msg){
        const g = guests.find(x=>x.name===gName);
        if(g && g.conn.open) g.conn.send(msg);
      },
      broadcast(msg){ guests.forEach(g=>{ if(g.conn.open) g.conn.send(msg); }); },
      close(){ try{ peer.destroy(); }catch(e){} },
    };
    peer.on('open', ()=> cb.onReady && cb.onReady(code));
    peer.on('error', e=> cb.onError && cb.onError(e));
    peer.on('connection', conn=>{
      const g = {conn, name:null};
      conn.on('data', msg=>{
        if(msg && msg.t === 'hello'){
          let n = String(msg.name||'Invité').slice(0,14) || 'Invité';
          while(n===name || guests.some(x=>x.name===n)) n += '·';
          g.name = n;
          guests.push(g);
          conn.send({t:'welcome', name:n});
          cb.onJoin && cb.onJoin(g);
        } else if(g.name && cb.onMessage) cb.onMessage(g, msg);
      });
      conn.on('close', ()=>{
        const i = guests.indexOf(g);
        if(i >= 0){ guests.splice(i,1); cb.onLeave && cb.onLeave(g); }
      });
      conn.on('error', ()=>{});
    });
    return api;
  }

  /* ------- INVITÉ ------- */
  function join(code, name, cb){
    // cb: {onReady(finalName), onMessage(msg), onClose(), onError(e)}
    const peer = newPeer(undefined);
    const api = {
      isHost: false, name,
      send(msg){ if(api._conn && api._conn.open) api._conn.send(msg); },
      close(){ try{ peer.destroy(); }catch(e){} },
    };
    peer.on('error', e=> cb.onError && cb.onError(e));
    peer.on('open', ()=>{
      const conn = peer.connect(PREFIX + code.toUpperCase().trim(), {reliable:true});
      api._conn = conn;
      const failTimer = setTimeout(()=>{
        if(!api._ok) cb.onError && cb.onError({type:'timeout'});
      }, 9000);
      conn.on('open', ()=> conn.send({t:'hello', name}));
      conn.on('data', msg=>{
        if(msg && msg.t === 'welcome'){
          api._ok = true; api.name = msg.name; clearTimeout(failTimer);
          cb.onReady && cb.onReady(msg.name);
        } else if(cb.onMessage) cb.onMessage(msg);
      });
      conn.on('close', ()=> cb.onClose && cb.onClose());
    });
    return api;
  }

  return {host, join};
})();
