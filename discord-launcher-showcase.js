const https = require('https');
const fs = require('fs');
const path = require('path');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.error('Error: DISCORD_WEBHOOK_URL environment variable is not set');
  process.exit(1);
}

function sendMessage(content, callback) {
  const webhookUrl = new URL(WEBHOOK_URL);
  const payload = JSON.stringify({ content });

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
    res.on('data', () => {});
    res.on('end', () => {
      if (res.statusCode === 204 || res.statusCode === 200) {
        callback(null);
      } else {
        callback(new Error(`Failed with status ${res.statusCode}`));
      }
    });
  });

  req.on('error', callback);
  req.write(payload);
  req.end();
}

function sendImageWithText(imagePath, text, callback) {
  if (!fs.existsSync(imagePath)) {
    console.error(`Image not found: ${imagePath}`);
    return callback(new Error('Image not found'));
  }

  const webhookUrl = new URL(WEBHOOK_URL);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const imageBuffer = fs.readFileSync(imagePath);
  const fileName = path.basename(imagePath);

  let body = '';
  
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="content"\r\n\r\n`;
  body += `${text}\r\n`;
  
  const header = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: image/png\r\n\r\n`
  );
  
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  
  const bodyBuffer = Buffer.concat([
    Buffer.from(body),
    header,
    imageBuffer,
    footer
  ]);

  const options = {
    hostname: webhookUrl.hostname,
    path: webhookUrl.pathname + webhookUrl.search,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': bodyBuffer.length
    }
  };

  const req = https.request(options, (res) => {
    res.on('data', () => {});
    res.on('end', () => {
      if (res.statusCode === 204 || res.statusCode === 200) {
        callback(null);
      } else {
        callback(new Error(`Failed with status ${res.statusCode}`));
      }
    });
  });

  req.on('error', callback);
  req.write(bodyBuffer);
  req.end();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendShowcase() {
  try {
    console.log('📢 Starting Aragon RSPS Launcher showcase...\n');

    await new Promise((resolve, reject) => {
      sendMessage('# 🐉 Aragon RSPS Launcher - Feature Showcase\n\nExperience the most advanced RSPS launcher built for modern players!', (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Sent intro message');
          resolve();
        }
      });
    });

    await sleep(1000);

    console.log('\n📸 Note: To add launcher screenshots:');
    console.log('   1. Place PNG/JPG images in launcher_screenshots/ folder');
    console.log('   2. Name them: main.png, settings.png, characters.png');
    console.log('   3. Run this script again\n');

    const screenshots = [
      {
        path: 'launcher_screenshots/main.png',
        text: '**🎮 Main Launcher Interface**\n\nClean, modern design with the Aragon logo front and center. The launcher shows:\n• Big, obvious PLAY button\n• Character selector dropdown\n• Quick Play button for launching multiple characters\n• Recent updates section to keep you informed\n• Links to character management and community website'
      },
      {
        path: 'launcher_screenshots/settings.png',
        text: '**⚙️ Settings Panel**\n\nCustomize your launcher experience with easy-to-use settings:\n• Toggle auto-updates on/off\n• Choose whether the launcher closes when you start playing\n• Set a custom close delay\n• All settings are saved automatically'
      },
      {
        path: 'launcher_screenshots/characters.png',
        text: '**👥 Character Management**\n\nManage all your characters in one place:\n• Add unlimited characters with usernames and passwords\n• Mark characters for Quick Play to launch them all at once\n• Select which character to use as default\n• Passwords are encrypted and stored securely\n• Delete characters you no longer need'
      }
    ];

    for (const screenshot of screenshots) {
      if (fs.existsSync(screenshot.path)) {
        await new Promise((resolve, reject) => {
          sendImageWithText(screenshot.path, screenshot.text, (err) => {
            if (err) reject(err);
            else {
              console.log(`✅ Sent ${path.basename(screenshot.path)}`);
              resolve();
            }
          });
        });
        await sleep(1000);
      }
    }

    await new Promise((resolve, reject) => {
      sendMessage(
        '**✨ Key Features**\n\n' +
        '🚀 **Ultra Lightweight** - Only 3-5MB installer\n' +
        '🔄 **Auto-Updates** - Always stay current\n' +
        '🔒 **Secure** - Encrypted password storage\n' +
        '💻 **Cross-Platform** - Windows, macOS, Linux\n' +
        '☕ **No Java Required** - Everything bundled for you\n' +
        '⚡ **Quick Play** - Launch multiple characters simultaneously\n\n' +
        'Join Aragon RSPS today! 🐉',
        (err) => {
          if (err) reject(err);
          else {
            console.log('✅ Sent features summary');
            resolve();
          }
        }
      );
    });

    console.log('\n✅ Showcase complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendShowcase();
