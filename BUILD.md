# Aragon Launcher - Tauri Build Guide

A lightweight, modern desktop launcher for Aragon RSPS built with Tauri (Rust + Web Technologies).

---

## 🎯 What is Tauri?

Tauri lets you build **tiny, fast desktop apps** using:
- **Frontend**: HTML, CSS, JavaScript (the UI you see)
- **Backend**: Rust (handles updates, downloads, launching the game)
- **Result**: ~3-5MB installers vs 150MB+ with Electron!

---

## ✨ Key Features

- 🎨 **Modern Web UI** - Preview in browser during development
- 🚀 **Lightweight** - Only ~3-5MB installers
- 🔄 **Auto-Update System** - SHA-256 verified downloads
- ⚙️ **Configurable** - JVM args, settings panel
- 📦 **Native Installers** - .exe, .dmg, .deb packages
- 🔒 **Secure** - Rust backend with minimal attack surface

---

## 📋 Prerequisites

### For UI Development & Preview (Works in Replit!)
- **Node.js 18+** and **npm** (or use Replit's environment)
- That's it! You can preview the UI without Rust

### For Building Desktop Installers (Local Machine)
- **Node.js 18+** and **npm**
- **Rust 1.70+** - [Install from rustup.rs](https://rustup.rs/)
- **Platform-specific tools**:
  - **Windows**: [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: `build-essential`, `libwebkit2gtk-4.0-dev`, etc.

---

## 🚀 Quick Start

### Option 1: Preview UI in Replit (or Browser)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Then open the preview in Replit or visit `http://localhost:5000`

**Note**: In browser mode, it simulates the launcher behavior. The actual game launching only works in the desktop build.

---

### Option 2: Run Full Desktop App (Local Machine)

```bash
# Install dependencies
npm install

# Run in development mode with Tauri
npm run tauri:dev
```

This opens the actual desktop application with Rust backend.

---

## 🔨 Building Installers

### Step 1: Configure Your Manifest URL

Edit `src-tauri/src/main.rs`, line ~110:

```rust
const MANIFEST_URL: &str = "https://cdn.aragonrsps.com/manifest.json";
```

Change to your actual CDN URL.

### Step 2: Build for Your Platform

```bash
# Build for current platform
npm run tauri:build
```

**Output locations:**
- **Windows**: `src-tauri/target/release/bundle/msi/Aragon Launcher_1.0.0_x64_en-US.msi`
- **macOS**: `src-tauri/target/release/bundle/dmg/Aragon Launcher_1.0.0_x64.dmg`
- **Linux**: `src-tauri/target/release/bundle/deb/aragon-launcher_1.0.0_amd64.deb`

---

## 📦 Platform-Specific Build Instructions

### Windows

**Prerequisites:**
1. Install [Rust](https://rustup.rs/)
2. Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
3. Install [Node.js 18+](https://nodejs.org/)

**Build:**
```powershell
npm install
npm run tauri:build
```

**Output**: `src-tauri\target\release\bundle\msi\Aragon Launcher_1.0.0_x64_en-US.msi`

---

### macOS

**Prerequisites:**
1. Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Install Xcode Command Line Tools: `xcode-select --install`
3. Install Node.js 18+

**Build:**
```bash
npm install
npm run tauri:build
```

**Output**: `src-tauri/target/release/bundle/dmg/Aragon Launcher_1.0.0_x64.dmg`

---

### Linux (Ubuntu/Debian)

**Prerequisites:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install dependencies
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Build:**
```bash
npm install
npm run tauri:build
```

**Output**: `src-tauri/target/release/bundle/deb/aragon-launcher_1.0.0_amd64.deb`

---

## 🎨 Customization

### Change Theme Colors

Edit `src/styles.css`:

```css
/* Change red theme to blue */
.play-button {
    background: linear-gradient(to bottom, #0066CC, #004C99);
    border: 2px solid #0080FF;
}

.progress-fill {
    background: linear-gradient(to right, #004C99, #0080FF);
}
```

### Update Manifest URL

Edit `src-tauri/src/main.rs`:

```rust
const MANIFEST_URL: &str = "https://your-cdn.com/manifest.json";
```

### Change Default JVM Args

Edit `src-tauri/src/main.rs`:

```rust
impl Default for Config {
    fn default() -> Self {
        Self {
            jvm_args: "-Xmx4G -Xms1G".to_string(), // 4GB max memory
            minimize_to_tray: true,
            auto_update: true,
        }
    }
}
```

### Replace Logo/Icon

Replace files in `public/` directory:
- `public/logo.png` - Main logo (displayed in launcher)
- `public/icon.png` - App icon (for shortcuts)

---

## 📖 Manifest Format

Host a `manifest.json` file on your CDN:

```json
{
  "latest": {
    "standalone": "1.0.0",
    "windows": "1.0.0",
    "macos": "1.0.0",
    "linux": "1.0.0"
  },
  "files": [
    {
      "os": "standalone",
      "version": "1.0.0",
      "url": "https://cdn.example.com/client.jar",
      "size": 4094821,
      "hash": "sha256-hash-here",
      "changelog": "Initial release"
    }
  ]
}
```

### Generate SHA-256 Hash:

**Windows (PowerShell):**
```powershell
Get-FileHash -Algorithm SHA256 client.jar | Select-Object -ExpandProperty Hash
```

**macOS/Linux:**
```bash
shasum -a 256 client.jar | awk '{print $1}'
```

---

## 🔧 Development Workflow

### 1. UI Development (Can do in Replit!)

```bash
npm run dev
```

Preview at `http://localhost:5000` - works in Replit preview pane!

### 2. Desktop Testing (Local only)

```bash
npm run tauri:dev
```

Opens actual desktop app with full functionality.

### 3. Build for Release

```bash
npm run tauri:build
```

Creates installer in `src-tauri/target/release/bundle/`.

---

## 🐛 Troubleshooting

### "error: failed to run custom build command for `tauri`"
- Make sure Rust is installed: `rustc --version`
- Update Rust: `rustup update`

### "webkit2gtk not found" (Linux)
```bash
sudo apt install libwebkit2gtk-4.0-dev
```

### "Command 'tauri' not found"
```bash
npm install
# Tauri CLI should be in node_modules
```

### UI shows but "invoke" errors appear
- You're in browser preview mode
- Download and run `npm run tauri:dev` for full functionality

### Client won't launch
- Verify Java is installed on the system
- Check `client.jar` exists in config directory
- Review console logs for errors

---

## 📁 Project Structure

```
aragon-launcher/
├── src/                    # Frontend (Web UI)
│   ├── main.js            # Main JavaScript logic
│   └── styles.css         # Styling (red/black theme)
├── src-tauri/             # Backend (Rust)
│   ├── src/
│   │   └── main.rs        # Rust backend logic
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── public/                # Static assets
│   ├── logo.png
│   └── icon.png
├── index.html             # Main HTML
├── package.json           # Node dependencies
└── vite.config.js         # Vite config
```

---

## 📊 Size Comparison

| Framework | Installer Size | Memory Usage |
|-----------|---------------|--------------|
| **Tauri** | ~3-5 MB | ~50-80 MB |
| Electron | ~150 MB | ~200-300 MB |
| JavaFX | ~60 MB | ~100-150 MB |

---

## 🚢 Distribution

### Upload to CDN

1. Build installer: `npm run tauri:build`
2. Upload to your website/CDN
3. Provide download links to users

### Auto-Update Setup

When users run the launcher, it:
1. Checks `manifest.json` for new version
2. Downloads `client.jar` if needed
3. Verifies SHA-256 hash
4. Launches game with configured JVM args

---

## ✅ Pre-Build Checklist

- [ ] Rust installed (`rustc --version`)
- [ ] Node.js installed (`node --version`)
- [ ] Platform build tools installed
- [ ] Logo/icon added to `public/`
- [ ] Manifest URL configured in `main.rs`
- [ ] Tested in dev mode (`npm run tauri:dev`)
- [ ] Test `manifest.json` accessible
- [ ] Test `client.jar` download working

---

## 🎉 Success!

Your Tauri launcher is:
- ✅ 20x smaller than Electron
- ✅ Faster and more secure
- ✅ Auto-updating
- ✅ Professional looking
- ✅ Preview-able in Replit!

Enjoy building your lightweight launcher! 🚀
