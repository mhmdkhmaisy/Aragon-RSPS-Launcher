const fs = require('fs');
const https = require('https');
const path = require('path');

const WEBHOOK_URL = "https://discord.com/api/webhooks/1431683500205150311/qQuUNDSiOEWhN0C-zr6K5KWCjBMncqjKqvuSjKv2MIw8UEGX8tlW4eso-p1_nnj8_n7H";

if (!WEBHOOK_URL) {
  console.error('Error: DISCORD_WEBHOOK_URL environment variable is not set');
  console.error('Please set it with: export DISCORD_WEBHOOK_URL="your-webhook-url"');
  process.exit(1);
}

const launcherFeatures = {
  title: '🐉 Aragon RSPS Launcher',
  description: 'Experience the most advanced RSPS launcher with modern features designed for players!',
  color: 0xD32F2F,
  fields: [
    {
      name: '🎨 Modern Interface',
      value: 'Clean, intuitive web-based UI that\'s easy to navigate and looks amazing',
      inline: false
    },
    {
      name: '🚀 Ultra Lightweight',
      value: 'Tiny 3-5MB installer - downloads in seconds and uses minimal disk space',
      inline: true
    },
    {
      name: '🔄 Auto-Updates',
      value: 'Always stay current with automatic game client updates',
      inline: true
    },
    {
      name: '🔒 Secure & Safe',
      value: 'Built with security in mind - your credentials are encrypted and protected',
      inline: true
    },
    {
      name: '💻 Cross-Platform',
      value: 'Works seamlessly on Windows, macOS, and Linux',
      inline: true
    },
    {
      name: '⚡ Quick Play',
      value: 'Launch multiple characters simultaneously with one click',
      inline: true
    },
    {
      name: '🔑 Auto-Login',
      value: 'Save your characters and log in automatically - no more typing passwords!',
      inline: true
    },
    {
      name: '☕ No Java Required',
      value: 'Java Runtime Environment is bundled - just download and play!',
      inline: false
    },
    {
      name: '⚙️ Customizable',
      value: 'Adjust settings to your preference, including launch behavior and auto-close options',
      inline: false
    }
  ],
  footer: {
    text: 'Join Aragon RSPS today and experience the adventure!'
  },
  timestamp: new Date().toISOString()
};

function sendWebhook() {
  const webhookUrl = new URL(WEBHOOK_URL);
  
  const payload = JSON.stringify({
    username: 'Aragon Launcher',
    embeds: [launcherFeatures]
  });

  const options = {
    hostname: webhookUrl.hostname,
    path: webhookUrl.pathname + webhookUrl.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 204 || res.statusCode === 200) {
        console.log('✅ Successfully sent launcher announcement to Discord!');
      } else {
        console.error(`❌ Failed to send webhook. Status: ${res.statusCode}`);
        if (data) console.error('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error sending webhook:', error.message);
  });

  req.write(payload);
  req.end();
}

console.log('📢 Sending Aragon RSPS Launcher announcement to Discord...');
sendWebhook();
