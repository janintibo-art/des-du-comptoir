package com.comptoir.des;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.WindowManager;
import android.view.View;
import android.content.ActivityNotFoundException;
import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/** Coquille WebView : sert l'app web depuis les assets via une origine https sûre. */
public class MainActivity extends Activity {
    private WebView webView;
    private static final String BASE = "https://appassets.androidplatform.net/assets/www/";

    /** comptoir://salon -> salon.html (pages sûres uniquement) */
    private String pageFromIntent(Intent intent) {
        if (intent == null) return null;
        Uri d = intent.getData();
        if (d == null || !"comptoir".equals(d.getScheme())) return null;
        String h = d.getHost();
        if ("salon".equals(h) || "regles".equals(h) || "stats".equals(h) || "reglages".equals(h)) return h + ".html";
        return null;
    }

    /** Pont JS : window.AndroidApp.shareApk() partage l'application installée. */
    public class AppBridge {
        @JavascriptInterface
        public void shareApk() {
            try {
                File src = new File(getApplicationInfo().sourceDir);
                File dir = new File(getCacheDir(), "partage");
                dir.mkdirs();
                File out = new File(dir, "des-du-comptoir.apk");
                try (InputStream in = new FileInputStream(src);
                     OutputStream os = new FileOutputStream(out)) {
                    byte[] buf = new byte[65536];
                    int n;
                    while ((n = in.read(buf)) > 0) os.write(buf, 0, n);
                }
                Uri uri = FileProvider.getUriForFile(
                        MainActivity.this, getPackageName() + ".fileprovider", out);
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("application/vnd.android.package-archive");
                i.putExtra(Intent.EXTRA_STREAM, uri);
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(Intent.createChooser(i, "Partager Les Dés du Comptoir"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Quitter le thème splash dès que l'activité démarre
        setTheme(android.R.style.Theme_NoTitleBar_Fullscreen);
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        webView = new WebView(this);
        webView.setBackgroundColor(0xFF14140F);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // La navigation interne du jeu passe par l'origine locale sécurisée :
                if (url.startsWith("https://appassets.androidplatform.net/")) return false;
                // Tout lien externe (http, mailto, tel...) s'ouvre dans l'app appropriée :
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl()));
                } catch (ActivityNotFoundException e) { /* ignoré */ }
                return true;
            }
        });

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);   // mémorisation du skin (localStorage)
        s.setMediaPlaybackRequiresUserGesture(false);

        webView.addJavascriptInterface(new AppBridge(), "AndroidApp");

        setContentView(webView);
        String page = pageFromIntent(getIntent());
        webView.loadUrl(BASE + (page != null ? page : "index.html"));
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String page = pageFromIntent(intent);
        if (page != null && webView != null) webView.loadUrl(BASE + page);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // Plein écran immersif : barres système masquées, réaffichées d'un glissement
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
