package com.aragon.launcher.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Config {
    private static final Logger logger = LoggerFactory.getLogger(Config.class);
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    
    public static final String LAUNCHER_VERSION = "1.0.0";
    public static final String MANIFEST_URL = "https://cdn.aragonrsps.com/manifest.json";
    
    private static final String APP_NAME = "AragonLauncher";
    private static Path installDir;
    private static Path configFile;
    
    private String jvmArgs = "-Xmx2G -Xms512M";
    private boolean minimizeToTray = true;
    private boolean autoUpdate = true;
    private String lastVersion = "";
    
    static {
        initializeDirectories();
    }
    
    private static void initializeDirectories() {
        String os = System.getProperty("os.name").toLowerCase();
        String userHome = System.getProperty("user.home");
        
        if (os.contains("win")) {
            installDir = Paths.get(System.getenv("APPDATA"), APP_NAME);
        } else if (os.contains("mac")) {
            installDir = Paths.get(userHome, "Library", "Application Support", APP_NAME);
        } else {
            installDir = Paths.get(userHome, ".config", APP_NAME);
        }
        
        try {
            Files.createDirectories(installDir);
            Files.createDirectories(installDir.resolve("cache"));
            Files.createDirectories(installDir.resolve("logs"));
            configFile = installDir.resolve("config.json");
            logger.info("Install directory: {}", installDir);
        } catch (IOException e) {
            logger.error("Failed to create directories", e);
        }
    }
    
    public static Path getInstallDir() {
        return installDir;
    }
    
    public static Path getClientJar() {
        return installDir.resolve("client.jar");
    }
    
    public static Path getManifestFile() {
        return installDir.resolve("manifest.json");
    }
    
    public static Path getCacheDir() {
        return installDir.resolve("cache");
    }
    
    public static Config load() {
        if (Files.exists(configFile)) {
            try (FileReader reader = new FileReader(configFile.toFile())) {
                Config config = gson.fromJson(reader, Config.class);
                logger.info("Loaded config from {}", configFile);
                return config;
            } catch (IOException e) {
                logger.warn("Failed to load config, using defaults", e);
            }
        }
        return new Config();
    }
    
    public void save() {
        try (FileWriter writer = new FileWriter(configFile.toFile())) {
            gson.toJson(this, writer);
            logger.info("Saved config to {}", configFile);
        } catch (IOException e) {
            logger.error("Failed to save config", e);
        }
    }
    
    public String getJvmArgs() {
        return jvmArgs;
    }
    
    public void setJvmArgs(String jvmArgs) {
        this.jvmArgs = jvmArgs;
    }
    
    public boolean isMinimizeToTray() {
        return minimizeToTray;
    }
    
    public void setMinimizeToTray(boolean minimizeToTray) {
        this.minimizeToTray = minimizeToTray;
    }
    
    public boolean isAutoUpdate() {
        return autoUpdate;
    }
    
    public void setAutoUpdate(boolean autoUpdate) {
        this.autoUpdate = autoUpdate;
    }
    
    public String getLastVersion() {
        return lastVersion;
    }
    
    public void setLastVersion(String lastVersion) {
        this.lastVersion = lastVersion;
    }
}
