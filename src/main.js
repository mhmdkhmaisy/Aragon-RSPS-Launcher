// Aragon Launcher - Main JavaScript

// Check if running in Tauri (desktop) or browser (preview)
const isTauri = typeof window.__TAURI__ !== 'undefined';

// Import Tauri APIs if available
let invoke, appWindow;
if (isTauri) {
    invoke = window.__TAURI__.invoke;
    // Get the current window using getCurrent() method
    appWindow = window.__TAURI__.window.getCurrent();
}

// DOM Elements
const statusText = document.getElementById('status');
const playButton = document.getElementById('playButton');
const playButtonText = document.getElementById('playButtonText');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressDetails = document.getElementById('progressDetails');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');

// Window controls
const minimizeBtn = document.getElementById('minimize');
const closeBtn = document.getElementById('close');

// Settings
const jvmArgsInput = document.getElementById('jvmArgs');
const autoUpdateCheckbox = document.getElementById('autoUpdate');
const autoLaunchCheckbox = document.getElementById('autoLaunch');
const closeOnLaunchCheckbox = document.getElementById('closeOnLaunch');

// State
let config = {
    jvmArgs: '-Xmx2G -Xms512M',
    closeOnLaunch: false,
    autoUpdate: true,
    autoLaunch: true
};

// Initialize
async function init() {
    console.log('Initializing launcher...');
    console.log('Running in Tauri:', isTauri);
    
    // Load config
    await loadConfig();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for updates
    if (config.autoUpdate) {
        await checkForUpdates();
    } else {
        updateStatus('Ready to play!');
        playButton.disabled = false;
        
        // Auto launch if updates are disabled but auto launch is enabled
        if (config.autoLaunch) {
            setTimeout(() => launchGame(), 500);
        }
    }
}

// Load configuration
async function loadConfig() {
    try {
        if (isTauri) {
            config = await invoke('get_config');
            console.log('Loaded config:', config);
        } else {
            // Load from localStorage in browser preview
            const saved = localStorage.getItem('launcher_config');
            if (saved) {
                config = JSON.parse(saved);
            }
        }
        
        // Update UI
        jvmArgsInput.value = config.jvmArgs;
        autoUpdateCheckbox.checked = config.autoUpdate;
        autoLaunchCheckbox.checked = config.autoLaunch;
        closeOnLaunchCheckbox.checked = config.closeOnLaunch;
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

// Save configuration
async function saveConfig() {
    config.jvmArgs = jvmArgsInput.value;
    config.autoUpdate = autoUpdateCheckbox.checked;
    config.autoLaunch = autoLaunchCheckbox.checked;
    config.closeOnLaunch = closeOnLaunchCheckbox.checked;
    
    try {
        if (isTauri) {
            await invoke('save_config', { config });
        } else {
            localStorage.setItem('launcher_config', JSON.stringify(config));
        }
        console.log('Config saved:', config);
    } catch (error) {
        console.error('Failed to save config:', error);
    }
}

// Check for updates
async function checkForUpdates() {
    try {
        updateStatus('Checking for updates...');
        statusText.classList.add('loading');
        
        if (isTauri) {
            try {
                // Call Rust backend with timeout
                const updateInfo = await invoke('check_for_updates');
                
                if (updateInfo.updateAvailable) {
                    await downloadUpdate(updateInfo);
                } else {
                    updateStatus('Ready to play!');
                    playButton.disabled = false;
                }
                
                // Auto launch if enabled and ready
                if (config.autoLaunch && !playButton.disabled) {
                    setTimeout(() => launchGame(), 500);
                }
            } catch (invokeError) {
                console.error('Tauri invoke failed:', invokeError);
                updateStatus('Update check failed - Ready to play anyway');
                playButton.disabled = false;
            }
        } else {
            // Browser preview mode - simulate update check
            await simulateUpdateCheck();
        }
    } catch (error) {
        console.error('Update check failed:', error);
        updateStatus('Update check failed - Ready to play anyway');
        playButton.disabled = false;
    } finally {
        statusText.classList.remove('loading');
    }
}

// Download update
async function downloadUpdate(updateInfo) {
    try {
        updateStatus('Downloading update...');
        progressContainer.style.display = 'block';
        
        if (isTauri) {
            // Listen for progress updates
            await invoke('download_update', { updateInfo });
        } else {
            // Browser preview - simulate download
            await simulateDownload();
        }
        
        updateStatus('Update complete - Ready to play!');
        progressContainer.style.display = 'none';
        playButton.disabled = false;
        
        // Auto launch if enabled
        if (config.autoLaunch) {
            setTimeout(() => launchGame(), 500);
        }
    } catch (error) {
        console.error('Download failed:', error);
        updateStatus('Download failed: ' + error);
        progressContainer.style.display = 'none';
    }
}

// Launch game
async function launchGame() {
    try {
        playButton.disabled = true;
        playButtonText.textContent = 'LAUNCHING...';
        
        if (isTauri) {
            await invoke('launch_client', { 
                jvmArgs: config.jvmArgs 
            });
            
            playButtonText.textContent = 'LAUNCHED';
            updateStatus('Client launched successfully');
            
            if (config.closeOnLaunch) {
                await appWindow.close();
            } else {
                // Re-enable play button after 2 seconds for multiple sessions
                setTimeout(() => {
                    playButton.disabled = false;
                    playButtonText.textContent = 'PLAY';
                    updateStatus('Ready to play!');
                }, 2000);
            }
        } else {
            // Browser preview - show message
            alert('In browser preview mode.\n\nIn the desktop app, this would launch the game client with:\n' + config.jvmArgs);
            playButton.disabled = false;
            playButtonText.textContent = 'PLAY';
        }
    } catch (error) {
        console.error('Failed to launch game:', error);
        updateStatus('Launch failed: ' + error);
        playButton.disabled = false;
        playButtonText.textContent = 'PLAY';
    }
}

// Simulate update check (browser preview)
async function simulateUpdateCheck() {
    await sleep(1500);
    const hasUpdate = Math.random() > 0.7;
    
    if (hasUpdate) {
        updateStatus('Downloading update...');
        await simulateDownload();
        updateStatus('Update complete - Ready to play!');
    } else {
        updateStatus('Ready to play!');
    }
    
    playButton.disabled = false;
}

// Simulate download (browser preview)
async function simulateDownload() {
    progressContainer.style.display = 'block';
    
    for (let i = 0; i <= 100; i += 2) {
        progressFill.style.width = i + '%';
        
        const speed = (50 + Math.random() * 100).toFixed(2);
        const eta = Math.ceil((100 - i) / 4);
        
        progressDetails.textContent = `${i}% - ${speed} KB/s - ETA: ${eta}s`;
        
        await sleep(50);
    }
    
    progressContainer.style.display = 'none';
}

// Update status text
function updateStatus(message) {
    statusText.textContent = message;
}

// Event listeners
function setupEventListeners() {
    // Window controls
    if (isTauri && appWindow) {
        minimizeBtn.addEventListener('click', async () => {
            try {
                await appWindow.minimize();
            } catch (e) {
                console.error('Failed to minimize:', e);
            }
        });
        closeBtn.addEventListener('click', async () => {
            try {
                await appWindow.close();
            } catch (e) {
                console.error('Failed to close:', e);
            }
        });
    } else {
        minimizeBtn.style.display = 'none';
        closeBtn.style.display = 'none';
    }
    
    // Play button
    playButton.addEventListener('click', launchGame);
    
    // Settings - ensure it's not null and add event listener
    if (settingsButton) {
        settingsButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (settingsModal) {
                settingsModal.classList.add('active');
            }
        });
    }
    
    const closeSettingsBtn = document.getElementById('closeSettings');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
    }
    
    const cancelSettingsBtn = document.getElementById('cancelSettings');
    if (cancelSettingsBtn) {
        cancelSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('active');
            loadConfig(); // Reset to saved values
        });
    }
    
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', async () => {
            await saveConfig();
            settingsModal.classList.remove('active');
        });
    }
    
    // Close modal on outside click
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
    }
}

// Utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Listen for progress events from Tauri
if (isTauri) {
    window.__TAURI__.event.listen('download-progress', (event) => {
        const { percentage, speed, eta } = event.payload;
        progressFill.style.width = percentage + '%';
        progressDetails.textContent = `${percentage}% - ${speed} KB/s - ETA: ${eta}s`;
    });
}

// Start the launcher
init();
