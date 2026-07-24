package com.mediagrab.app;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.SslErrorHandler;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.io.File;

public class MainActivity extends Activity {

    private WebView webView;
    private ProgressBar progressBar;
    private static final String APP_URL = "https://dowload-videos.onrender.com";
    private static final String FOLDER_NAME = "Midia Download LK";

    private BroadcastReceiver downloadCompleteReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(action)) {
                long downloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (downloadId != -1) {
                    // Trigger Android Gallery MediaScan so video immediately appears in Gallery album
                    File folder = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), FOLDER_NAME);
                    if (folder.exists()) {
                        MediaScannerConnection.scanFile(context,
                                new String[]{folder.getAbsolutePath()},
                                null,
                                (path, uri) -> {
                                    // Media scanned into Gallery album
                                });
                    }

                    Toast.makeText(getApplicationContext(),
                            "🎉 Download concluído! Abra na Galeria (Pasta: Mídia Download LK)",
                            Toast.LENGTH_LONG).show();
                }
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register download complete receiver
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(downloadCompleteReceiver,
                    new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                    Context.RECEIVER_EXPORTED);
        } else {
            registerReceiver(downloadCompleteReceiver,
                    new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
        }

        // Fullscreen immersive + dark status bar
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#0F172A"));
            window.setNavigationBarColor(Color.parseColor("#0F172A"));
        }

        // Root layout
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0F172A"));

        // WebView
        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#0F172A"));
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));

        // Loading progress bar at top
        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setProgress(0);
        FrameLayout.LayoutParams barParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, 6);
        root.addView(progressBar, barParams);

        setContentView(root);

        // Hardware acceleration & Layer optimization for super smooth performance
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // -- Optimized Ultra-Fast WebView Settings --
        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setAllowContentAccess(true);
        ws.setJavaScriptCanOpenWindowsAutomatically(false);
        ws.setUseWideViewPort(true);
        ws.setLoadWithOverviewMode(true);
        ws.setSupportZoom(false);
        ws.setBuiltInZoomControls(false);
        ws.setDisplayZoomControls(false);
        ws.setRenderPriority(WebSettings.RenderPriority.HIGH);
        ws.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK); // Aggressive cache for instant load
        ws.setMediaPlaybackRequiresUserGesture(false);

        // Force Chrome Mobile user-agent so the site renders CSS/JS identically
        ws.setUserAgentString(
                "Mozilla/5.0 (Linux; Android 14; Pixel 8) " +
                "AppleWebKit/537.36 (KHTML, like Gecko) " +
                "Chrome/124.0.0.0 Mobile Safari/537.36");

        // Allow mixed content & third-party cookies
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }

        // WebChromeClient — handles progress bar and JS features
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress < 100 ? View.VISIBLE : View.GONE);
            }
        });

        // WebViewClient — keeps all navigation inside the app
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.proceed();
            }
        });

        // Background Download listener — delegates file downloads to Android's native system DownloadManager
        // Downloads continue seamlessly in the background even if the app is closed!
        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent,
                    String contentDisposition, String mimeType, long contentLength) {
                try {
                    DownloadManager.Request request =
                            new DownloadManager.Request(Uri.parse(url));
                    request.setMimeType(mimeType);

                    String cookies = CookieManager.getInstance().getCookie(url);
                    if (cookies != null) {
                        request.addRequestHeader("cookie", cookies);
                    }
                    request.addRequestHeader("User-Agent", userAgent);

                    String filename = URLUtil.guessFileName(url, contentDisposition, mimeType);
                    request.setTitle(filename);
                    request.setDescription("Baixando m\u00eddia em segundo plano...");
                    
                    // Show background progress in Android notification bar & notify upon completion
                    request.setNotificationVisibility(
                            DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);

                    // Save directly into custom Galeria folder: "Movies/Midia Download LK"
                    String subPath = FOLDER_NAME + File.separator + filename;
                    request.setDestinationInExternalPublicDir(
                            Environment.DIRECTORY_MOVIES, subPath);

                    // Allow background downloading over Mobile Data & Wi-Fi
                    request.setAllowedOverMetered(true);
                    request.setAllowedOverRoaming(true);

                    DownloadManager dm =
                            (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    if (dm != null) {
                        long id = dm.enqueue(request);
                        Toast.makeText(getApplicationContext(),
                                "📥 Download iniciado em segundo plano! Acompanhe na notificação.",
                                Toast.LENGTH_LONG).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(getApplicationContext(),
                            "Erro ao iniciar download: " + e.getMessage(),
                            Toast.LENGTH_SHORT).show();
                }
            }
        });

        // Load the site
        webView.loadUrl(APP_URL);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            unregisterReceiver(downloadCompleteReceiver);
        } catch (Exception e) {
            // Unregistered
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
