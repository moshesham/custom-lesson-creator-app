import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Switch, ScrollView,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { WORLDS } from '../constants/worlds';
import { StorageService } from '../services/StorageService';
import { buildPrintableHTML } from '../utils/questPrompts';

const LEVELS     = [1, 2, 3, 4, 5];
const LVL_LABELS = { 1: 'Sprinkle 🌱', 2: 'Light 🌿', 3: 'Medium 🔥', 4: 'Heavy 🌋', 5: 'MAX 💥' };

export default function Settings({ navigation }) {
  const [activeWorld,    setActiveWorld]    = useState(WORLDS[0]);
  const [apiKey,         setApiKey]         = useState('');
  const [apiKeyVisible,  setApiKeyVisible]  = useState(false);
  const [fixation,       setFixation]       = useState(3);
  const [zenMode,        setZenMode]        = useState(false);
  const [saved,          setSaved]          = useState(false);

  useEffect(() => {
    StorageService.getActiveWorld().then(w => { if (w) setActiveWorld(w); });
    StorageService.getApiKey().then(k => { if (k) setApiKey(k); });
    StorageService.getFixationLevel().then(f => setFixation(f));
    StorageService.getZenMode().then(z => setZenMode(z));
  }, []);

  const saveAll = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await StorageService.setApiKey(apiKey.trim());
    await StorageService.setFixationLevel(fixation);
    await StorageService.setZenMode(zenMode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const printLastQuest = async () => {
    // Build a sample quest for demo
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
      activeWorld,
      heroName,
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

  return (
    <LinearGradient colors={[activeWorld.bgColor, activeWorld.primaryColor]} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={[styles.backTxt, { color: activeWorld.textColor }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>⚙️ Settings</Text>

          {/* API Key */}
          <Text style={[styles.label, { color: activeWorld.accentColor }]}>🔑 OpenAI API Key</Text>
          <Text style={[styles.hint, { color: activeWorld.textColor + '88' }]}>
            Add your key to use AI. Without it, demo quests are used.
          </Text>
          <View style={styles.apiRow}>
            <TextInput
              style={[styles.apiInput, { color: activeWorld.textColor, borderColor: activeWorld.accentColor + '55' }]}
              placeholder="sk-..."
              placeholderTextColor={activeWorld.textColor + '44'}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={!apiKeyVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setApiKeyVisible(v => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{apiKeyVisible ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Fixation slider */}
          <Text style={[styles.label, { color: activeWorld.accentColor }]}>🎚️ Fixation Depth</Text>
          <Text style={[styles.hint, { color: activeWorld.textColor + '88' }]}>
            How deep should the theming go?
          </Text>
          <View style={styles.levelRow}>
            {LEVELS.map(lvl => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.lvlBtn,
                  { backgroundColor: activeWorld.primaryColor },
                  fixation === lvl && { backgroundColor: activeWorld.buttonColor, borderColor: activeWorld.accentColor },
                ]}
                onPress={async () => { await Haptics.selectionAsync(); setFixation(lvl); }}
              >
                <Text style={[styles.lvlNum, { color: fixation === lvl ? '#FFF' : activeWorld.textColor + '88' }]}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.lvlLabel, { color: activeWorld.textColor }]}>
            Current: {LVL_LABELS[fixation]}
          </Text>
          <Text style={[styles.lvlDesc, { color: activeWorld.textColor + '77' }]}>
            {fixation === 1 && 'Just themed stickers on the page.'}
            {fixation === 2 && 'Key terms renamed to fit the theme.'}
            {fixation === 3 && 'Problem rewritten in the world\'s story.'}
            {fixation === 4 && 'Fully immersed in the world\'s lore.'}
            {fixation === 5 && 'Entire math logic rewritten in the lore!'}
          </Text>

          {/* Zen mode */}
          <View style={styles.zenRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: activeWorld.accentColor, marginBottom: 0 }]}>🧘 Zen Mode</Text>
              <Text style={[styles.hint, { color: activeWorld.textColor + '88', marginBottom: 0 }]}>
                Reduce animations for calmer focus
              </Text>
            </View>
            <Switch
              value={zenMode}
              onValueChange={async (v) => { await Haptics.selectionAsync(); setZenMode(v); }}
              trackColor={{ false: '#555', true: activeWorld.accentColor }}
              thumbColor={zenMode ? activeWorld.buttonColor : '#888'}
            />
          </View>

          {/* Paper Bridge */}
          <Text style={[styles.label, { color: activeWorld.accentColor }]}>📄 Paper Bridge</Text>
          <Text style={[styles.hint, { color: activeWorld.textColor + '88' }]}>
            Print a Quest Map — do work on paper, then snap to submit!
          </Text>
          <TouchableOpacity
            style={[styles.printBtn, { backgroundColor: activeWorld.primaryColor }]}
            onPress={printLastQuest}
          >
            <Text style={[styles.printBtnTxt, { color: activeWorld.textColor }]}>🖨️ Print Sample Quest Map</Text>
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: saved ? '#388E3C' : activeWorld.buttonColor }]}
            onPress={saveAll}
          >
            <Text style={styles.saveBtnTxt}>{saved ? '✓ Saved!' : 'Save Settings'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill:      { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  back:      { marginBottom: 12 },
  backTxt:   { fontSize: 16 },
  title:     { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  label:     { fontSize: 14, fontWeight: 'bold', marginBottom: 4, marginTop: 16 },
  hint:      { fontSize: 12, marginBottom: 8 },
  apiRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apiInput: {
    flex: 1, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  eyeBtn:  { padding: 10 },
  eyeIcon: { fontSize: 20 },
  levelRow:{ flexDirection: 'row', gap: 8, marginBottom: 8 },
  lvlBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  lvlNum:  { fontSize: 16, fontWeight: 'bold' },
  lvlLabel:{ fontSize: 14, fontWeight: '600', marginBottom: 4 },
  lvlDesc: { fontSize: 12, marginBottom: 8, lineHeight: 18 },
  zenRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  printBtn:{ borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4, marginBottom: 8 },
  printBtnTxt: { fontSize: 14, fontWeight: '600' },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16, elevation: 4 },
  saveBtnTxt: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
