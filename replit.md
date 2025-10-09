# Aragon RSPS Launcher

## Overview

Aragon RSPS Launcher is a professional desktop application for launching and auto-updating the Aragon RuneScape Private Server client. Built with JavaFX, it provides a native installer experience across Windows, macOS, and Linux platforms. The launcher handles automatic client updates through manifest-based differential downloads with SHA-256 verification, eliminating the need for users to manually manage game files.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 9, 2025** - Initial launcher implementation completed
- Created complete JavaFX launcher application with full source code
- Implemented manifest-based auto-update system with SHA-256 verification
- Built custom red/black themed UI matching Aragon branding
- Added download progress tracking with speed and ETA display
- Implemented client launcher with configurable JVM arguments
- Created settings panel with system tray integration support
- Developed build scripts for Windows (.exe), macOS (.dmg), and Linux (.deb) installers
- Added comprehensive BUILD.md with step-by-step instructions
- Configured Maven build system with all dependencies
- Added Aragon logo and icon assets to project resources

**Note**: This is a desktop application meant to be downloaded and built locally with JDK 17+ and Maven. It cannot run on Replit's cloud environment as it requires a graphical display.

## System Architecture

### Frontend Architecture

**JavaFX Desktop Application**
- **Problem**: Need a cross-platform desktop UI that feels native and professional
- **Solution**: JavaFX with custom CSS theming (red & black Aragon branding)
- **Rationale**: JavaFX provides native-looking components, smooth animations, and works seamlessly across all major desktop platforms. Being Java-based, it integrates perfectly with the RSPS client which is also Java-based.
- **Key Features**: 
  - Undecorated window with custom title bar controls
  - System tray integration for minimize-to-tray functionality
  - Custom progress indicators for download tracking with speed/ETA display

### Backend Architecture

**Auto-Update System**
- **Problem**: Users need seamless client updates without manual downloads
- **Solution**: Manifest-based differential update system with cryptographic verification
- **Architecture**:
  - Remote manifest.json contains file listings with SHA-256 hashes and versions
  - Local version comparison determines which files need updating
  - Only changed files are downloaded (differential updates)
  - SHA-256 hash verification ensures file integrity before use
- **Pros**: Bandwidth efficient, secure, familiar pattern (used by Minecraft, RuneLite)
- **Cons**: Requires maintaining manifest file on server

**JVM Configuration**
- **Problem**: Users have different hardware capabilities and Java knowledge
- **Solution**: Built-in JVM arguments configuration with memory allocation controls
- **Implementation**: Persistent settings storage with customizable heap size and other JVM parameters
- **Benefit**: Power users can optimize performance while casual users get sensible defaults

### Distribution & Installation

**Native Packaging with jpackage**
- **Problem**: Users shouldn't need to install Java separately
- **Solution**: jpackage creates platform-specific installers with embedded JRE
- **Deliverables**:
  - Windows: .exe installer with WiX Toolset (Start Menu shortcuts, uninstaller)
  - macOS: .dmg with drag-to-Applications experience
  - Linux: .deb/.rpm packages with desktop integration
- **Advantages**: 
  - Zero user configuration required
  - Consistent Java runtime across all installations
  - Professional installation experience matching commercial software
- **Build Requirements**: JDK 17+ with jpackage, Maven 3.6+, platform-specific tools (WiX for Windows, Xcode CLI for macOS, fakeroot/rpm for Linux)

### Client Launch Mechanism

**Embedded Java Client Execution**
- **Problem**: Launch the game client with proper JVM configuration
- **Solution**: Launcher spawns client.jar as separate JVM process with configured arguments
- **Flow**: Update check → Download if needed → Verify integrity → Launch with custom JVM args
- **Design**: Keeps launcher and game as separate processes for stability and memory management

## External Dependencies

### Build Tools
- **Maven 3.6+**: Build automation and dependency management
- **JDK 17+**: Compilation target with JavaFX and jpackage bundled
- **Platform-Specific Build Tools**:
  - Windows: WiX Toolset 3.11+ for .exe installer creation
  - macOS: Xcode Command Line Tools for .dmg packaging
  - Linux: fakeroot and rpm for .deb/.rpm package generation

### Runtime Dependencies
- **JavaFX**: UI framework (bundled with JDK or as separate dependency)
- **Embedded OpenJDK**: Bundled JRE for end-user installations (no external Java required)

### Remote Services
- **Update Manifest Server**: Hosts manifest.json with file listings, versions, and SHA-256 hashes
- **Client File Distribution**: CDN or server hosting client.jar and associated game files for download

### Third-Party Integrations
- **System Tray API**: Native OS integration for minimize-to-tray functionality
- **File System Access**: Local storage for client files (typically `%AppData%/AragonClient` on Windows, `~/Library/Application Support/AragonClient` on macOS)
- **Network Layer**: HTTPS downloads for secure client file retrieval with progress tracking