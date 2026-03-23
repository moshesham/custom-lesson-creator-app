import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Switch, ScrollView,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { WORLDS } from '../constants/worlds';
import { StorageService } from '../services/StorageService';
import { AI_ENGINES } from '../services/AIService';
import { buildPrintableHTML } from '../utils/questPrompts';
import { THEME } from '../constants/theme';

const LEVELS     = [1, 2, 3, 4, 5];
const LVL_LABELS = { 1: 'Sprinkle 🌱', 2: 'Light 🌿', 3: 'Medium 🔥', 4: 'Heavy 🌋', 5: 'MAX 💥' };

export default function Settings({ navigation }) {
  const [activeWorld,   setActiveWorld]   = useState(WORLDS[0]);
  const [aiEngine,      setAiEngine]      = useState('openai');
  const [openaiKey,     setOpenaiKey]     = useState('');
  const [geminiKey,     setGeminiKey]     = useState('');
  const [claudeKey,     setClaudeKey]     = useState('');
  const [keyVisible,    setKeyVisible]    = useState({});
  const [fixation,      setFixation]      = useState(3);
  const [zenMode,       setZenMode]       = useState(false);
  const [saved,         setSaved]         = useState(false);

  useEffect(() => {
    StorageService.getActiveWorld().then(w => { if (w) setActiveWorld(w); });
    StorageService.getAIEngine().then(e => setAiEngine(e));
    StorageService.getOpenAIKey().then(k => { if (k) setOpenaiKey(k); });
    StorageService.getGeminiKey().then(k => { if (k) setGeminiKey(k); });
    StorageService.getClaudeKey().then(k => { if (k) setClaudeKey(k); });
    StorageService.getFixationLevel().then(f => setFixation(f));
    StorageService.getZenMode().then(z => setZenMode(z));
  }, []);

  const saveAll = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await StorageService.setAIEngine(aiEngine);
    await StorageService.setOpenAIKey(openaiKey.trim());
    await StorageService.setGeminiKey(geminiKey.trim());
    await StorageService.setClaudeKey(claudeKey.trim());
    await StorageService.setFixationLevel(fixation);
    await StorageService.setZenMode(zenMode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const printLastQuest = async () => {
    const heroName = await StorageService.getHeroName();
    const html = buildPrintableHTML(
      {
        questTitle: 'Sample Quest Map',
        objective:  'Complete this sample to see the Paper Bridge!',
        stage1: { title: activeWorld.terms.stage1, content: 'This is where the adventure begins...' },
        stage2: { title: activeWorld.terms.stage2, content: 'Work through the challenge here.' },
        stage3: { title: activeWorld.terms.stage3, content: 'Victory is yours!' },
        hint: 'Try re-reading the first step.',
      },
      activeWorld, heroName,
    );
    let uri = null;
    try {
      const result = await Print.printToFileAsync({ html, base64: false });
      uri = result.uri;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Quest Map' });
      } else {
        Alert.alert('Saved!', 'Quest PDF saved to device.');
      }
    } catch (e) {
      Alert.alert('Print Error', 'Could not create PDF. Try again.');
    } finally {
      if (uri) FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
    }
  };

  const toggleKeyVisible = (id) => setKeyVisible(v => ({ ...v, [id]: !v[id] }));

  const KEY_VALUES = { openai: openaiKey, gemini: geminiKey, claude: claudeKey };
  const KEY_SETTERS = { openai: setOpenaiKey, gemini: setGeminiKey, claude: setClaudeKey };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: activeWorld.bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* ── Header bar ── */}
        <View style={[styles.headerBar, { backgroundColor: activeWorld.headerBg }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* ── AI Engine selector ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: activeWorld.primaryColor }]}>🤖 AI Engine</Text>
          <Text style={styles.sectionHint}>Choose your AI assistant. Add your API key below.</Text>
          <View style={styles.engineRow}>
            {AI_ENGINES.map(eng => (
              <TouchableOpacity
                key={eng.id}
                style={[
                  styles.engineCard,
                  aiEngine === eng.id && { borderColor: activeWorld.accentColor, borderWidth: 3, backgroundColor: activeWorld.accentColor + '15' },
                ]}
                onPress={async () => { await Haptics.selectionAsync(); setAiEngine(eng.id); }}
                activeOpacity={0.85}
              >
                <Text style={styles.engineEmoji}>{eng.emoji}</Text>
                <Text style={[styles.engineLabel, aiEngine === eng.id && { color: activeWorld.primaryColor }]}>
                  {eng.label}
                </Text>
                <Text style={styles.engineSub}>{eng.subtitle}</Text>
                {aiEngine === eng.id && (
                  <View style={[styles.activePip, { backgroundColor: activeWorld.accentColor }]}>
                    <Text style={styles.activePipTxt}>ACTIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── API Keys ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: activeWorld.primaryColor }]}>🔑 API Keys</Text>
          <Text style={styles.sectionHint}>
            Without a key the app uses built-in demo quests — fully working for testing!
          </Text>
          {AI_ENGINES.map(eng => (
            <View key={eng.id} style={styles.keyBlock}>
              <Text style={[styles.keyLabel, { color: activeWorld.primaryColor }]}>
                {eng.emoji} {eng.label} Key
                {aiEngine === eng.id && (
                  <Text style={{ color: activeWorld.accentColor }}> (active)</Text>
                )}
              </Text>
              <View style={styles.keyRow}>
                <TextInput
                  style={[styles.keyInput, { borderColor: aiEngine === eng.id ? activeWorld.accentColor : '#DDD' }]}
                  placeholder={`${eng.keyPrefix}...`}
                  placeholderTextColor="#BBB"
                  value={KEY_VALUES[eng.id]}
                  onChangeText={KEY_SETTERS[eng.id]}
                  secureTextEntry={!keyVisible[eng.id]}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => toggleKeyVisible(eng.id)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{keyVisible[eng.id] ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ── Fixation Depth ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: activeWorld.primaryColor }]}>🎚️ Fixation Depth</Text>
          <Text style={styles.sectionHint}>How deep should the theming go?</Text>
          <View style={styles.levelRow}>
            {LEVELS.map(lvl => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.lvlBtn,
                  fixation === lvl && { backgroundColor: activeWorld.buttonColor, borderColor: activeWorld.buttonColor },
                ]}
                onPress={async () => { await Haptics.selectionAsync(); setFixation(lvl); }}
              >
                <Text style={[styles.lvlNum, { color: fixation === lvl ? '#FFF' : activeWorld.primaryColor }]}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.lvlLabel, { color: activeWorld.primaryColor }]}>
            {LVL_LABELS[fixation]}
          </Text>
          <Text style={styles.lvlDesc}>
            {fixation === 1 && 'Just themed stickers on the page.'}
            {fixation === 2 && "Key terms renamed to fit the theme."}
            {fixation === 3 && "Problem rewritten in the world's story."}
            {fixation === 4 && "Fully immersed in the world's lore."}
            {fixation === 5 && 'Entire math logic rewritten in the lore!'}
          </Text>
        </View>

        {/* ── Zen Mode ── */}
        <View style={styles.section}>
          <View style={styles.zenRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: activeWorld.primaryColor, marginBottom: 2 }]}>🧘 Zen Mode</Text>
              <Text style={styles.sectionHint}>Reduce animations for calmer focus</Text>
            </View>
            <Switch
              value={zenMode}
              onValueChange={async v => { await Haptics.selectionAsync(); setZenMode(v); }}
              trackColor={{ false: '#CCC', true: activeWorld.accentColor }}
              thumbColor={zenMode ? activeWorld.buttonColor : '#FFF'}
            />
          </View>
        </View>

        {/* ── Paper Bridge ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: activeWorld.primaryColor }]}>📄 Paper Bridge</Text>
          <Text style={styles.sectionHint}>
            Print a Quest Map — do work on paper, then snap to submit!
          </Text>
          <TouchableOpacity
            style={[styles.printBtn, { borderColor: activeWorld.primaryColor }]}
            onPress={printLastQuest}
          >
            <Text style={[styles.printBtnTxt, { color: activeWorld.primaryColor }]}>
              🖨️ Print Sample Quest Map
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Save ── */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saved ? '#388E3C' : activeWorld.buttonColor }]}
          onPress={saveAll}
        >
          <Text style={styles.saveBtnTxt}>{saved ? '✓ Saved!' : 'Save Settings'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill:      { flex: 1 },
  container: { paddingBottom: 48 },
  /* Header bar */
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  backBtn:      { width: 60 },
  backBtnTxt:   { color: '#FFF', fontSize: 15 },
  headerTitle:  { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  /* Sections */
  section: {
    backgroundColor: THEME.white,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: THEME.radiusCard,
    padding: 16,
    ...THEME.shadow,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  sectionHint:  { fontSize: 12, color: THEME.textLight, marginBottom: 10 },
  /* Engine selector */
  engineRow: { flexDirection: 'row', gap: 8 },
  engineCard: {
    flex: 1, borderRadius: 14, borderWidth: 2, borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA', padding: 10, alignItems: 'center',
    position: 'relative',
  },
  engineEmoji: { fontSize: 24, marginBottom: 4 },
  engineLabel: { fontSize: 13, fontWeight: 'bold', color: THEME.textDark, marginBottom: 2 },
  engineSub:   { fontSize: 10, color: THEME.textLight, textAlign: 'center' },
  activePip: {
    marginTop: 6, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8,
  },
  activePipTxt: { fontSize: 9, color: '#FFF', fontWeight: 'bold' },
  /* API keys */
  keyBlock: { marginBottom: 12 },
  keyLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  keyRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keyInput: {
    flex: 1, borderWidth: 2, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 13, color: THEME.textDark, backgroundColor: '#FAFAFA',
  },
  eyeBtn:  { padding: 8 },
  eyeIcon: { fontSize: 20 },
  /* Fixation */
  levelRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  lvlBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    borderWidth: 2, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA',
  },
  lvlNum:  { fontSize: 16, fontWeight: 'bold' },
  lvlLabel:{ fontSize: 14, fontWeight: '700', color: THEME.textDark, marginBottom: 2 },
  lvlDesc: { fontSize: 12, color: THEME.textLight, lineHeight: 18 },
  /* Zen mode */
  zenRow: { flexDirection: 'row', alignItems: 'center' },
  /* Paper bridge */
  printBtn: {
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    borderWidth: 2, marginTop: 4,
  },
  printBtnTxt: { fontSize: 14, fontWeight: '600' },
  /* Save */
  saveBtn: {
    marginHorizontal: 16, marginTop: 16,
    borderRadius: THEME.radiusBtn, paddingVertical: 18, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8,
  },
  saveBtnTxt: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

