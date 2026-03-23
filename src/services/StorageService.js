import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Non-sensitive preferences stored in AsyncStorage
const KEYS = {
  ACTIVE_WORLD: 'ql_active_world',
  LEARNING_STYLE: 'ql_learning_style',
  HERO_NAME: 'ql_hero_name',
  RELICS: 'ql_relics',
  AI_ENGINE: 'ql_ai_engine',
  FIXATION_LEVEL: 'ql_fixation_level',
  ZEN_MODE: 'ql_zen_mode',
  SCHEMA_VERSION: 'ql_schema_version',
  GRADE_BAND: 'ql_grade_band',
  CURRENT_LEVEL: 'ql_current_level',
  SUPPORT_PROFILE: 'ql_support_profile',
};

// API keys stored in the device's secure enclave (Android Keystore)
const SECURE_KEYS = {
  OPENAI_KEY: 'ql_openai_api_key',
  GEMINI_KEY: 'ql_gemini_api_key',
  CLAUDE_KEY: 'ql_claude_api_key',
  PARENTAL_CONSENT: 'ql_parental_consent',
};

const CURRENT_SCHEMA_VERSION = 1;

export const StorageService = {
  async getActiveWorld() {
    const raw = await AsyncStorage.getItem(KEYS.ACTIVE_WORLD);
    return raw ? JSON.parse(raw) : null;
  },
  async setActiveWorld(world) {
    await AsyncStorage.setItem(KEYS.ACTIVE_WORLD, JSON.stringify(world));
  },

  async getLearningStyle() {
    return (await AsyncStorage.getItem(KEYS.LEARNING_STYLE)) || 'read';
  },
  async setLearningStyle(style) {
    await AsyncStorage.setItem(KEYS.LEARNING_STYLE, style);
  },

  async getHeroName() {
    return (await AsyncStorage.getItem(KEYS.HERO_NAME)) || '';
  },
  async setHeroName(name) {
    await AsyncStorage.setItem(KEYS.HERO_NAME, name);
  },

  async getRelics() {
    const raw = await AsyncStorage.getItem(KEYS.RELICS);
    return raw ? JSON.parse(raw) : [];
  },
  async addRelic(relic) {
    const relics = await this.getRelics();
    relics.push({
      ...relic,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      earnedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(KEYS.RELICS, JSON.stringify(relics));
    return relics;
  },

  async getFixationLevel() {
    const raw = await AsyncStorage.getItem(KEYS.FIXATION_LEVEL);
    return raw ? parseInt(raw, 10) : 3;
  },
  async setFixationLevel(level) {
    await AsyncStorage.setItem(KEYS.FIXATION_LEVEL, String(level));
  },

  async getZenMode() {
    return (await AsyncStorage.getItem(KEYS.ZEN_MODE)) === 'true';
  },
  async setZenMode(value) {
    await AsyncStorage.setItem(KEYS.ZEN_MODE, value ? 'true' : 'false');
  },

  async getApiKey() { return SecureStore.getItemAsync(SECURE_KEYS.OPENAI_KEY); },
  async setApiKey(k) { await SecureStore.setItemAsync(SECURE_KEYS.OPENAI_KEY, k ?? ''); },

  async getOpenAIKey() { return SecureStore.getItemAsync(SECURE_KEYS.OPENAI_KEY); },
  async setOpenAIKey(k) { await SecureStore.setItemAsync(SECURE_KEYS.OPENAI_KEY, k ?? ''); },

  async getGeminiKey() { return SecureStore.getItemAsync(SECURE_KEYS.GEMINI_KEY); },
  async setGeminiKey(k) { await SecureStore.setItemAsync(SECURE_KEYS.GEMINI_KEY, k ?? ''); },

  async getClaudeKey() { return SecureStore.getItemAsync(SECURE_KEYS.CLAUDE_KEY); },
  async setClaudeKey(k) { await SecureStore.setItemAsync(SECURE_KEYS.CLAUDE_KEY, k ?? ''); },

  async getAIEngine() { return (await AsyncStorage.getItem(KEYS.AI_ENGINE)) || 'openai'; },
  async setAIEngine(e) { await AsyncStorage.setItem(KEYS.AI_ENGINE, e); },

  // Grade band and progression (for implementation plan expansion)
  async getGradeBand() {
    return (await AsyncStorage.getItem(KEYS.GRADE_BAND)) || 'Band C'; // default to grades 2-3
  },
  async setGradeBand(band) {
    await AsyncStorage.setItem(KEYS.GRADE_BAND, band);
  },

  async getCurrentLevel() {
    const raw = await AsyncStorage.getItem(KEYS.CURRENT_LEVEL);
    return raw ? parseInt(raw, 10) : 1;
  },
  async setCurrentLevel(level) {
    await AsyncStorage.setItem(KEYS.CURRENT_LEVEL, String(level));
  },

  async getSupportProfile() {
    const raw = await AsyncStorage.getItem(KEYS.SUPPORT_PROFILE);
    return raw ? JSON.parse(raw) : { sensoryMode: 'standard', oneStepMode: false };
  },
  async setSupportProfile(profile) {
    await AsyncStorage.setItem(KEYS.SUPPORT_PROFILE, JSON.stringify(profile));
  },

  // Parental consent (COPPA compliance)
  async getParentalConsent() {
    return await SecureStore.getItemAsync(SECURE_KEYS.PARENTAL_CONSENT);
  },
  async setParentalConsent(status) {
    await SecureStore.setItemAsync(SECURE_KEYS.PARENTAL_CONSENT, status);
  },

  // Delete all user data (parental control)
  async deleteAllData() {
    // Clear AsyncStorage
    await AsyncStorage.multiRemove(Object.values(KEYS));
    // Clear SecureStore
    await SecureStore.deleteItemAsync(SECURE_KEYS.OPENAI_KEY);
    await SecureStore.deleteItemAsync(SECURE_KEYS.GEMINI_KEY);
    await SecureStore.deleteItemAsync(SECURE_KEYS.CLAUDE_KEY);
    await SecureStore.deleteItemAsync(SECURE_KEYS.PARENTAL_CONSENT);
  },
};

// Storage schema migration
export async function migrateStorageSchema() {
  try {
    const version = await AsyncStorage.getItem(KEYS.SCHEMA_VERSION);
    const currentVersion = version ? parseInt(version, 10) : 0;

    if (currentVersion < CURRENT_SCHEMA_VERSION) {
      // Migration logic for v0 → v1
      // Add default values for new fields without breaking existing users
      const gradeBand = await AsyncStorage.getItem(KEYS.GRADE_BAND);
      if (!gradeBand) {
        await AsyncStorage.setItem(KEYS.GRADE_BAND, 'Band C'); // default to grades 2-3
      }

      const currentLevel = await AsyncStorage.getItem(KEYS.CURRENT_LEVEL);
      if (!currentLevel) {
        await AsyncStorage.setItem(KEYS.CURRENT_LEVEL, '1');
      }

      const supportProfile = await AsyncStorage.getItem(KEYS.SUPPORT_PROFILE);
      if (!supportProfile) {
        await AsyncStorage.setItem(KEYS.SUPPORT_PROFILE, JSON.stringify({
          sensoryMode: 'standard',
          oneStepMode: false
        }));
      }

      // Mark migration complete
      await AsyncStorage.setItem(KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
    }
  } catch (error) {
    console.error('Storage migration failed:', error);
    // Don't throw - allow app to continue with defaults
  }
};
