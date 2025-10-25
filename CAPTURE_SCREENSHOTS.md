# How to Capture Launcher Screenshots

## Quick Method

Since the launcher is running in preview mode, here's how to capture screenshots:

### Option 1: Manual Screenshots (Easiest)

1. **Open the launcher preview** - It should be visible in the webview panel
2. **Take screenshots manually**:
   - **Full Launcher**: Take a screenshot of the main view
   - **Settings Modal**: Click "Settings" in top-right, then screenshot
   - **Character Management**: Click "Character Management" link, then screenshot

3. **Save the screenshots**:
   - Save them in the `launcher_screenshots/` folder
   - Name them: `main.png`, `settings.png`, `characters.png`

4. **Run the showcase script**:
   ```bash
   node discord-launcher-showcase.js
   ```

### Option 2: Using Browser DevTools

1. Open the preview in your browser
2. Press F12 to open DevTools
3. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
4. Type "screenshot" and select "Capture screenshot"
5. Save to `launcher_screenshots/` folder

## What the Script Does

The `discord-launcher-showcase.js` script will:

1. Send an intro message
2. Upload each screenshot with its description:
   - **Main launcher** → Description of the interface
   - **Settings panel** → Explanation of customization options
   - **Character management** → Details about account features
3. End with a features summary

## Format

The Discord messages will look like:

```
[Image: Main Launcher]
**🎮 Main Launcher Interface**
Clean, modern design with...

[Image: Settings]
**⚙️ Settings Panel**
Customize your launcher...

[Image: Characters]
**👥 Character Management**
Manage all your characters...
```

Images appear right above their descriptions, not all at the bottom!
