#!/bin/bash

echo "Building macOS Installer with macOS JRE only..."
echo ""

# Backup other JRE folders temporarily
if [ -d "src-tauri/resources/jre/windows" ]; then
    echo "Temporarily moving Windows JRE..."
    mv "src-tauri/resources/jre/windows" "src-tauri/resources/jre/windows.tmp"
fi

if [ -d "src-tauri/resources/jre/linux" ]; then
    echo "Temporarily moving Linux JRE..."
    mv "src-tauri/resources/jre/linux" "src-tauri/resources/jre/linux.tmp"
fi

echo ""
echo "Building installer..."
npm run tauri:build

# Restore other JRE folders
if [ -d "src-tauri/resources/jre/windows.tmp" ]; then
    echo "Restoring Windows JRE..."
    mv "src-tauri/resources/jre/windows.tmp" "src-tauri/resources/jre/windows"
fi

if [ -d "src-tauri/resources/jre/linux.tmp" ]; then
    echo "Restoring Linux JRE..."
    mv "src-tauri/resources/jre/linux.tmp" "src-tauri/resources/jre/linux"
fi

echo ""
echo "macOS installer built successfully!"
echo "Location: src-tauri/target/release/bundle/dmg/"
