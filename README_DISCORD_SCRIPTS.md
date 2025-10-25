# Discord Launcher Showcase Scripts

Multiple scripts to announce your Aragon RSPS Launcher features on Discord with images and descriptions.

## Scripts Overview

### 1. `discord-launcher-showcase.js`
Uploads local screenshot files directly to Discord.

**Usage:**
```bash
# 1. Add screenshots to launcher_screenshots/ folder:
#    - main.png (main launcher interface)
#    - settings.png (settings modal)
#    - characters.png (character management)
#
# 2. Run the script:
node discord-launcher-showcase.js
```

### 2. `discord-launcher-showcase-urls.js`
Uses image URLs (from Imgur, Discord CDN, or any image host).

**Usage:**
```bash
# With image URLs:
MAIN_SCREENSHOT_URL="https://i.imgur.com/abc123.png" \
SETTINGS_SCREENSHOT_URL="https://i.imgur.com/def456.png" \
CHARACTERS_SCREENSHOT_URL="https://i.imgur.com/ghi789.png" \
node discord-launcher-showcase-urls.js

# Without images (just text):
node discord-launcher-showcase-urls.js
```

### 3. `discord-announcement.js`
Simple feature list in a single embed message.

**Usage:**
```bash
node discord-announcement.js
```

## Message Format

The showcase scripts send messages in this order:

1. **Intro message** - "Aragon RSPS Launcher - Feature Showcase"
2. **Main launcher image + description** - Interface overview
3. **Settings image + description** - Customization options
4. **Characters image + description** - Account management
5. **Features summary** - Key benefits and call-to-action

Images appear **directly above** their descriptions (not at the bottom!).

## How to Capture Screenshots

### Method 1: From Preview Window
1. Open the launcher in the preview panel
2. For each view you want to capture:
   - **Main view**: Just take a screenshot
   - **Settings**: Click the Settings gear icon (top-right), then screenshot
   - **Characters**: Click "Character Management" link, then screenshot
3. Save as PNG files in `launcher_screenshots/`

### Method 2: Using Browser
1. Right-click the preview → "Open in new tab"
2. Press F12 → Open DevTools
3. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
4. Type "Capture screenshot" and select it
5. Save with appropriate names

### Method 3: Upload to Image Host
1. Take screenshots using any method
2. Upload to Imgur, Discord, or your website
3. Copy the direct image URLs
4. Use `discord-launcher-showcase-urls.js` with the URLs

## Example Output

```
# 🐉 Aragon RSPS Launcher - Feature Showcase

Experience the most advanced RSPS launcher built for modern players!

[Main launcher screenshot]

**🎮 Main Launcher Interface**

Clean, modern design with the Aragon logo front and center...

[Settings screenshot]

**⚙️ Settings Panel**

Customize your launcher experience with easy-to-use settings...

[Characters screenshot]

**👥 Character Management**

Manage all your characters in one convenient place...

**✨ Key Features Summary**

🚀 **Ultra Lightweight** - Only 3-5MB installer
🔄 **Auto-Updates** - Game client updates automatically
...
```

## Tips

- Use PNG format for best quality screenshots
- Capture at a reasonable resolution (1280x720 or higher)
- Make sure modals are fully visible before screenshotting
- Test with the URL version first if you're unsure about file uploads
- Screenshots are optional - the script works great with just text too!

## Webhook Setup

The `DISCORD_WEBHOOK_URL` is already configured in your Replit environment, so you can run any of these scripts immediately!
