package com.aragon.launcher.model;

import java.util.List;

public class Manifest {
    private Latest latest;
    private List<FileEntry> files;
    
    public Latest getLatest() {
        return latest;
    }
    
    public void setLatest(Latest latest) {
        this.latest = latest;
    }
    
    public List<FileEntry> getFiles() {
        return files;
    }
    
    public void setFiles(List<FileEntry> files) {
        this.files = files;
    }
    
    public FileEntry getFileForOS(String os) {
        if (files == null) return null;
        return files.stream()
            .filter(f -> os.equals(f.getOs()))
            .findFirst()
            .orElse(null);
    }
    
    public static class Latest {
        private String standalone;
        private String windows;
        private String macos;
        private String linux;
        
        public String getStandalone() {
            return standalone;
        }
        
        public void setStandalone(String standalone) {
            this.standalone = standalone;
        }
        
        public String getWindows() {
            return windows;
        }
        
        public void setWindows(String windows) {
            this.windows = windows;
        }
        
        public String getMacos() {
            return macos;
        }
        
        public void setMacos(String macos) {
            this.macos = macos;
        }
        
        public String getLinux() {
            return linux;
        }
        
        public void setLinux(String linux) {
            this.linux = linux;
        }
        
        public String getVersionForOS(String os) {
            return switch (os) {
                case "windows" -> windows;
                case "macos" -> macos;
                case "linux" -> linux;
                default -> standalone;
            };
        }
    }
    
    public static class FileEntry {
        private String os;
        private String version;
        private String url;
        private long size;
        private String hash;
        private String changelog;
        
        public String getOs() {
            return os;
        }
        
        public void setOs(String os) {
            this.os = os;
        }
        
        public String getVersion() {
            return version;
        }
        
        public void setVersion(String version) {
            this.version = version;
        }
        
        public String getUrl() {
            return url;
        }
        
        public void setUrl(String url) {
            this.url = url;
        }
        
        public long getSize() {
            return size;
        }
        
        public void setSize(long size) {
            this.size = size;
        }
        
        public String getHash() {
            return hash;
        }
        
        public void setHash(String hash) {
            this.hash = hash;
        }
        
        public String getChangelog() {
            return changelog;
        }
        
        public void setChangelog(String changelog) {
            this.changelog = changelog;
        }
    }
}
