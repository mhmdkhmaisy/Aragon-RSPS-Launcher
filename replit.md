# Aragon RSPS Launcher

## Overview

Aragon RSPS Launcher is a lightweight, modern desktop application for launching and auto-updating the Aragon RuneScape Private Server client. Built with Tauri (Rust + Web Technologies), it provides ultra-small installers (~3-5MB) with a beautiful web-based UI across Windows, macOS, and Linux platforms. The launcher handles automatic client updates through manifest-based differential downloads with SHA-256 verification, eliminating the need for users to manually manage game files.

The launcher UI can be previewed and developed in Replit's browser environment, then downloaded and built locally for desktop distribution.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 25, 2025 - Version 1.4.2** - Password Encryption & Character Limits Update
- Changed from SHA256 hashing to AES encryption for password storage (allows decryption for client launch)
- Passwords now stored encrypted and decrypted just-in-time before passing to client
- Updated Rust backend to accept plain password instead of hash
- Increased character limit from 3 to 10 characters per launcher
- Maintained 3 character limit for Quick Play functionality
- Added visual info alert in character modal when 3 Quick Play slots are full
- Improved error handling with user-friendly alerts when Quick Play limit reached
- Reverted console window behavior (no console windows shown on Windows)

**October 23, 2025 - Version 1.4.0** - Settings Redesign & Character Management
- Redesigned settings modal with tabbed sidebar navigation (General and What's New tabs)
- Added "What's New?" tab displaying versioned launcher update history
- Simplified settings to focus on essential options only
- Made auto-update mandatory for improved security and stability (cannot be disabled)
- Removed JVM arguments customization (now uses optimized defaults)
- Removed auto-launch option (manual launch only for better user control)
- Implemented "Quick Play" button for launching multiple characters simultaneously
- Enhanced credential handling for secure character authentication
- Added info tooltips throughout the interface for better user guidance
- Quick Play button displays real-time count of enabled characters with explanatory tooltip
- Custom tooltip styling with gold-themed overlays matching launcher design
- Updated launcher version display to v1.4.0

**October 22, 2025 - Version 1.3.0** - Complete Launcher Redesign
- Complete UI restructure to match Jagex Launcher layout
- Two-column layout: left side (promotional banner + Recent Updates), right sidebar (logo + play button)
- Top navigation bar with Aragon icon and Settings button
- Added Recent Updates widget section with placeholder update cards
- Dragon theme color palette throughout (crimson #c41e3a, gold #d4a574, ember #ff6b35)
- Multi-layered gradient backgrounds with atmospheric depth
- Enhanced visual effects: glows, shadows, and smooth animations
- Premium button designs with crimson-to-gold hover gradients
- Glass-effect cards with warm brown-tinted borders
- Clean, modern layout without crossed widgets

**October 10, 2025 - Version 1.2.0** - Enhanced Features & Performance
- Added multi-client launch support (1-3 clients simultaneously)
- Implemented configurable close delay with countdown (2-15 seconds)
- Fixed console window visibility on Windows (launcher and game clients run without CMD window)
- Added backward-compatible config system to preserve user settings during updates
- Platform-specific JRE bundling using Tauri configuration files

**October 10, 2025 - Version 1.0.0** - Tauri Architecture Migration
- Rebuilt launcher using Tauri (Rust + Web Technologies) for ultra-lightweight installers
- Created modern web UI with HTML/CSS/JavaScript that previews in Replit
- Implemented Rust backend for secure auto-updates and client launching
- Added Vite development server for instant UI preview in browser
- Configured dual-mode operation: browser preview for development, desktop build for distribution
- Reduced installer size from ~60MB (JavaFX) to ~3-5MB (Tauri)
- Maintained all features: SHA-256 verification, progress tracking, JVM configuration
- Added comprehensive Tauri build documentation for all platforms
- Set up workflow for live UI preview in Replit environment

**Note**: The UI can be previewed and developed in Replit. For desktop installers, download the project and build locally with Rust + Node.js.

## System Architecture

### Frontend Architecture

**Modern Web UI (HTML/CSS/JavaScript)**
- **Problem**: Need a lightweight, cross-platform UI that can be previewed during development
- **Solution**: Web-based UI using HTML/CSS/JavaScript with Vite dev server
- **Rationale**: Web technologies allow instant preview in Replit/browser, familiar development experience, and when combined with Tauri, produce incredibly small installers (~3-5MB vs 150MB+ Electron)
- **Key Features**: 
  - Browser preview mode for development (works in Replit)
  - Custom title bar with draggable region
  - Smooth CSS animations and transitions
  - Dragon theme color palette (crimson, gold, ember) with Jagex Launcher-inspired design
  - Card-based layout with glass effects and atmospheric backgrounds
  - Responsive progress indicators with download speed/ETA
  - Settings modal with persistent configuration

### Backend Architecture

**Rust Backend (Tauri)**
- **Problem**: Need secure, performant backend for file operations and system integration
- **Solution**: Rust-based backend using Tauri framework
- **Rationale**: Rust provides memory safety, fast performance, and tiny binaries. Tauri bridges Rust and web UI seamlessly.
- **Key Components**:
  - Auto-update service with manifest checking
  - SHA-256 hash verification for downloads
  - Client process launcher with JVM configuration
  - Persistent settings storage (JSON)
  - Cross-platform file system operations

**Auto-Update System**
- **Problem**: Users need seamless client updates without manual downloads
- **Solution**: Manifest-based differential update system with cryptographic verification
- **Architecture**:
  - Remote manifest.json contains file listings with SHA-256 hashes and versions
  - Local version comparison determines which files need updating
  - Only changed files are downloaded (differential updates)
  - SHA-256 hash verification ensures file integrity before use
  - Progress events emitted to frontend for real-time UI updates
- **Pros**: Bandwidth efficient, secure, familiar pattern (used by Minecraft, RuneLite)
- **Cons**: Requires maintaining manifest file on server

**Character Management & Quick Play**
- **Problem**: Users want to manage multiple character accounts and launch them conveniently
- **Solution**: Character management system with Quick Play functionality for multi-account launching
- **Implementation**: 
  - Character storage with AES-encrypted passwords (can be decrypted for client launch)
  - Encryption key: `ARAGON-LAUNCHER-SECRET-KEY-2025`
  - Up to 10 saved characters per launcher installation
  - Maximum 3 characters can have Quick Play enabled simultaneously
  - Each character has username, encrypted password, and Quick Play toggle
  - Passwords are decrypted in JavaScript before passing to client
  - Credentials passed to client using `-username:value -password:value` format (plain text)
- **Password Encryption/Decryption**:
  - **Encryption**: Uses CryptoJS AES encryption with a fixed key
  - **Storage**: Passwords stored encrypted in config file as `passwordHash` field
  - **Decryption**: Passwords decrypted just-in-time before client launch
  - **Method to decrypt manually** (JavaScript):
    ```javascript
    const CryptoJS = require('crypto-js');
    const ENCRYPTION_KEY = 'ARAGON-LAUNCHER-SECRET-KEY-2025';
    const encryptedPassword = '...'; // From config file
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    ```
  - **Security Note**: This is local-only encryption for convenience. Passwords are never transmitted over network. The encryption prevents plain-text exposure in config files while allowing decryption for client launch.
- **Features**:
  - Quick Play button launches all enabled characters simultaneously
  - Auto-login for selected character when using main Play button
  - Character selector dropdown with persistent selection
  - Configurable close delay (2-15 seconds) with visual countdown
  - No console windows on Windows (using CREATE_NO_WINDOW flag)
  - Customizable JVM arguments for memory optimization
  - Info tooltips explaining character management and Quick Play functionality
- **Benefit**: Users can easily switch between characters or launch multiple accounts for efficient gameplay

**JVM Configuration**
- Built-in JVM arguments configuration with memory allocation controls
- Rust-based config system with JSON persistence, backward-compatible deserialization
- Customizable settings for power users while maintaining sensible defaults

### Distribution & Installation

**Native Packaging with Tauri**
- **Problem**: Users shouldn't need to install any dependencies
- **Solution**: Tauri creates ultra-lightweight platform-specific installers with embedded runtime
- **Deliverables**:
  - Windows: .msi installer with Start Menu shortcuts and uninstaller
  - macOS: .dmg with drag-to-Applications experience
  - Linux: .deb/.rpm packages with desktop integration
- **Advantages**: 
  - Tiny installer size (~3-5MB vs 60MB+ JavaFX or 150MB+ Electron)
  - Zero user configuration required
  - Fast startup and low memory usage
  - Professional installation experience matching commercial software
  - Can preview UI during development without building
- **Build Requirements**: Rust 1.70+, Node.js 18+, platform-specific tools (MSVC for Windows, Xcode CLI for macOS, webkit2gtk for Linux)

### Client Launch Mechanism

**Rust Process Spawner**
- **Problem**: Launch the game client with proper JVM configuration
- **Solution**: Rust backend spawns client.jar as separate JVM process using system Java
- **Flow**: Update check → Download if needed → Verify integrity → Launch with custom JVM args
- **Design**: Keeps launcher and game as separate processes for stability and memory management
- **Implementation**: Uses Rust's `std::process::Command` for cross-platform process execution

## External Dependencies

### Build Tools
- **Node.js 18+** and **npm**: Frontend development and build
- **Vite**: Ultra-fast development server with hot module replacement
- **Rust 1.70+**: Backend compilation and Tauri bundler
- **Tauri CLI**: Desktop application bundler and build orchestration
- **Platform-Specific Build Tools**:
  - Windows: MSVC (Microsoft Visual C++) for native compilation
  - macOS: Xcode Command Line Tools for native macOS builds
  - Linux: webkit2gtk-4.0-dev and build-essential for GTK integration

### Runtime Dependencies
- **Embedded in Installer**: All dependencies bundled, no user installation needed
- **System Java**: Required on end-user system for launching client.jar (not for launcher itself)

### Remote Services
- **Update Manifest Server**: Hosts manifest.json with file listings, versions, and SHA-256 hashes
- **Client File Distribution**: CDN or server hosting client.jar and associated game files for download

### Third-Party Integrations
- **System Tray API**: Native OS integration for minimize-to-tray functionality
- **File System Access**: Local storage for client files (typically `%AppData%/AragonClient` on Windows, `~/Library/Application Support/AragonClient` on macOS)
- **Network Layer**: HTTPS downloads for secure client file retrieval with progress tracking