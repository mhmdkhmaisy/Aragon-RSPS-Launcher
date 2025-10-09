package com.aragon.launcher.service;

import com.aragon.launcher.model.Manifest;
import com.aragon.launcher.util.Config;
import com.aragon.launcher.util.HashUtil;
import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.function.Consumer;

public class UpdateService {
    private static final Logger logger = LoggerFactory.getLogger(UpdateService.class);
    private static final Gson gson = new Gson();
    private static final int BUFFER_SIZE = 8192;
    
    private volatile boolean cancelled = false;
    
    public Manifest fetchRemoteManifest() throws IOException {
        logger.info("Fetching manifest from {}", Config.MANIFEST_URL);
        URL url = new URL(Config.MANIFEST_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(10000);
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            Manifest manifest = gson.fromJson(reader, Manifest.class);
            logger.info("Successfully fetched remote manifest");
            return manifest;
        }
    }
    
    public Manifest loadLocalManifest() {
        Path manifestPath = Config.getManifestFile();
        if (!Files.exists(manifestPath)) {
            logger.info("No local manifest found");
            return null;
        }
        
        try (FileReader reader = new FileReader(manifestPath.toFile())) {
            Manifest manifest = gson.fromJson(reader, Manifest.class);
            logger.info("Loaded local manifest");
            return manifest;
        } catch (IOException e) {
            logger.error("Failed to load local manifest", e);
            return null;
        }
    }
    
    public void saveLocalManifest(Manifest manifest) throws IOException {
        Path manifestPath = Config.getManifestFile();
        try (FileWriter writer = new FileWriter(manifestPath.toFile())) {
            gson.toJson(manifest, writer);
            logger.info("Saved local manifest");
        }
    }
    
    public boolean checkForUpdates(Manifest remote, Manifest local) {
        if (local == null) {
            logger.info("No local manifest, update required");
            return true;
        }
        
        String os = getOSIdentifier();
        String remoteVersion = remote.getLatest().getVersionForOS(os);
        String localVersion = local.getLatest().getVersionForOS(os);
        
        boolean updateAvailable = !remoteVersion.equals(localVersion);
        logger.info("Remote version: {}, Local version: {}, Update available: {}", 
            remoteVersion, localVersion, updateAvailable);
        
        return updateAvailable;
    }
    
    public void downloadFile(Manifest.FileEntry file, Consumer<DownloadProgress> progressCallback) throws IOException {
        cancelled = false;
        Path clientPath = Config.getClientJar();
        Path tempPath = Config.getCacheDir().resolve("client.jar.tmp");
        
        logger.info("Downloading {} to {}", file.getUrl(), clientPath);
        
        URL url = new URL(file.getUrl());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        
        long totalSize = file.getSize();
        long downloaded = 0;
        long startTime = System.currentTimeMillis();
        
        try (InputStream in = new BufferedInputStream(conn.getInputStream());
             FileOutputStream out = new FileOutputStream(tempPath.toFile())) {
            
            byte[] buffer = new byte[BUFFER_SIZE];
            int bytesRead;
            
            while ((bytesRead = in.read(buffer)) != -1 && !cancelled) {
                out.write(buffer, 0, bytesRead);
                downloaded += bytesRead;
                
                if (progressCallback != null) {
                    long elapsed = System.currentTimeMillis() - startTime;
                    double speed = elapsed > 0 ? (downloaded / 1024.0) / (elapsed / 1000.0) : 0;
                    int progress = (int) ((downloaded * 100) / totalSize);
                    long eta = speed > 0 ? (long) ((totalSize - downloaded) / 1024.0 / speed) : 0;
                    
                    progressCallback.accept(new DownloadProgress(progress, downloaded, totalSize, speed, eta));
                }
            }
        }
        
        if (cancelled) {
            Files.deleteIfExists(tempPath);
            throw new IOException("Download cancelled");
        }
        
        String downloadedHash = HashUtil.sha256(tempPath.toFile());
        if (!downloadedHash.equalsIgnoreCase(file.getHash())) {
            Files.deleteIfExists(tempPath);
            throw new IOException("Hash mismatch! Expected: " + file.getHash() + ", Got: " + downloadedHash);
        }
        
        Files.move(tempPath, clientPath, StandardCopyOption.REPLACE_EXISTING);
        logger.info("Download complete and verified");
    }
    
    public void cancel() {
        cancelled = true;
    }
    
    public static String getOSIdentifier() {
        String os = System.getProperty("os.name").toLowerCase();
        if (os.contains("win")) {
            return "windows";
        } else if (os.contains("mac")) {
            return "macos";
        } else if (os.contains("nix") || os.contains("nux")) {
            return "linux";
        }
        return "standalone";
    }
    
    public static class DownloadProgress {
        private final int percentage;
        private final long downloaded;
        private final long total;
        private final double speed;
        private final long eta;
        
        public DownloadProgress(int percentage, long downloaded, long total, double speed, long eta) {
            this.percentage = percentage;
            this.downloaded = downloaded;
            this.total = total;
            this.speed = speed;
            this.eta = eta;
        }
        
        public int getPercentage() {
            return percentage;
        }
        
        public long getDownloaded() {
            return downloaded;
        }
        
        public long getTotal() {
            return total;
        }
        
        public double getSpeed() {
            return speed;
        }
        
        public long getEta() {
            return eta;
        }
        
        public String getFormattedSize() {
            return formatBytes(downloaded) + " / " + formatBytes(total);
        }
        
        public String getFormattedSpeed() {
            return String.format("%.2f KB/s", speed);
        }
        
        public String getFormattedETA() {
            if (eta < 60) {
                return eta + "s";
            } else {
                return (eta / 60) + "m " + (eta % 60) + "s";
            }
        }
        
        private static String formatBytes(long bytes) {
            if (bytes < 1024) return bytes + " B";
            if (bytes < 1024 * 1024) return String.format("%.2f KB", bytes / 1024.0);
            return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
        }
    }
}
