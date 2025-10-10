# Aragon Launcher - Build Instructions

## Prerequisites

1. **Rust** - Install from https://rustup.rs/
2. **Node.js** - v18 or higher
3. **OpenJDK 11** - For each target platform

## JRE Setup

The launcher bundles platform-specific JRE (OpenJDK 11) with each installer:

### Directory Structure
```
src-tauri/
  resources/
    jre/
      windows/    # Windows OpenJDK 11
      linux/      # Linux OpenJDK 11  
      macos/      # macOS OpenJDK 11
```

### Adding JRE to Resources

1. **Download OpenJDK 11** for your target platform(s):
   - Windows: https://adoptium.net/temurin/releases/?version=11&os=windows&arch=x64
   - Linux: https://adoptium.net/temurin/releases/?version=11&os=linux&arch=x64
   - macOS: https://adoptium.net/temurin/releases/?version=11&os=mac&arch=x64

2. **Extract and place in resources**:
   - Extract the JRE/JDK
   - Copy the entire JRE folder to `src-tauri/resources/jre/{platform}/`
   - Ensure `bin/java.exe` (Windows) or `bin/java` (Linux/macOS) exists

## Configuration

### For Local Testing

Edit `src-tauri/src/main.rs`:
```rust
const MANIFEST_URL: &str = "http://127.0.0.1:8000/manifest.json";
const BASE_URL: &str = "http://127.0.0.1:8000";
```

### For Production

Edit `src-tauri/src/main.rs`:
```rust
const MANIFEST_URL: &str = "https://cdn.aragonrsps.com/manifest.json";
const BASE_URL: &str = "https://cdn.aragonrsps.com";
```

## Building

### Development Mode
```bash
npm install
npm run tauri:dev
```

### Production Build

**Important:** Use the platform-specific build scripts to create smaller installers with only the necessary JRE.

#### Windows Installer (.msi)
```bash
npm install
build-windows.bat
```
Output: `src-tauri/target/release/bundle/msi/Aragon Launcher_1.0.0_x64_en-US.msi`

**What it does:**
- Temporarily moves macOS and Linux JRE folders
- Builds installer with only Windows JRE
- Restores other JRE folders after build

#### macOS Installer (.dmg)
```bash
npm install
chmod +x build-macos.sh
./build-macos.sh
```
Output: `src-tauri/target/release/bundle/dmg/Aragon Launcher_1.0.0_x64.dmg`

**What it does:**
- Temporarily moves Windows and Linux JRE folders
- Builds installer with only macOS JRE
- Restores other JRE folders after build

#### Linux Installer (.deb / .AppImage)
```bash
npm install
chmod +x build-linux.sh
./build-linux.sh
```
Output: 
- `src-tauri/target/release/bundle/deb/aragon-launcher_1.0.0_amd64.deb`
- `src-tauri/target/release/bundle/appimage/aragon-launcher_1.0.0_amd64.AppImage`

**What it does:**
- Temporarily moves Windows and macOS JRE folders
- Builds installer with only Linux JRE
- Restores other JRE folders after build

## Build Features

✅ **OS-Specific JRE Bundling**
- Windows installer only includes Windows JRE
- macOS installer only includes macOS JRE
- Linux installer only includes Linux JRE

✅ **Automatic JRE Detection**
- Launcher uses bundled OpenJDK 11 first
- Falls back to system Java if bundled JRE not found

✅ **Update System**
- Downloads from `BASE_URL/download/{os}/{version}`
- Verifies SHA256 hash
- Saves to launcher executable directory

## Manifest Structure

Your CDN should serve a manifest at `https://cdn.aragonrsps.com/manifest.json`:

```json
{
  "latest": {
    "standalone": "0.1.1"
  },
  "files": [
    {
      "os": "standalone",
      "version": "0.1.1",
      "size": 9162738,
      "hash": "602991de7bd94f72652b7a6970cd0ae13607d13b85918a68f8d78edb838b9ca0",
      "changelog": null
    }
  ]
}
```

The launcher will construct the download URL as:
`https://cdn.aragonrsps.com/download/standalone/0.1.1`

## Testing Production Build

1. Build the installer for your platform
2. Install the application
3. Verify bundled JRE is used (check logs for "Found bundled JRE at: ...")
4. Test update download from production CDN
5. Test launching the client JAR with bundled JRE

## Troubleshooting

**JRE Not Found:**
- Verify JRE structure: `resources/jre/{platform}/bin/java[.exe]`
- Check console logs for JRE detection messages

**Download Fails:**
- Verify manifest URL is accessible
- Check download URL pattern matches your CDN

**Hash Mismatch:**
- Recalculate SHA256 hash: `sha256sum client.jar`
- Update manifest.json with correct hash
