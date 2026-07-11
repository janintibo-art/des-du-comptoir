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


  /* ------- MODE LOCAL (serveur embarqué de l'app Android, sans Internet) -------
     Relais WebSocket "bête" : trames '@dest|{"from":id,"body":...}'. */
  function localWsUrl(){
    try{
      if(/:8765$/.test(location.host)) return 'ws://'+location.host+'/ws';
      if(window.AndroidApp && AndroidApp.localServerUrl){
        const u = AndroidApp.localServerUrl();
        if(u) return u.replace(/^http/,'ws').replace(/\/$/,'')+'/ws';
      }
    }catch(e){}
    return null;
  }
  function parseMsg(data){
    try{
      if(typeof data!=='string') return null;
      if(data[0]==='@'){ const i=data.indexOf('|'); return i>0? JSON.parse(data.slice(i+1)) : null; }
      return JSON.parse(data); // messages système du relais (_ws)
    }catch(e){ return null; }
  }
  function hostLocal(url, name, cb){
    const ws = new WebSocket(url);
    let myId = null;
    const guests = []; // {id, name}
    const raw = (to,obj)=>{ try{ ws.send('@'+to+'|'+JSON.stringify({from:myId, body:obj})); }catch(e){} };
    const api = {
      code:'LOCAL', name, isHost:true, local:true,
      players(){ return [{name, host:true}, ...guests.map(g=>({name:g.name}))]; },
      sendTo(gName,msg){ const g=guests.find(x=>x.name===gName); if(g) raw(g.id,msg); },
      broadcast(msg){ guests.forEach(g=>raw(g.id,msg)); },
      close(){ try{ ws.close(); }catch(e){} },
    };
    ws.onerror = ()=> cb.onError && cb.onError({type:'local-ws'});
    ws.onmessage = ev=>{
      const env = parseMsg(ev.data); if(!env) return;
      if(env._ws==='hello'){ myId=env.id; cb.onReady && cb.onReady('LOCAL'); return; }
      if(env._ws==='left'){ const i=guests.findIndex(g=>g.id===env.id);
        if(i>=0){ const g=guests.splice(i,1)[0]; cb.onLeave && cb.onLeave(g); } return; }
      if(env.from==null || !env.body) return;
      const msg = env.body;
      const known = guests.find(g=>g.id===env.from);
      if(msg.t==='hello' && !known){
        let n = String(msg.name||'Invité').slice(0,14) || 'Invité';
        while(n===name || guests.some(x=>x.name===n)) n += '·';
        const g = {id:env.from, name:n};
        guests.push(g);
        raw(g.id, {t:'welcome', name:n});
        cb.onJoin && cb.onJoin(g);
      } else if(known && cb.onMessage) cb.onMessage(known, msg);
    };
    return api;
  }
  function joinLocal(url, name, cb){
    const ws = new WebSocket(url);
    let myId=null, hostId=null;
    const api = {
      isHost:false, name, local:true,
      send(msg){ if(hostId!=null){ try{ ws.send('@'+hostId+'|'+JSON.stringify({from:myId, body:msg})); }catch(e){} } },
      close(){ try{ ws.close(); }catch(e){} },
    };
    const failTimer = setTimeout(()=>{ if(!api._ok) cb.onError && cb.onError({type:'timeout'}); }, 9000);
    ws.onerror = ()=> cb.onError && cb.onError({type:'local-ws'});
    ws.onclose = ()=>{ if(api._ok) cb.onClose && cb.onClose(); };
    ws.onmessage = ev=>{
      const env = parseMsg(ev.data); if(!env) return;
      if(env._ws==='hello'){ myId=env.id; try{ ws.send('@all|'+JSON.stringify({from:myId, body:{t:'hello', name}})); }catch(e){} return; }
      if(env._ws==='left'){ if(env.id===hostId){ cb.onClose && cb.onClose(); } return; }
      if(env.from==null || !env.body) return;
      const msg = env.body;
      if(msg.t==='welcome' && hostId==null){
        hostId = env.from; api._ok = true; api.name = msg.name; clearTimeout(failTimer);
        cb.onReady && cb.onReady(msg.name); return;
      }
      if(env.from===hostId && cb.onMessage) cb.onMessage(msg);
    };
    return api;
  }

  return {
    host(name, cb){ const u=localWsUrl(); return u? hostLocal(u,name,cb) : host(name,cb); },
    join(code, name, cb){ const u=localWsUrl(); return u? joinLocal(u,name,cb) : join(code,name,cb); },
    isLocal(){ return !!localWsUrl(); },
  };
})();
