// Character Management System
import CryptoJS from 'crypto-js';

const isTauri = typeof window.__TAURI__ !== 'undefined';
let invoke;
if (isTauri) {
    invoke = window.__TAURI__.invoke;
}

const STORAGE_KEY = 'aragon_characters';
const MAX_CHARACTERS = 10;
const MAX_QUICK_PLAY = 2;
const ENCRYPTION_KEY = 'ARAGON-LAUNCHER-SECRET-KEY-2025'; // Encryption salt/key

class CharacterManager {
    constructor() {
        this.characters = [];
        this.selectedCharacter = null;
        this.loadCharacters();
    }

    // Encrypt password for storage (AES encryption - can be decrypted)
    encryptPassword(password) {
        return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
    }

    // Decrypt password for client launch (reverse of encryption)
    decryptPassword(encryptedPassword) {
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    async loadCharacters() {
        try {
            if (isTauri) {
                this.characters = await invoke('get_characters') || [];
            } else {
                const saved = localStorage.getItem(STORAGE_KEY);
                this.characters = saved ? JSON.parse(saved) : [];
            }
            
            if (this.characters.length > 0 && !this.selectedCharacter) {
                const quickLaunch = this.characters.find(c => c.quickLaunch);
                this.selectedCharacter = quickLaunch || this.characters[0];
            }
        } catch (error) {
            console.error('Failed to load characters:', error);
            this.characters = [];
        }
    }

    async saveCharacters() {
        try {
            if (isTauri) {
                await invoke('save_characters', { characters: this.characters });
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.characters));
            }
        } catch (error) {
            console.error('Failed to save characters:', error);
            throw error;
        }
    }

    addCharacter(username, password, quickLaunch = false) {
        if (this.characters.length >= MAX_CHARACTERS) {
            throw new Error(`Maximum ${MAX_CHARACTERS} characters allowed`);
        }

        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        if (this.characters.some(c => c.username.toLowerCase() === username.toLowerCase())) {
            throw new Error('Character with this username already exists');
        }

        if (quickLaunch) {
            this.characters.forEach(c => c.quickLaunch = false);
        }

        const character = {
            id: Date.now().toString(),
            username,
            passwordHash: this.encryptPassword(password),
            quickLaunch,
            createdAt: new Date().toISOString()
        };

        this.characters.push(character);
        this.saveCharacters();

        if (!this.selectedCharacter) {
            this.selectedCharacter = character;
        }

        return character;
    }

    deleteCharacter(id) {
        const index = this.characters.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('Character not found');
        }

        this.characters.splice(index, 1);
        
        if (this.selectedCharacter?.id === id) {
            this.selectedCharacter = this.characters[0] || null;
        }

        this.saveCharacters();
    }

    selectCharacter(id) {
        const character = this.characters.find(c => c.id === id);
        if (!character) {
            throw new Error('Character not found');
        }

        this.selectedCharacter = character;
        return character;
    }

    toggleQuickLaunch(id) {
        const character = this.characters.find(c => c.id === id);
        if (!character) {
            throw new Error('Character not found');
        }

        // If enabling quick launch, check if we've reached the limit
        if (!character.quickLaunch) {
            const quickPlayCount = this.characters.filter(c => c.quickLaunch).length;
            if (quickPlayCount >= MAX_QUICK_PLAY) {
                throw new Error(`Maximum ${MAX_QUICK_PLAY} characters can have Quick Play enabled`);
            }
        }

        character.quickLaunch = !character.quickLaunch;
        this.saveCharacters();
    }
    
    getQuickPlayCount() {
        return this.characters.filter(c => c.quickLaunch).length;
    }
    
    getMaxQuickPlay() {
        return MAX_QUICK_PLAY;
    }

    getSelectedCharacter() {
        return this.selectedCharacter;
    }

    getAllCharacters() {
        return this.characters;
    }

    canAddMore() {
        return this.characters.length < MAX_CHARACTERS;
    }
}

export default new CharacterManager();
