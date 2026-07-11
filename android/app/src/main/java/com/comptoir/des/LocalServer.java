package com.comptoir.des;

import android.content.Context;
import android.content.res.AssetManager;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Mini serveur HTTP embarqué : sert l'app web (assets/www) sur le réseau local.
 * Permet aux invités de jouer depuis leur navigateur, sans Internet ni installation.
 * Aucune dépendance externe. Lecture seule, chemins normalisés (pas de "..").
 */
public class LocalServer {
    public static final int PORT = 8765;
    private ServerSocket server;
    private ExecutorService pool;
    private final Context ctx;
    private volatile boolean running = false;

    public LocalServer(Context ctx) { this.ctx = ctx.getApplicationContext(); }

    /** Démarre le serveur (idempotent). Renvoie l'URL locale ou "" si pas de réseau. */
    public synchronized String start() {
        if (!running) {
            try {
                server = new ServerSocket(PORT);
                pool = Executors.newFixedThreadPool(6);
                running = true;
                Thread t = new Thread(() -> {
                    while (running) {
                        try {
                            Socket s = server.accept();
                            pool.execute(() -> handle(s));
                        } catch (IOException e) { /* serveur fermé */ }
                    }
                });
                t.setDaemon(true);
                t.start();
            } catch (IOException e) {
                running = false;
                return "";
            }
        }
        String ip = localIp();
        return ip == null ? "" : ("http://" + ip + ":" + PORT + "/");
    }

    public synchronized void stop() {
        running = false;
        try { if (server != null) server.close(); } catch (IOException ignored) {}
        if (pool != null) pool.shutdownNow();
        server = null; pool = null;
    }

    public boolean isRunning() { return running; }

    /** IPv4 locale (192.168.x en priorité), null si aucune. */
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
                    if (ip.startsWith("192.168.")) return ip;   // Wi-Fi / hotspot classique
                    if (candidate == null && a.isSiteLocalAddress()) candidate = ip;
                }
            }
        } catch (Exception ignored) {}
        return candidate;
    }

    private void handle(Socket sock) {
        try (Socket s = sock;
             BufferedReader in = new BufferedReader(new InputStreamReader(s.getInputStream(), StandardCharsets.UTF_8));
             OutputStream out = s.getOutputStream()) {
            String line = in.readLine();
            if (line == null) return;
            String[] parts = line.split(" ");
            if (parts.length < 2 || !"GET".equals(parts[0])) { plain(out, 405, "Methode non permise"); return; }
            String path = parts[1];
            int q = path.indexOf('?'); if (q >= 0) path = path.substring(0, q);
            // vider les en-têtes
            String h; while ((h = in.readLine()) != null && !h.isEmpty()) { /* skip */ }
            // normaliser
            if (path.equals("/")) path = "/index.html";
            if (path.contains("..")) { plain(out, 403, "Interdit"); return; }
            String asset = "www" + path;
            AssetManager am = ctx.getAssets();
            InputStream is;
            try { is = am.open(asset); }
            catch (IOException e) { plain(out, 404, "Introuvable"); return; }
            byte[] body = readAll(is);
            String head = "HTTP/1.1 200 OK\r\n"
                    + "Content-Type: " + mime(path) + "\r\n"
                    + "Content-Length: " + body.length + "\r\n"
                    + "Cache-Control: no-cache\r\n"
                    + "Access-Control-Allow-Origin: *\r\n"
                    + "Connection: close\r\n\r\n";
            out.write(head.getBytes(StandardCharsets.UTF_8));
            out.write(body);
            out.flush();
        } catch (IOException ignored) {}
    }

    private static byte[] readAll(InputStream is) throws IOException {
        java.io.ByteArrayOutputStream bo = new java.io.ByteArrayOutputStream();
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
