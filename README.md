# Aragon RSPS Launcher (Tauri Edition)

A **lightweight, modern desktop launcher** for Aragon RuneScape Private Server built with Tauri.

![Aragon Logo](public/logo.png)

---

## ✨ Features

- 🎨 **Modern Web UI** - Built with HTML/CSS/JavaScript
- 🚀 **Ultra Lightweight** - Only ~3-5MB installers (vs 150MB+ Electron!)
- 🔄 **Auto-Updates** - Checks manifest, downloads client updates automatically
- 🔒 **Secure** - SHA-256 file verification, Rust backend
- ⚙️ **Configurable** - Custom JVM arguments, settings panel
- 📦 **Cross-Platform** - Windows, macOS, Linux installers
- 🖥️ **Preview in Browser** - Develop UI in Replit or any browser!

---

## 🎯 Why Tauri?

| Feature | Tauri | Electron | JavaFX |
|---------|-------|----------|--------|
| **Installer Size** | ~3-5 MB | ~150 MB | ~60 MB |
| **Memory Usage** | 50-80 MB | 200-300 MB | 100-150 MB |
| **Tech Stack** | Web + Rust | Web + Node | Java |
| **Browser Preview** | ✅ Yes | ❌ No | ❌ No |

---

## 🚀 Quick Start

### Option 1: Preview UI (Works in Replit!)

```bash
npm install
npm run dev
```

Open preview at `http://localhost:5000` - No Rust needed!

### Option 2: Run Desktop App (Local Machine)

**Prerequisites**: [Rust](https://rustup.rs/) + [Node.js](https://nodejs.org/)

```bash
npm install
npm run tauri:dev
```

### Option 3: Build Installer

```bash
npm install
npm run tauri:build
```

Find installer in `src-tauri/target/release/bundle/`

---

## 📋 Requirements

### For UI Development (Replit):
- ✅ Node.js 18+
- ✅ npm

### For Desktop Build (Local):
- ✅ Rust 1.70+ ([rustup.rs](https://rustup.rs/))
- ✅ Node.js 18+
- ✅ Platform-specific build tools (see [BUILD.md](BUILD.md))

### For End Users (After Installation):
- ✅ **No requirements!** The launcher can bundle JRE
- ⚠️ Or Java 11+ if you don't bundle JRE

---

## 📖 Documentation

- **[BUILD.md](BUILD.md)** - Complete build instructions for all platforms
- **[BUNDLED_JRE.md](BUNDLED_JRE.md)** - How to bundle Java with the launcher (no Java install needed!)
- **[Tauri Docs](https://tauri.app/)** - Official Tauri documentation

---

## 🎨 Customization

### Change Theme
Edit `src/styles.css` to modify the red/black color scheme.

### Update Manifest URL
Edit `src-tauri/src/main.rs`:
```rust
const MANIFEST_URL: &str = "https://cdn.aragonrsps.com/manifest.json";
```

### Replace Logo
- `public/logo.png` - Main launcher logo
- `public/icon.png` - Application icon

---

## 📁 Project Structure

```
aragon-launcher/
├── src/              # Frontend (Web UI)
│   ├── main.js      # JavaScript logic
│   └── styles.css   # Styling
├── src-tauri/       # Backend (Rust)
│   └── src/
│       └── main.rs  # Launcher logic
├── public/          # Assets (logo, icon)
├── index.html       # Main HTML
└── package.json     # Dependencies
```

---

## 🔧 How It Works

### Update Flow:
1. Launcher starts → Checks `manifest.json` on your CDN
2. Compares remote version with local version
3. Downloads `client.jar` if update available
4. Verifies SHA-256 hash for security
5. Launches game with configured JVM arguments

### Manifest Format:
```json
{
  "latest": {
    "standalone": "1.0.0"
  },
  "files": [
    {
      "os": "standalone",
      "version": "1.0.0",
      "url": "https://cdn.example.com/client.jar",
      "size": 4094821,
      "hash": "sha256-hash",
      "changelog": "Initial release"
    }
  ]
}
```

---

## 🌐 Browser Preview Mode

When you run `npm run dev`, the launcher works in **preview mode**:
- ✅ Full UI visible and interactive
- ✅ Settings work and save to localStorage
- ✅ Simulates update checking and download progress
- ⚠️ Game launching shows info alert (desktop-only feature)

This lets you develop and preview the UI without needing Rust installed!

---

## 📦 Distribution

### Build Installers:
```bash
npm run tauri:build
```

### Installers Created:
- **Windows**: `.msi` installer with shortcuts
- **macOS**: `.dmg` drag-to-Applications
- **Linux**: `.deb` package

### Upload to CDN:
1. Host installer files on your website
2. Provide download links to players
3. Launcher auto-updates game client via manifest

---

## 🛠️ Development

### Run Development Server:
```bash
npm run dev
```
Preview UI at http://localhost:5000

### Run Desktop App (with Rust backend):
```bash
npm run tauri:dev
```

### Build Production:
```bash
npm run tauri:build
```

---

## 🐛 Troubleshooting

### UI works but features don't?
You're in browser preview mode. Download and run `npm run tauri:dev` for full functionality.

### "Rust not found" error?
Install Rust from [rustup.rs](https://rustup.rs/)

### Build fails on Linux?
Install webkit2gtk: `sudo apt install libwebkit2gtk-4.0-dev`

### More help?
See [BUILD.md](BUILD.md) for detailed troubleshooting.

---

## 📊 Advantages Over JavaFX

| Feature | Tauri | JavaFX |
|---------|-------|--------|
| **Replit Preview** | ✅ Yes | ❌ No |
| **Size** | 3-5 MB | 60 MB |
| **Tech Stack** | Modern Web | Java |
| **Development** | Edit HTML/CSS | Java + FXML |
| **UI Preview** | Instant browser | Needs JDK |

---

## 🎉 Get Started

1. **Develop UI in Replit**: `npm run dev`
2. **Download project locally** when ready
3. **Install Rust** on your machine
4. **Build installer**: `npm run tauri:build`
5. **Distribute to players!**

Your players get a **professional, auto-updating launcher** that's smaller and faster than the competition!

---

## 📝 License

Built for Aragon RSPS. Modify and distribute as needed for your server.

---

## 🔗 Resources

- [Tauri Documentation](https://tauri.app/)
- [Rust Installation](https://rustup.rs/)
- [Vite Documentation](https://vitejs.dev/)

---

**Made with ❤️ for Aragon RSPS**
