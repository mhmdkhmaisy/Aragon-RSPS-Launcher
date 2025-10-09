#!/bin/bash
# Aragon Launcher - Linux Build Script
# This script builds the Linux AppImage using jpackage

set -e

echo "========================================"
echo "Building Aragon Launcher for Linux"
echo "========================================"

# Step 1: Clean and build with Maven
echo ""
echo "[1/4] Building JAR with Maven..."
mvn clean package

# Step 2: Create custom JRE
echo ""
echo "[2/4] Creating custom JRE with jlink..."
rm -rf build/runtime
jlink --add-modules java.base,java.desktop,java.logging,java.naming,java.sql,javafx.controls,javafx.fxml,javafx.graphics --output build/runtime

# Step 3: Prepare build directory
echo ""
echo "[3/4] Preparing build directory..."
mkdir -p build/input
cp target/aragon-launcher-1.0.0.jar build/input/launcher.jar

# Step 4: Create Linux package
echo ""
echo "[4/4] Creating Linux package with jpackage..."
jpackage \
  --input build/input \
  --main-jar launcher.jar \
  --main-class com.aragon.launcher.Main \
  --runtime-image build/runtime \
  --name "aragon-launcher" \
  --app-version 1.0.0 \
  --vendor "Aragon Studios" \
  --icon src/main/resources/images/icon.png \
  --type app-image \
  --dest build/installers

echo ""
echo "========================================"
echo "BUILD SUCCESSFUL!"
echo "========================================"
echo "Application created: build/installers/aragon-launcher/"
echo ""
echo "To create a .deb package, run:"
echo "jpackage --type deb ..."
echo ""
echo "To create a .rpm package, run:"
echo "jpackage --type rpm ..."
echo ""
