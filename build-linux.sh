#!/bin/bash

echo "Building Linux Installer with Linux JRE only..."
echo ""

# Backup other JRE folders temporarily
if [ -d "src-tauri/resources/jre/macos" ]; then
    echo "Temporarily moving macOS JRE..."
    mv "src-tauri/resources/jre/macos" "src-tauri/resources/jre/macos.tmp"
fi

if [ -d "src-tauri/resources/jre/windows" ]; then
    echo "Temporarily moving Windows JRE..."
    mv "src-tauri/resources/jre/windows" "src-tauri/resources/jre/windows.tmp"
fi

echo ""
echo "Building installer..."
npm run tauri:build

# Restore other JRE folders
if [ -d "src-tauri/resources/jre/macos.tmp" ]; then
    echo "Restoring macOS JRE..."
    mv "src-tauri/resources/jre/macos.tmp" "src-tauri/resources/jre/macos"
fi

if [ -d "src-tauri/resources/jre/windows.tmp" ]; then
    echo "Restoring Windows JRE..."
    mv "src-tauri/resources/jre/windows.tmp" "src-tauri/resources/jre/windows"
fi

echo ""
echo "Linux installer built successfully!"
echo "Location: src-tauri/target/release/bundle/deb/ and src-tauri/target/release/bundle/appimage/"
