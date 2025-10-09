# Aragon Launcher - Build Instructions

This guide will help you build the Aragon RSPS Launcher on your local machine and create native installers for Windows, macOS, and Linux.

---

## 📋 Prerequisites

Before building, ensure you have the following installed on your machine:

### Required Software:

1. **JDK 17 or higher** (with JavaFX and jpackage)
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Or use OpenJDK: https://adoptium.net/
   - Verify installation: `java -version` and `javac -version`

2. **Maven 3.6+**
   - Download from: https://maven.apache.org/download.cgi
   - Verify installation: `mvn -version`

3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/downloads

### Platform-Specific Requirements:

#### Windows:
- **WiX Toolset 3.11+** (for creating .exe installer)
  - Download from: https://github.com/wixtoolset/wix3/releases
  - Add to PATH

#### macOS:
- **Xcode Command Line Tools**
  - Install: `xcode-select --install`

#### Linux:
- **fakeroot and rpm** (for .deb and .rpm packages)
  - Ubuntu/Debian: `sudo apt install fakeroot rpm`
  - Fedora/RHEL: `sudo dnf install fakeroot rpm-build`

---

## 🚀 Quick Start

### 1. Download the Project

Download or clone this repository to your local machine.

### 2. Add Your Branding Images

Place your logo and icon files in the resources directory:

```
src/main/resources/images/
├── logo.png       (Your game logo, displayed in launcher)
└── icon.png       (Application icon for shortcuts)
```

**Recommended sizes:**
- `logo.png`: 400x150px or larger (transparent PNG)
- `icon.png`: 256x256px or larger (PNG with transparent background)

### 3. Configure Your Manifest URL

Edit `src/main/java/com/aragon/launcher/util/Config.java`:

```java
public static final String MANIFEST_URL = "https://cdn.aragonrsps.com/manifest.json";
```

Change this to point to your actual manifest URL.

---

## 🔨 Building the Launcher

### Option A: Using Build Scripts (Recommended)

#### Windows:
```batch
cd aragon-launcher
build-scripts\build-windows.bat
```

#### macOS:
```bash
cd aragon-launcher
chmod +x build-scripts/build-macos.sh
./build-scripts/build-macos.sh
```

#### Linux:
```bash
cd aragon-launcher
chmod +x build-scripts/build-linux.sh
./build-scripts/build-linux.sh
```

### Option B: Manual Build

#### Step 1: Build the JAR
```bash
mvn clean package
```

This creates `target/aragon-launcher-1.0.0.jar`

#### Step 2: Create Custom JRE
```bash
jlink --add-modules java.base,java.desktop,java.logging,java.naming,java.sql,javafx.controls,javafx.fxml,javafx.graphics --output build/runtime
```

#### Step 3: Prepare Build Directory
```bash
mkdir -p build/input
cp target/aragon-launcher-1.0.0.jar build/input/launcher.jar
```

#### Step 4: Create Installer

**Windows (.exe):**
```batch
jpackage ^
  --input build\input ^
  --main-jar launcher.jar ^
  --main-class com.aragon.launcher.Main ^
  --runtime-image build\runtime ^
  --name "Aragon Launcher" ^
  --app-version 1.0.0 ^
  --vendor "Aragon Studios" ^
  --icon src\main\resources\images\icon.png ^
  --type exe ^
  --win-menu ^
  --win-shortcut ^
  --win-dir-chooser ^
  --dest build\installers
```

**macOS (.dmg):**
```bash
jpackage \
  --input build/input \
  --main-jar launcher.jar \
  --main-class com.aragon.launcher.Main \
  --runtime-image build/runtime \
  --name "Aragon Launcher" \
  --app-version 1.0.0 \
  --vendor "Aragon Studios" \
  --icon src/main/resources/images/icon.png \
  --type dmg \
  --dest build/installers
```

**Linux (.deb):**
```bash
jpackage \
  --input build/input \
  --main-jar launcher.jar \
  --main-class com.aragon.launcher.Main \
  --runtime-image build/runtime \
  --name "aragon-launcher" \
  --app-version 1.0.0 \
  --vendor "Aragon Studios" \
  --icon src/main/resources/images/icon.png \
  --type deb \
  --dest build/installers
```

---

## 📦 Build Output

After building, you'll find your installer in:

```
build/installers/
├── Aragon Launcher-1.0.0.exe       (Windows)
├── Aragon Launcher-1.0.0.dmg       (macOS)
└── aragon-launcher_1.0.0-1_amd64.deb  (Linux)
```

### Installer Details:

**Windows:**
- Creates Start Menu and Desktop shortcuts
- Installs to: `C:\Users\<username>\AppData\Local\Aragon Launcher\`
- Includes uninstaller in Add/Remove Programs

**macOS:**
- Creates .app bundle
- Installs to: `/Applications/`
- User data: `~/Library/Application Support/AragonLauncher/`

**Linux:**
- Creates .desktop entry for application menu
- Installs to: `/opt/aragon-launcher/`
- User data: `~/.config/AragonLauncher/`

---

## 🧪 Testing the Launcher

### Run Without Building Installer:

```bash
mvn javafx:run
```

This launches the JavaFX application directly for testing.

### Test with Custom Manifest:

Create a test `manifest.json` file on a local web server:

```json
{
  "latest": {
    "standalone": "0.1.0",
    "windows": "0.1.0"
  },
  "files": [
    {
      "os": "standalone",
      "version": "0.1.0",
      "url": "http://localhost:8000/client.jar",
      "size": 1024000,
      "hash": "your-sha256-hash-here",
      "changelog": "Initial release"
    }
  ]
}
```

Update `Config.MANIFEST_URL` to point to your test server.

---

## 🎨 Customization

### Change Theme Colors:

Edit `src/main/resources/css/launcher.css` to modify the red/black theme:

```css
.launcher-root {
    -fx-background-color: linear-gradient(to bottom, #1a0000, #000000);
}

.play-button {
    -fx-background-color: linear-gradient(to bottom, #CC0000, #8B0000);
}
```

### Change Default JVM Arguments:

Edit `src/main/java/com/aragon/launcher/util/Config.java`:

```java
private String jvmArgs = "-Xmx2G -Xms512M";
```

### Modify Launcher Version:

Update in two places:

1. `src/main/java/com/aragon/launcher/util/Config.java`:
   ```java
   public static final String LAUNCHER_VERSION = "1.0.0";
   ```

2. `pom.xml`:
   ```xml
   <version>1.0.0</version>
   ```

---

## 🔧 Troubleshooting

### Error: "jpackage not found"
- Make sure you're using JDK 17+
- Verify: `jpackage --version`
- jpackage is included in JDK 16+

### Error: "JavaFX runtime components are missing"
- Ensure JavaFX dependencies are in `pom.xml`
- Run: `mvn dependency:resolve`

### Error: "WiX Toolset not found" (Windows)
- Download WiX 3.11+ from GitHub
- Add WiX bin folder to system PATH
- Restart terminal after installation

### Build succeeds but installer doesn't work:
- Check that `icon.png` and `logo.png` exist in resources
- Verify manifest URL is accessible
- Check file permissions on build scripts

### Client won't launch:
- Verify `client.jar` exists at the path specified in manifest
- Check JVM arguments in settings
- Review logs in: `%AppData%/AragonLauncher/logs/` (Windows)

---

## 📝 Manifest JSON Format

Your web server should host a `manifest.json` file with this structure:

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
      "hash": "sha256-hash-of-file",
      "changelog": "Bug fixes and improvements"
    },
    {
      "os": "windows",
      "version": "1.0.0",
      "url": "https://cdn.example.com/client-windows.jar",
      "size": 4100000,
      "hash": "sha256-hash-of-file",
      "changelog": "Windows-specific optimizations"
    }
  ]
}
```

### Generating SHA-256 Hashes:

**Windows (PowerShell):**
```powershell
Get-FileHash -Algorithm SHA256 client.jar
```

**macOS/Linux:**
```bash
shasum -a 256 client.jar
```

---

## 🚢 Distribution

### Uploading to Your CDN:

1. Build the installer for each platform
2. Upload installers to your website or CDN
3. Provide download links to users
4. Update `manifest.json` when releasing new client versions

### Recommended File Structure:

```
https://cdn.aragonrsps.com/
├── manifest.json
├── launchers/
│   ├── AragonLauncher-Windows-1.0.0.exe
│   ├── AragonLauncher-macOS-1.0.0.dmg
│   └── AragonLauncher-Linux-1.0.0.deb
└── clients/
    ├── client-1.0.0.jar
    ├── client-1.0.1.jar
    └── ...
```

---

## 📚 Additional Resources

- **JavaFX Documentation**: https://openjfx.io/
- **jpackage Guide**: https://docs.oracle.com/en/java/javase/17/jpackage/
- **Maven Documentation**: https://maven.apache.org/guides/

---

## ✅ Checklist Before First Build

- [ ] JDK 17+ installed and in PATH
- [ ] Maven 3.6+ installed
- [ ] WiX Toolset installed (Windows only)
- [ ] Logo and icon images added to resources
- [ ] Manifest URL configured in Config.java
- [ ] Test manifest.json created and accessible
- [ ] Test client.jar created and uploaded
- [ ] Build script permissions set (chmod +x on Linux/macOS)

---

## 🎉 Success!

Once built, your launcher will:
- ✅ Auto-update the game client when new versions are released
- ✅ Verify file integrity with SHA-256 hashing
- ✅ Bundle Java runtime (no user installation needed)
- ✅ Create desktop shortcuts and Start Menu entries
- ✅ Minimize to system tray
- ✅ Allow custom JVM arguments
- ✅ Work offline after initial download

Your players can now enjoy a professional, auto-updating launcher experience just like major games!
