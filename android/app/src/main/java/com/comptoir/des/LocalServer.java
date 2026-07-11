package com.comptoir.des;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Serveur local embarqué : HTTP (sert assets/www) + relais WebSocket (/ws) pour le
 * multijoueur SANS INTERNET. Le relais est volontairement « bête » : il route des
 * trames texte préfixées "@destinataire|json" (all = tout le monde sauf l'émetteur,
 * un nombre = client précis). Toute la logique de salon reste côté JavaScript.
 */
public class LocalServer {
    public static final int PORT = 8765;
    private static final String WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    private ServerSocket server;
    private ExecutorService pool;
    private final Context ctx;
    private volatile boolean running = false;

    /* --- registre des clients WebSocket --- */
    private static class WsClient { int id; OutputStream out; Socket sock; }
    private final List<WsClient> clients = new ArrayList<>();
    private int nextId = 1;

    public LocalServer(Context ctx) { this.ctx = ctx.getApplicationContext(); }

    public synchronized String start() {
        if (!running) {
            try {
                server = new ServerSocket(PORT);
                pool = Executors.newFixedThreadPool(14); // HTTP + jusqu'à ~10 joueurs WS
                running = true;
                Thread t = new Thread(() -> {
                    while (running) {
                        try { Socket s = server.accept(); pool.execute(() -> handle(s)); }
                        catch (IOException e) { /* serveur fermé */ }
                    }
                });
                t.setDaemon(true);
                t.start();
            } catch (IOException e) { running = false; return ""; }
        }
        String ip = localIp();
        return ip == null ? "" : ("http://" + ip + ":" + PORT + "/");
    }

    public synchronized void stop() {
        running = false;
        try { if (server != null) server.close(); } catch (IOException ignored) {}
        synchronized (clients) {
            for (WsClient c : clients) { try { c.sock.close(); } catch (IOException ignored) {} }
            clients.clear();
        }
        if (pool != null) pool.shutdownNow();
        server = null; pool = null;
    }

    public boolean isRunning() { return running; }

    public static String localIp() {
        String candidate = null;
        try {
            Enumeration<NetworkInterface> nis = NetworkInterface.getNetworkInterfaces();
            while (nis.hasMoreElements()) {
                NetworkInterface ni = nis.nextElement();
                if (!ni.isUp() || ni.isLoopback()) continue;
                Enumeration<InetAddress> addrs = ni.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    InetAddress a = addrs.nextElement();
                    if (!(a instanceof Inet4Address) || a.isLoopbackAddress()) continue;
                    String ip = a.getHostAddress();
                    if (ip == null) continue;
                    if (ip.startsWith("192.168.")) return ip;
                    if (candidate == null && a.isSiteLocalAddress()) candidate = ip;
                }
            }
        } catch (Exception ignored) {}
        return candidate;
    }

    /* ------------------------------------------------------------------ */

    /** Lit une ligne terminée par CRLF directement sur l'InputStream (sans buffering au-delà). */
    private static String readLine(InputStream is) throws IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream(96);
        int b;
        while ((b = is.read()) != -1) {
            if (b == '\n') break;
            if (b != '\r') bo.write(b);
            if (bo.size() > 8192) break;
        }
        if (b == -1 && bo.size() == 0) return null;
        return new String(bo.toByteArray(), StandardCharsets.UTF_8);
    }

    private void handle(Socket sock) {
        try {
            InputStream is = sock.getInputStream();
            OutputStream out = sock.getOutputStream();
            String line = readLine(is);
            if (line == null) { sock.close(); return; }
            String[] parts = line.split(" ");
            if (parts.length < 2) { sock.close(); return; }
            String method = parts[0];
            String path = parts[1];
            int q = path.indexOf('?'); if (q >= 0) path = path.substring(0, q);
            Map<String, String> hd = new HashMap<>();
            String h;
            while ((h = readLine(is)) != null && !h.isEmpty()) {
                int c = h.indexOf(':');
                if (c > 0) hd.put(h.substring(0, c).trim().toLowerCase(), h.substring(c + 1).trim());
            }
            boolean wantWs = hd.get("upgrade") != null && hd.get("upgrade").equalsIgnoreCase("websocket");
            if (path.equals("/ws") && wantWs && hd.containsKey("sec-websocket-key")) {
                wsSession(sock, is, out, hd.get("sec-websocket-key"));
                return; // wsSession ferme le socket
            }
            if (!"GET".equals(method)) { plain(out, 405, "Methode non permise"); sock.close(); return; }
            if (path.equals("/")) path = "/index.html";
            if (path.contains("..")) { plain(out, 403, "Interdit"); sock.close(); return; }
            AssetManager am = ctx.getAssets();
            InputStream file;
            try { file = am.open("www" + path); }
            catch (IOException e) { plain(out, 404, "Introuvable"); sock.close(); return; }
            byte[] body = readAll(file);
            String head = "HTTP/1.1 200 OK\r\nContent-Type: " + mime(path)
                    + "\r\nContent-Length: " + body.length
                    + "\r\nCache-Control: no-cache\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n";
            out.write(head.getBytes(StandardCharsets.UTF_8));
            out.write(body);
            out.flush();
            sock.close();
        } catch (Exception e) {
            try { sock.close(); } catch (IOException ignored) {}
        }
    }

    /* --------------------------- WebSocket --------------------------- */

    private void wsSession(Socket sock, InputStream is, OutputStream out, String key) {
        WsClient me = new WsClient();
        try {
            MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
            String accept = Base64.encodeToString(
                    sha1.digest((key + WS_GUID).getBytes(StandardCharsets.UTF_8)), Base64.NO_WRAP);
            String resp = "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\n"
                    + "Connection: Upgrade\r\nSec-WebSocket-Accept: " + accept + "\r\n\r\n";
            out.write(resp.getBytes(StandardCharsets.UTF_8));
            out.flush();
            me.out = out; me.sock = sock;
            synchronized (clients) { me.id = nextId++; clients.add(me); }
            sendText(me, "{\"_ws\":\"hello\",\"id\":" + me.id + "}");
            while (running) {
                int b1 = is.read();
                if (b1 == -1) break;
                int opcode = b1 & 0x0F;
                int b2 = is.read();
                if (b2 == -1) break;
                boolean masked = (b2 & 0x80) != 0;
                long len = b2 & 0x7F;
                if (len == 126) { len = ((long) is.read() << 8) | is.read(); }
                else if (len == 127) { len = 0; for (int i = 0; i < 8; i++) len = (len << 8) | is.read(); }
                if (len > 1000000L) break; // trame déraisonnable
                byte[] mask = new byte[4];
                if (masked) { for (int i = 0; i < 4; i++) mask[i] = (byte) is.read(); }
                byte[] payload = new byte[(int) len];
                int got = 0;
                while (got < len) { int n = is.read(payload, got, (int) len - got); if (n < 0) break; got += n; }
                if (masked) for (int i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
                if (opcode == 8) break;                        // close
                if (opcode == 9) { frame(me, 10, payload); continue; } // ping -> pong
                if (opcode != 1) continue;                     // texte uniquement
                route(me, new String(payload, StandardCharsets.UTF_8));
            }
        } catch (Exception ignored) {
        } finally {
            boolean removed;
            synchronized (clients) { removed = clients.remove(me); }
            try { sock.close(); } catch (IOException ignored) {}
            if (removed) broadcast(null, "{\"_ws\":\"left\",\"id\":" + me.id + "}");
        }
    }

    /** "@all|json" -> tous sauf l'émetteur ; "@12|json" -> le client 12. */
    private void route(WsClient from, String msg) {
        if (!msg.startsWith("@")) return;
        int bar = msg.indexOf('|');
        if (bar < 2) return;
        String to = msg.substring(1, bar);
        if ("all".equals(to)) { broadcast(from, msg); return; }
        try {
            int id = Integer.parseInt(to);
            WsClient target = null;
            synchronized (clients) { for (WsClient c : clients) if (c.id == id) { target = c; break; } }
            if (target != null) sendText(target, msg);
        } catch (NumberFormatException ignored) {}
    }

    private void broadcast(WsClient except, String msg) {
        List<WsClient> copy;
        synchronized (clients) { copy = new ArrayList<>(clients); }
        for (WsClient c : copy) if (c != except) sendText(c, msg);
    }

    private void sendText(WsClient c, String text) {
        try { frame(c, 1, text.getBytes(StandardCharsets.UTF_8)); }
        catch (IOException e) { synchronized (clients) { clients.remove(c); } }
    }

    private void frame(WsClient c, int opcode, byte[] payload) throws IOException {
        synchronized (c) {
            OutputStream o = c.out;
            o.write(0x80 | opcode);
            if (payload.length < 126) o.write(payload.length);
            else { o.write(126); o.write((payload.length >> 8) & 0xFF); o.write(payload.length & 0xFF); }
            o.write(payload);
            o.flush();
        }
    }

    /* ------------------------------------------------------------------ */

    private static byte[] readAll(InputStream is) throws IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] buf = new byte[65536];
        int n;
        while ((n = is.read(buf)) > 0) bo.write(buf, 0, n);
        is.close();
        return bo.toByteArray();
    }

    private static void plain(OutputStream out, int code, String msg) throws IOException {
        byte[] b = msg.getBytes(StandardCharsets.UTF_8);
        String head = "HTTP/1.1 " + code + " X\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: "
                + b.length + "\r\nConnection: close\r\n\r\n";
        out.write(head.getBytes(StandardCharsets.UTF_8));
        out.write(b);
        out.flush();
    }

    private static String mime(String p) {
        p = p.toLowerCase();
        if (p.endsWith(".html")) return "text/html; charset=utf-8";
        if (p.endsWith(".js")) return "application/javascript; charset=utf-8";
        if (p.endsWith(".css")) return "text/css; charset=utf-8";
        if (p.endsWith(".webp")) return "image/webp";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".json") || p.endsWith(".webmanifest")) return "application/json; charset=utf-8";
        if (p.endsWith(".mp3")) return "audio/mpeg";
        if (p.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }
}
