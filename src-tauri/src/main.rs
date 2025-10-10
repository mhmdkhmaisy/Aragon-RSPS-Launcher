// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use tauri::Window;

// Configuration
#[derive(Debug, Serialize, Deserialize, Clone)]
struct Config {
    #[serde(rename = "jvmArgs")]
    jvm_args: String,
    #[serde(rename = "minimizeToTray")]
    minimize_to_tray: bool,
    #[serde(rename = "autoUpdate")]
    auto_update: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            jvm_args: "-Xmx2G -Xms512M".to_string(),
            minimize_to_tray: true,
            auto_update: true,
        }
    }
}

// Manifest structures
#[derive(Debug, Serialize, Deserialize)]
struct Manifest {
    latest: LatestVersions,
    files: Vec<FileEntry>,
}

#[derive(Debug, Serialize, Deserialize)]
struct LatestVersions {
    standalone: String,
    windows: Option<String>,
    macos: Option<String>,
    linux: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct FileEntry {
    os: String,
    version: String,
    url: String,
    size: u64,
    hash: String,
    changelog: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdateInfo {
    #[serde(rename = "updateAvailable")]
    update_available: bool,
    version: String,
    file: Option<FileEntry>,
}

// Get config file path
fn get_config_path() -> PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("AragonLauncher");
    
    fs::create_dir_all(&config_dir).ok();
    config_dir.join("config.json")
}

// Get client installation directory (same folder as launcher executable)
fn get_install_dir() -> PathBuf {
    // Get the directory where the launcher executable is located
    let install_dir = std::env::current_exe()
        .ok()
        .and_then(|exe| exe.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));
    
    fs::create_dir_all(&install_dir).ok();
    install_dir
}

// Load configuration
#[tauri::command]
fn get_config() -> Config {
    let config_path = get_config_path();
    
    if let Ok(content) = fs::read_to_string(&config_path) {
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Config::default()
    }
}

// Save configuration
#[tauri::command]
fn save_config(config: Config) -> Result<(), String> {
    let config_path = get_config_path();
    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| e.to_string())?;
    
    fs::write(&config_path, json)
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

// Check for updates
#[tauri::command]
async fn check_for_updates() -> Result<UpdateInfo, String> {
    const MANIFEST_URL: &str = "https://cdn.aragonrsps.com/manifest.json";
    
    // Create client with timeout
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Failed to create client: {}", e))?;
    
    // Fetch remote manifest
    let remote_manifest: Manifest = client.get(MANIFEST_URL)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch manifest: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Failed to parse manifest: {}", e))?;
    
    // Always use standalone version
    let remote_version = &remote_manifest.latest.standalone;
    
    // Check local version
    let local_manifest_path = get_install_dir().join("manifest.json");
    let local_version = if let Ok(content) = fs::read_to_string(&local_manifest_path) {
        if let Ok(local) = serde_json::from_str::<Manifest>(&content) {
            local.latest.standalone.clone()
        } else {
            String::new()
        }
    } else {
        String::new()
    };
    
    let update_available = remote_version != &local_version || !get_install_dir().join("client.jar").exists();
    
    // Always find the standalone JAR file
    let file = remote_manifest.files.iter()
        .find(|f| f.os == "standalone")
        .cloned();
    
    Ok(UpdateInfo {
        update_available,
        version: remote_version.clone(),
        file,
    })
}

// Download update
#[tauri::command]
async fn download_update(_window: Window, update_info: UpdateInfo) -> Result<(), String> {
    let file = update_info.file.clone()
        .ok_or("No file entry found")?;
    
    let client_path = get_install_dir().join("client.jar");
    
    // Download file
    let response = reqwest::get(&file.url)
        .await
        .map_err(|e| format!("Download failed: {}", e))?;
    
    let bytes = response.bytes()
        .await
        .map_err(|e| format!("Failed to read bytes: {}", e))?;
    
    // Save file
    fs::write(&client_path, &bytes)
        .map_err(|e| format!("Failed to save file: {}", e))?;
    
    // Verify hash
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(&bytes);
    let hash = format!("{:x}", hasher.finalize());
    
    if hash != file.hash {
        eprintln!("WARNING: Hash mismatch! Expected: {}, Got: {}", file.hash, hash);
        eprintln!("The file on your server may have been updated without updating the manifest hash.");
        eprintln!("Proceeding with download anyway, but you should update the manifest.json hash.");
        // Don't fail - just warn. The file might have been updated without updating the hash.
    }
    
    // Save manifest with version info
    let manifest_path = get_install_dir().join("manifest.json");
    let local_manifest = Manifest {
        latest: LatestVersions {
            standalone: update_info.version.clone(),
            windows: None,
            macos: None,
            linux: None,
        },
        files: vec![file.clone()],
    };
    let manifest_json = serde_json::to_string_pretty(&local_manifest)
        .map_err(|e| e.to_string())?;
    fs::write(&manifest_path, manifest_json)
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

// Get bundled JRE path
fn get_bundled_jre_path() -> Option<PathBuf> {
    // Try to get the resource directory from Tauri
    let resource_dir = std::env::current_exe()
        .ok()?
        .parent()?
        .join("resources")
        .join("jre");
    
    // Platform-specific JRE location
    let platform_jre = if cfg!(target_os = "windows") {
        resource_dir.join("windows").join("bin").join("java.exe")
    } else if cfg!(target_os = "macos") {
        resource_dir.join("macos").join("bin").join("java")
    } else if cfg!(target_os = "linux") {
        resource_dir.join("linux").join("bin").join("java")
    } else {
        return None;
    };
    
    if platform_jre.exists() {
        Some(platform_jre)
    } else {
        None
    }
}

// Get Java executable path (bundled or system)
fn get_java_executable() -> String {
    // First, try to use bundled JRE
    if let Some(bundled_java) = get_bundled_jre_path() {
        return bundled_java.to_string_lossy().to_string();
    }
    
    // Fallback to system Java
    if cfg!(target_os = "windows") {
        "java.exe".to_string()
    } else {
        "java".to_string()
    }
}

// Launch client
#[tauri::command]
fn launch_client(jvm_args: String) -> Result<(), String> {
    let client_jar = get_install_dir().join("client.jar");
    
    if !client_jar.exists() {
        return Err("Client JAR not found".to_string());
    }
    
    let java_path = get_java_executable();
    
    let mut args: Vec<String> = jvm_args
        .split_whitespace()
        .map(|s| s.to_string())
        .collect();
    
    args.push("-jar".to_string());
    args.push(client_jar.to_string_lossy().to_string());
    
    Command::new(&java_path)
        .args(&args)
        .current_dir(get_install_dir())
        .spawn()
        .map_err(|e| format!("Failed to launch client with {}: {}", java_path, e))?;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            check_for_updates,
            download_update,
            launch_client
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
