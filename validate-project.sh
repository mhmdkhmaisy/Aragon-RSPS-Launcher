#!/bin/bash

echo "=========================================="
echo "Aragon Launcher - Project Validation"
echo "=========================================="
echo ""
echo "This is a JavaFX desktop application that must be built locally."
echo "Replit does not support graphical JavaFX applications."
echo ""
echo "📋 Project Status:"
echo ""

# Check Java version
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    echo "✓ Java detected: $JAVA_VERSION"
else
    echo "✗ Java not found in this environment"
fi

# Check Maven
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -version 2>&1 | head -n 1)
    echo "✓ Maven detected: $MVN_VERSION"
else
    echo "✗ Maven not found in this environment"
fi

echo ""
echo "📁 Project Structure:"
echo ""

# Validate key files
files=(
    "pom.xml"
    "src/main/java/com/aragon/launcher/Main.java"
    "src/main/java/com/aragon/launcher/ui/LauncherController.java"
    "src/main/java/com/aragon/launcher/service/UpdateService.java"
    "src/main/java/com/aragon/launcher/service/ClientLauncher.java"
    "src/main/java/com/aragon/launcher/util/Config.java"
    "src/main/java/com/aragon/launcher/util/HashUtil.java"
    "src/main/java/com/aragon/launcher/model/Manifest.java"
    "src/main/resources/css/launcher.css"
    "build-scripts/build-windows.bat"
    "build-scripts/build-macos.sh"
    "build-scripts/build-linux.sh"
    "BUILD.md"
    "README.md"
)

missing_files=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ MISSING: $file"
        ((missing_files++))
    fi
done

echo ""
if [ $missing_files -eq 0 ]; then
    echo "✅ All source files present!"
else
    echo "⚠️  $missing_files file(s) missing"
fi

echo ""
echo "📦 Next Steps:"
echo ""
echo "1. Download this entire project to your local machine"
echo "2. Install JDK 17+ with JavaFX on your computer"
echo "3. Install Maven 3.6+ on your computer"
echo "4. Add your logo/icon images to src/main/resources/images/"
echo "5. Update the manifest URL in Config.java"
echo "6. Run the build script for your platform:"
echo "   - Windows: build-scripts\\build-windows.bat"
echo "   - macOS:   ./build-scripts/build-macos.sh"
echo "   - Linux:   ./build-scripts/build-linux.sh"
echo ""
echo "📖 For detailed instructions, see BUILD.md"
echo ""
echo "=========================================="
