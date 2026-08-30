package com.rekomendify.desamulyosari;

import android.Manifest;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

import org.json.JSONObject;

/**
 * App Shell native layer.
 *
 * Prinsip: "native capability stays native, business logic stays on the website".
 * Activity ini HANYA menjembatani permission Android <-> WebView dan menyediakan
 * aksi "Muat Ulang". Tidak ada business logic Rekomendify di sini.
 */
public class MainActivity extends BridgeActivity {

    /** Hanya origin ini yang boleh memperoleh akses hardware / bridge. */
    private static final String TRUSTED_HOST_SUFFIX = "rekomendify.com";

    private static final int REQ_CAMERA = 9101;
    private static final int REQ_LOCATION = 9102;
    private static final int REQ_NOTIFICATIONS = 9103;

    private static final String PREFS = "shell_permissions";
    private static final String KEY_NOTIF_ASKED = "notifications_requested";

    /** Request WebView kamera yang sedang menunggu hasil runtime permission. */
    @Nullable
    private PermissionRequest pendingCameraRequest;

    /** Callback geolocation WebView yang sedang menunggu hasil runtime permission. */
    @Nullable
    private GeolocationPermissions.Callback pendingGeoCallback;
    @Nullable
    private String pendingGeoOrigin;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        // Geolocation WebView harus diaktifkan; permission sebenarnya tetap
        // diputuskan lewat runtime permission Android di bawah.
        webView.getSettings().setGeolocationEnabled(true);
        webView.setWebChromeClient(new ShellWebChromeClient());
        webView.addJavascriptInterface(new ShellBridge(), "AndroidShell");

        registerBackHandler();
    }

    // ---------------------------------------------------------------- back ---

    /**
     * Android Back: mundur bila ada history. Bila tidak ada history, tampilkan
     * pilihan "Muat Ulang" atau "Keluar" (bukan overlay permanen di atas UI web).
     */
    private void registerBackHandler() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge().getWebView();
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    showShellMenu();
                }
            }
        });
    }

    private void showShellMenu() {
        new AlertDialog.Builder(this)
                .setTitle("Desa Mulyosari")
                .setMessage("Muat ulang aplikasi atau keluar?")
                .setPositiveButton("🔄 Muat Ulang", (dialog, which) -> reloadWebView())
                .setNegativeButton("Keluar", (dialog, which) -> finish())
                .setNeutralButton("Batal", (dialog, which) -> dialog.dismiss())
                .show();
    }

    /**
     * Reload = setara refresh browser. Tidak menghapus cookie, storage, IndexedDB,
     * maupun cache, dan tidak memuat ulang App Shell (URL saat ini dipertahankan),
     * sehingga tidak mungkin memicu ulang startup redirect / infinite reload.
     */
    private void reloadWebView() {
        runOnUiThread(() -> getBridge().getWebView().reload());
    }

    // ------------------------------------------------------- chrome client ---

    private class ShellWebChromeClient extends BridgeWebChromeClient {
        ShellWebChromeClient() {
            super(getBridge());
        }

        @Override
        public void onPermissionRequest(final PermissionRequest request) {
            if (!isTrustedOrigin(request.getOrigin() == null ? null : request.getOrigin().toString())) {
                runOnUiThread(request::deny);
                return;
            }

            boolean wantsCamera = false;
            for (String resource : request.getResources()) {
                if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                    wantsCamera = true;
                }
            }

            if (!wantsCamera) {
                // Resource lain (mis. mikrofon) tidak dibutuhkan fitur existing.
                runOnUiThread(request::deny);
                return;
            }

            runOnUiThread(() -> {
                if (hasPermission(Manifest.permission.CAMERA)) {
                    // Grant HANYA resource kamera, bukan seluruh request.
                    request.grant(new String[] { PermissionRequest.RESOURCE_VIDEO_CAPTURE });
                    return;
                }
                pendingCameraRequest = request;
                ActivityCompat.requestPermissions(
                        MainActivity.this, new String[] { Manifest.permission.CAMERA }, REQ_CAMERA);
            });
        }

        @Override
        public void onPermissionRequestCanceled(PermissionRequest request) {
            pendingCameraRequest = null;
            super.onPermissionRequestCanceled(request);
        }

        @Override
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
            if (!isTrustedOrigin(origin)) {
                callback.invoke(origin, false, false);
                return;
            }
            if (hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)
                    || hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION)) {
                callback.invoke(origin, true, false);
                return;
            }
            pendingGeoCallback = callback;
            pendingGeoOrigin = origin;
            ActivityCompat.requestPermissions(MainActivity.this, new String[] {
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
            }, REQ_LOCATION);
        }
    }

    // -------------------------------------------------- permission results ---

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] results) {
        boolean granted = false;
        for (int result : results) {
            if (result == PackageManager.PERMISSION_GRANTED) granted = true;
        }

        if (requestCode == REQ_CAMERA) {
            PermissionRequest request = pendingCameraRequest;
            pendingCameraRequest = null;
            if (request != null) {
                if (granted) {
                    request.grant(new String[] { PermissionRequest.RESOURCE_VIDEO_CAPTURE });
                } else {
                    request.deny();
                }
            }
            return;
        }

        if (requestCode == REQ_LOCATION) {
            GeolocationPermissions.Callback callback = pendingGeoCallback;
            String origin = pendingGeoOrigin;
            pendingGeoCallback = null;
            pendingGeoOrigin = null;
            if (callback != null) {
                callback.invoke(origin, granted, false);
            }
            return;
        }

        if (requestCode == REQ_NOTIFICATIONS) {
            // Hasil tidak perlu diproses: halaman web membaca ulang status.
            return;
        }

        super.onRequestPermissionsResult(requestCode, permissions, results);
    }

    // -------------------------------------------------------------- bridge ---

    /**
     * Bridge minimal untuk halaman "Privasi & Izin" dan aksi Muat Ulang.
     * Semua metode diproteksi oleh pemeriksaan origin.
     */
    public class ShellBridge {

        /** {"platform":"android","notifications":"granted|denied|prompt","camera":...,"location":...} */
        @JavascriptInterface
        public String getPermissionStatus() {
            if (!isTrustedCaller()) return "{}";
            try {
                JSONObject json = new JSONObject();
                json.put("platform", "android");
                json.put("camera", state(Manifest.permission.CAMERA, false));
                json.put("location", hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)
                        || hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION)
                        ? "granted" : state(Manifest.permission.ACCESS_FINE_LOCATION, false));
                json.put("notifications", notificationState());
                return json.toString();
            } catch (Exception e) {
                return "{}";
            }
        }

        @JavascriptInterface
        public void requestCameraPermission() {
            if (!isTrustedCaller() || hasPermission(Manifest.permission.CAMERA)) return;
            runOnUiThread(() -> ActivityCompat.requestPermissions(
                    MainActivity.this, new String[] { Manifest.permission.CAMERA }, REQ_CAMERA));
        }

        @JavascriptInterface
        public void requestLocationPermission() {
            if (!isTrustedCaller()) return;
            if (hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)
                    || hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION)) return;
            runOnUiThread(() -> ActivityCompat.requestPermissions(MainActivity.this, new String[] {
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
            }, REQ_LOCATION));
        }

        /**
         * Diminta HANYA saat fitur notifikasi benar-benar diaktifkan user.
         * Jika user sudah pernah menolak, tidak ada prompt native lagi —
         * user diarahkan ke pengaturan sistem.
         */
        @JavascriptInterface
        public void requestNotificationPermission() {
            if (!isTrustedCaller()) return;
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return;
            if (hasPermission(Manifest.permission.POST_NOTIFICATIONS)) return;

            SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
            boolean askedBefore = prefs.getBoolean(KEY_NOTIF_ASKED, false);
            boolean canPrompt = ActivityCompat.shouldShowRequestPermissionRationale(
                    MainActivity.this, Manifest.permission.POST_NOTIFICATIONS);

            if (askedBefore && !canPrompt) {
                openAppSettings();
                return;
            }
            prefs.edit().putBoolean(KEY_NOTIF_ASKED, true).apply();
            runOnUiThread(() -> ActivityCompat.requestPermissions(MainActivity.this,
                    new String[] { Manifest.permission.POST_NOTIFICATIONS }, REQ_NOTIFICATIONS));
        }

        @JavascriptInterface
        public void openAppSettings() {
            if (!isTrustedCaller()) return;
            MainActivity.this.openAppSettings();
        }

        @JavascriptInterface
        public void reload() {
            if (!isTrustedCaller()) return;
            reloadWebView();
        }
    }

    private void openAppSettings() {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", getPackageName(), null));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    private String notificationState() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            return NotificationManagerCompat.from(this).areNotificationsEnabled() ? "granted" : "denied";
        }
        if (hasPermission(Manifest.permission.POST_NOTIFICATIONS)) return "granted";
        return state(Manifest.permission.POST_NOTIFICATIONS,
                getSharedPreferences(PREFS, MODE_PRIVATE).getBoolean(KEY_NOTIF_ASKED, false));
    }

    /** "granted" / "denied" (sudah pernah diminta) / "prompt" (belum pernah diminta). */
    private String state(String permission, boolean askedBefore) {
        if (hasPermission(permission)) return "granted";
        if (askedBefore || ActivityCompat.shouldShowRequestPermissionRationale(this, permission)) {
            return "denied";
        }
        return "prompt";
    }

    private boolean hasPermission(String permission) {
        return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED;
    }

    private boolean isTrustedCaller() {
        return isTrustedOrigin(getBridge().getWebView().getUrl());
    }

    private boolean isTrustedOrigin(@Nullable String url) {
        if (url == null) return false;
        try {
            Uri uri = Uri.parse(url);
            String host = uri.getHost();
            if (host == null) return false;
            if (!"https".equalsIgnoreCase(uri.getScheme())) return false;
            return host.equals(TRUSTED_HOST_SUFFIX) || host.endsWith("." + TRUSTED_HOST_SUFFIX);
        } catch (Exception e) {
            return false;
        }
    }
}
