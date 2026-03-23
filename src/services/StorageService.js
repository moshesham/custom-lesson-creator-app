import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACTIVE_WORLD:    'ql_active_world',
  LEARNING_STYLE:  'ql_learning_style',
  HERO_NAME:       'ql_hero_name',
  RELICS:          'ql_relics',
  API_KEY:         'openai_api_key',
  FIXATION_LEVEL:  'ql_fixation_level',
  ZEN_MODE:        'ql_zen_mode',
};

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

  async getApiKey() {
    return AsyncStorage.getItem(KEYS.API_KEY);
  },
  async setApiKey(key) {
    await AsyncStorage.setItem(KEYS.API_KEY, key);
  },
};
