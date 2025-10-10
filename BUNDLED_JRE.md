# Bundling JRE with Aragon Launcher

This guide explains how to bundle OpenJDK 11 (or any JRE) with your Tauri launcher so users **don't need Java installed**.

---

## ✅ Why Bundle JRE?

**Without bundled JRE:**
- ❌ Users must install Java separately
- ❌ Version conflicts (user has wrong Java version)
- ❌ Additional setup friction

**With bundled JRE:**
- ✅ Works out-of-the-box, no Java needed
- ✅ Guaranteed correct Java version
- ✅ Professional user experience

**Trade-off:** Installer size increases by ~40-80MB (still smaller than JavaFX launcher!)

---

## 📥 Step 1: Download Portable JRE

Download **OpenJDK 11 JRE** (not JDK) for each platform:

### Windows JRE
```
https://adoptium.net/temurin/releases/?version=11&os=windows&arch=x64&package=jre
```
Download: **JRE zip archive** (not installer)

### macOS JRE
```
https://adoptium.net/temurin/releases/?version=11&os=mac&arch=x64&package=jre
```
Download: **JRE tar.gz archive**

### Linux JRE
```
https://adoptium.net/temurin/releases/?version=11&os=linux&arch=x64&package=jre
```
Download: **JRE tar.gz archive**

---

## 📁 Step 2: Create JRE Directory Structure

In your project root, create:

```
aragon-launcher/
└── src-tauri/
    └── resources/
        └── jre/
            ├── windows/
            │   ├── bin/
            │   │   └── java.exe
            │   ├── lib/
            │   └── ...
            ├── macos/
            │   ├── bin/
            │   │   └── java
            │   ├── lib/
            │   └── ...
            └── linux/
                ├── bin/
                │   └── java
                ├── lib/
                └── ...
```

### Extract JRE Files

**Windows:**
1. Extract `OpenJDK11U-jre_x64_windows_hotspot_*.zip`
2. Copy the contents to `src-tauri/resources/jre/windows/`

**macOS:**
1. Extract `OpenJDK11U-jre_x64_mac_hotspot_*.tar.gz`
2. Navigate into the `.jre` folder (e.g., `jdk-11.0.XX.jre`)
3. Copy `Contents/Home/*` to `src-tauri/resources/jre/macos/`

**Linux:**
1. Extract `OpenJDK11U-jre_x64_linux_hotspot_*.tar.gz`
2. Copy the contents to `src-tauri/resources/jre/linux/`

---

## ⚙️ Step 3: Verify Configuration

The launcher is **already configured** to use bundled JRE! Check these files:

### ✅ `src-tauri/tauri.conf.json`
```json
{
  "bundle": {
    "resources": [
      "resources/jre/*"
    ]
  }
}
```

### ✅ `src-tauri/src/main.rs`
The code automatically:
1. Looks for bundled JRE first
2. Falls back to system Java if not found

---

## 🏗️ Step 4: Build Installer

Once JRE files are in place:

```bash
npm run tauri:build
```

### Expected Installer Sizes

| Platform | Without JRE | With JRE |
|----------|------------|----------|
| Windows | ~5 MB | ~50 MB |
| macOS | ~3 MB | ~45 MB |
| Linux | ~4 MB | ~60 MB |

**Still much smaller than:**
- JavaFX + jpackage: ~100-150 MB
- Electron apps: ~150-200 MB

---

## 🧪 Step 5: Test Bundled JRE

### Test on Clean System (No Java)

1. Find a computer **without Java installed**
2. Install your launcher
3. Launch the game
4. It should work without asking for Java!

### Verify Bundled JRE is Used

The launcher will log which Java it's using. Check the error message if launch fails - it will show the Java path.

---

## 🔄 Alternative: Download JRE on First Launch

If you don't want to bundle JRE (to keep installer tiny), you can download it automatically:

### Auto-Download Approach

1. Check if Java exists on first launch
2. If not, download portable JRE from your CDN
3. Extract to launcher directory
4. Use that JRE going forward

**Pros:**
- Tiny initial installer (~3-5 MB)
- Still provides Java automatically

**Cons:**
- Requires internet on first launch
- Extra complexity

---

## 📊 Recommendation

### Bundle JRE if:
- ✅ You want **zero setup** for users
- ✅ 50MB installer is acceptable
- ✅ You have bandwidth for larger downloads

### Don't bundle if:
- ❌ Installer size is critical (< 10MB)
- ❌ Most users already have Java
- ❌ You can provide Java separately

---

## 🐛 Troubleshooting

### "java.exe not found" error

**Check:**
1. JRE files are in `src-tauri/resources/jre/`
2. Path structure is correct (`windows/bin/java.exe`)
3. Files are not corrupted
4. Build completed successfully

### Installer size too large

**Optimize JRE:**
```bash
# Use jlink to create minimal JRE (if you control the client)
jlink --add-modules java.base,java.desktop --output minimal-jre
```

This can reduce JRE from 80MB to ~40MB.

### Different OS needs different JRE

The launcher **automatically** selects the right JRE:
- Windows → `resources/jre/windows/bin/java.exe`
- macOS → `resources/jre/macos/bin/java`
- Linux → `resources/jre/linux/bin/java`

---

## ✅ Summary

1. **Download** portable JRE for each platform (Adoptium recommended)
2. **Extract** to `src-tauri/resources/jre/{platform}/`
3. **Build** with `npm run tauri:build`
4. **Distribute** installers - users don't need Java!

Your launcher now provides a **completely self-contained experience** like professional games!

---

## 📝 Example Directory Structure

```
src-tauri/
└── resources/
    └── jre/
        ├── windows/
        │   ├── bin/
        │   │   ├── java.exe       ← Main executable
        │   │   ├── javaw.exe
        │   │   └── ...
        │   ├── lib/
        │   │   ├── modules
        │   │   └── ...
        │   └── legal/
        ├── macos/
        │   ├── bin/
        │   │   └── java           ← Main executable
        │   ├── lib/
        │   └── ...
        └── linux/
            ├── bin/
            │   └── java           ← Main executable
            ├── lib/
            └── ...
```

---

**That's it!** Your users can now install and play without touching Java. 🎉
