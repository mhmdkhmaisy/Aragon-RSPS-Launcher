# Discord Webhook Announcement Scripts

These scripts send beautifully formatted announcements about the Aragon RSPS Launcher to Discord channels using webhooks.

## Scripts Available

### 1. `discord-announcement.js`
Basic script that sends launcher features in a nicely formatted embed.

### 2. `discord-announcement-with-images.js`
Enhanced version that can include screenshots of the launcher interface.

## Setup

The webhook URL is already configured in your Replit environment as `DISCORD_WEBHOOK_URL`.

## Usage

### Basic Announcement
```bash
node discord-announcement.js
```

### Announcement with Screenshot
```bash
SCREENSHOT_URL="https://your-image-url.com/screenshot.png" node discord-announcement-with-images.js
```

Or set the environment variable first:
```bash
export SCREENSHOT_URL="https://your-image-url.com/screenshot.png"
node discord-announcement-with-images.js
```

## What Gets Sent

The announcement includes these player-friendly features:

- **Modern Interface** - Clean, intuitive web-based UI
- **Ultra Lightweight** - Only 3-5MB installer size
- **Auto-Updates** - Automatic game client updates
- **Secure & Safe** - Encrypted credential storage
- **Cross-Platform** - Works on Windows, macOS, and Linux
- **Quick Play** - Launch multiple characters at once
- **Auto-Login** - Save characters and log in automatically
- **No Java Required** - Bundled Java Runtime Environment
- **Customizable** - Adjustable settings and preferences

## Customization

To customize the announcement, edit the `launcherEmbed` object in either script:

- **title**: The main heading
- **description**: Brief introduction text
- **color**: Hex color code (currently red: 0xD32F2F)
- **fields**: Individual feature descriptions
- **footer**: Bottom text

### Color Options
- Red: `0xD32F2F` (current)
- Blue: `0x1976D2`
- Green: `0x388E3C`
- Purple: `0x7B1FA2`
- Gold: `0xFFA000`

## Adding Screenshots

To include launcher screenshots:

1. Host your screenshot online (Imgur, Discord CDN, your website, etc.)
2. Get the direct image URL
3. Use the enhanced script with the `SCREENSHOT_URL` variable

Example:
```bash
SCREENSHOT_URL="https://i.imgur.com/yourimage.png" node discord-announcement-with-images.js
```

## Testing

The `DISCORD_WEBHOOK_URL` is already set up for testing. You can safely run these scripts to see the results in your Discord channel.

## Notes

- These scripts are **separate** from the Tauri launcher build
- They use Node.js built-in modules (no additional dependencies needed)
- Features described are player-focused, not technical
- Perfect for announcements, updates, or promotional posts
