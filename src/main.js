// Aragon Launcher - Main JavaScript
import characterManager from './characterManager.js';

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

// Settings elements
const jvmArgsInput = document.getElementById('jvmArgs');
const autoUpdateCheckbox = document.getElementById('autoUpdate');
const autoLaunchCheckbox = document.getElementById('autoLaunch');
const clientCountSlider = document.getElementById('clientCount');
const clientCountValue = document.getElementById('clientCountValue');
const closeOnLaunchCheckbox = document.getElementById('closeOnLaunch');
const closeDelaySlider = document.getElementById('closeDelay');
const closeDelayValue = document.getElementById('closeDelayValue');

// Character management elements
const characterSelect = document.getElementById('characterSelect');
const characterManagementBtn = document.getElementById('characterManagement');
const characterModal = document.getElementById('characterModal');
const characterTableBody = document.getElementById('characterTableBody');
const newUsernameInput = document.getElementById('newUsername');
const newPasswordInput = document.getElementById('newPassword');
const newQuickLaunchCheckbox = document.getElementById('newQuickLaunch');
const addCharacterBtn = document.getElementById('addCharacterBtn');
const characterCount = document.getElementById('characterCount');

// State
let config = {
    jvmArgs: '-Xmx2G -Xms512M',
    closeOnLaunch: false,
    autoUpdate: true,
    autoLaunch: true,
    clientCount: 1,
    closeDelay: 5
};

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update character UI
function updateCharacterUI() {
    updateCharacterSelector();
    renderCharacterTable();
    updateCharacterCount();
}

// Update character selector dropdown
function updateCharacterSelector() {
    const characters = characterManager.getAllCharacters();
    const selected = characterManager.getSelectedCharacter();
    
    characterSelect.innerHTML = '';
    
    if (characters.length === 0) {
        characterSelect.innerHTML = '<option value="">No character selected</option>';
        characterSelect.disabled = true;
    } else {
        characters.forEach(char => {
            const option = document.createElement('option');
            option.value = char.id;
            option.textContent = char.username + (char.quickLaunch ? ' (Quick Launch)' : '');
            if (selected && selected.id === char.id) {
                option.selected = true;
            }
            characterSelect.appendChild(option);
        });
        characterSelect.disabled = false;
    }
}

// Render character table
function renderCharacterTable() {
    const characters = characterManager.getAllCharacters();
    
    if (characters.length === 0) {
        characterTableBody.innerHTML = '<tr class="no-characters"><td colspan="3" style="text-align: center; color: var(--text-muted);">No characters added yet</td></tr>';
        return;
    }
    
    characterTableBody.innerHTML = characters.map(char => `
        <tr>
            <td>
                <span class="character-username">${escapeHtml(char.username)}</span>
                ${char.quickLaunch ? '<span class="quick-launch-badge">Quick Launch</span>' : ''}
            </td>
            <td>
                <div class="quick-launch-toggle">
                    <input type="checkbox" 
                           class="quick-launch-checkbox" 
                           data-id="${char.id}" 
                           ${char.quickLaunch ? 'checked' : ''}>
                </div>
            </td>
            <td>
                <div class="character-actions">
                    <button class="delete-btn" data-id="${char.id}">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    characterTableBody.querySelectorAll('.quick-launch-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            characterManager.toggleQuickLaunch(id);
            updateCharacterUI();
        });
    });
    
    characterTableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const char = characterManager.getAllCharacters().find(c => c.id === id);
            if (char && confirm(`Are you sure you want to delete character "${char.username}"?`)) {
                characterManager.deleteCharacter(id);
                updateCharacterUI();
            }
        });
    });
}

// Update character count display
function updateCharacterCount() {
    const count = characterManager.getAllCharacters().length;
    characterCount.textContent = `${count} / 3 characters`;
    addCharacterBtn.disabled = !characterManager.canAddMore();
}

// Initialize
async function init() {
    console.log('Initializing launcher...');
    console.log('Running in Tauri:', isTauri);
    
    // Load config
    await loadConfig();
    
    // Load characters
    await characterManager.loadCharacters();
    updateCharacterUI();
    
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
        clientCountSlider.value = config.clientCount;
        clientCountValue.textContent = config.clientCount;
        closeOnLaunchCheckbox.checked = config.closeOnLaunch;
        closeDelaySlider.value = config.closeDelay;
        closeDelayValue.textContent = config.closeDelay;
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

// Save configuration
async function saveConfig() {
    config.jvmArgs = jvmArgsInput.value;
    config.autoUpdate = autoUpdateCheckbox.checked;
    config.autoLaunch = autoLaunchCheckbox.checked;
    config.clientCount = parseInt(clientCountSlider.value);
    config.closeOnLaunch = closeOnLaunchCheckbox.checked;
    config.closeDelay = parseInt(closeDelaySlider.value);
    
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
        const clientCount = config.clientCount;
        const clientText = clientCount > 1 ? `${clientCount} CLIENTS` : 'CLIENT';
        playButtonText.textContent = `LAUNCHING ${clientText}...`;
        
        const selectedCharacter = characterManager.getSelectedCharacter();
        
        if (isTauri) {
            await invoke('launch_client', { 
                jvmArgs: config.jvmArgs,
                clientCount: clientCount,
                username: selectedCharacter?.username || '',
                passwordHash: selectedCharacter?.passwordHash || ''
            });
            
            playButtonText.textContent = 'LAUNCHED';
            updateStatus(`${clientText} launched successfully`);
            
            if (config.closeOnLaunch) {
                const delay = config.closeDelay * 1000;
                updateStatus(`Closing in ${config.closeDelay} seconds...`);
                
                // Countdown
                let remaining = config.closeDelay;
                const countdown = setInterval(() => {
                    remaining--;
                    if (remaining > 0) {
                        updateStatus(`Closing in ${remaining} seconds...`);
                    } else {
                        clearInterval(countdown);
                    }
                }, 1000);
                
                setTimeout(async () => {
                    await appWindow.close();
                }, delay);
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
            const charInfo = selectedCharacter ? `\nCharacter: ${selectedCharacter.username}` : '\nNo character selected';
            alert(`In browser preview mode.\n\nIn the desktop app, this would launch ${clientCount} client(s) with:\n${config.jvmArgs}${charInfo}\n\nClose delay: ${config.closeDelay} seconds`);
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
    
    // Character selector
    characterSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            characterManager.selectCharacter(e.target.value);
        }
    });
    
    // Character management button
    characterManagementBtn.addEventListener('click', (e) => {
        e.preventDefault();
        characterModal.classList.add('active');
        updateCharacterUI();
    });
    
    // Close character modal
    document.getElementById('closeCharacterModal').addEventListener('click', () => {
        characterModal.classList.remove('active');
    });
    
    document.getElementById('closeCharacterModalBtn').addEventListener('click', () => {
        characterModal.classList.remove('active');
    });
    
    // Close modal on outside click
    characterModal.addEventListener('click', (e) => {
        if (e.target === characterModal) {
            characterModal.classList.remove('active');
        }
    });
    
    // Add character button
    addCharacterBtn.addEventListener('click', () => {
        const username = newUsernameInput.value.trim();
        const password = newPasswordInput.value;
        const quickLaunch = newQuickLaunchCheckbox.checked;
        
        try {
            characterManager.addCharacter(username, password, quickLaunch);
            
            newUsernameInput.value = '';
            newPasswordInput.value = '';
            newQuickLaunchCheckbox.checked = false;
            
            updateCharacterUI();
            alert(`Character "${username}" added successfully!`);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
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
    
    // Update client count value display when slider changes
    if (clientCountSlider && clientCountValue) {
        clientCountSlider.addEventListener('input', (e) => {
            clientCountValue.textContent = e.target.value;
        });
    }
    
    // Update close delay value display when slider changes
    if (closeDelaySlider && closeDelayValue) {
        closeDelaySlider.addEventListener('input', (e) => {
            closeDelayValue.textContent = e.target.value;
        });
    }
    
    // Reset settings to default
    const resetSettingsBtn = document.getElementById('resetSettings');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            // Reset to defaults
            jvmArgsInput.value = '-Xmx2G -Xms512M';
            autoUpdateCheckbox.checked = true;
            autoLaunchCheckbox.checked = true;
            clientCountSlider.value = 1;
            clientCountValue.textContent = '1';
            closeOnLaunchCheckbox.checked = false;
            closeDelaySlider.value = 5;
            closeDelayValue.textContent = '5';
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
