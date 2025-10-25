const https = require('https');

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendShowcase() {
  const screenshots = [
    {
      url: process.env.MAIN_SCREENSHOT_URL || '',
      text: '**🎮 Main Launcher Interface**\n\nClean, modern design with the Aragon logo front and center. The launcher shows:\n• Big, obvious PLAY button to get you in-game fast\n• Character selector to choose which account to use\n• Quick Play button for launching multiple characters at once\n• Recent updates section to keep you informed about new features\n• Quick links to character management and community website'
    },
    {
      url: process.env.SETTINGS_SCREENSHOT_URL || '',
      text: '**⚙️ Settings Panel**\n\nCustomize your launcher experience with easy-to-use settings:\n• Toggle auto-updates on/off to control when updates happen\n• Choose whether the launcher closes automatically when you start playing\n• Set a custom delay before the launcher closes\n• All settings are saved automatically and persist between sessions'
    },
    {
      url: process.env.CHARACTERS_SCREENSHOT_URL || '',
      text: '**👥 Character Management**\n\nManage all your characters in one convenient place:\n• Add unlimited characters with usernames and passwords\n• Mark characters for Quick Play to launch them all simultaneously\n• Select which character to use as your default\n• Passwords are encrypted and stored securely on your computer\n• Delete characters you no longer need with one click'
    }
  ];

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

    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      
      let message = screenshot.text;
      if (screenshot.url) {
        message = screenshot.url + '\n' + message;
      }
      
      await new Promise((resolve, reject) => {
        sendMessage(message, (err) => {
          if (err) reject(err);
          else {
            console.log(`✅ Sent section ${i + 1}`);
            resolve();
          }
        });
      });
      
      await sleep(1000);
    }

    await new Promise((resolve, reject) => {
      sendMessage(
        '**✨ Key Features Summary**\n\n' +
        '🚀 **Ultra Lightweight** - Only 3-5MB installer (150x smaller than alternatives!)\n' +
        '🔄 **Auto-Updates** - Game client updates automatically, always stay current\n' +
        '🔒 **Secure** - Military-grade AES encryption for your passwords\n' +
        '💻 **Cross-Platform** - Native installers for Windows, macOS, and Linux\n' +
        '☕ **No Java Required** - Java Runtime Environment comes bundled\n' +
        '⚡ **Quick Play** - Launch multiple characters simultaneously with one click\n' +
        '🔑 **Auto-Login** - Save your credentials and log in automatically\n\n' +
        'Download now and join the adventure! 🐉',
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
    console.log('\n💡 Tip: Set MAIN_SCREENSHOT_URL, SETTINGS_SCREENSHOT_URL, and');
    console.log('   CHARACTERS_SCREENSHOT_URL to include images from any hosting service');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendShowcase();
