import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { WORLDS, LEARNING_STYLES } from '../constants/worlds';
import { StorageService } from '../services/StorageService';

export default function HeroProfiler({ navigation }) {
  const [activeWorld, setActiveWorld] = useState(WORLDS[0]);
  const [heroName, setHeroName]       = useState('');
  const [style, setStyle]             = useState('read');
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    StorageService.getActiveWorld().then(w => { if (w) setActiveWorld(w); });
    StorageService.getHeroName().then(n => { if (n) setHeroName(n); });
    StorageService.getLearningStyle().then(s => { if (s) setStyle(s); });
  }, []);

  const save = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await StorageService.setHeroName(heroName.trim());
    await StorageService.setLearningStyle(style);
    setSaved(true);
    setTimeout(() => navigation.goBack(), 900);
  };

  return (
    <LinearGradient colors={[activeWorld.bgColor, activeWorld.primaryColor]} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={[styles.backTxt, { color: activeWorld.textColor }]}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.title}>🧙 Hero Profiler</Text>
          <Text style={[styles.subtitle, { color: activeWorld.textColor }]}>
            Tell us about yourself, {activeWorld.terms.hero}!
          </Text>

          {/* Guide bubble */}
          <View style={[styles.guideBubble, { borderColor: activeWorld.accentColor, backgroundColor: activeWorld.primaryColor + 'AA' }]}>
            <Text style={styles.guideEmoji}>{activeWorld.guideEmoji}</Text>
            <Text style={[styles.guideText, { color: activeWorld.textColor }]}>
              Every hero has their own power! Tell me how you like to learn.
            </Text>
          </View>

          {/* Hero name */}
          <Text style={[styles.label, { color: activeWorld.accentColor }]}>Your Hero Name (optional)</Text>
          <TextInput
            style={[styles.input, { color: activeWorld.textColor, borderColor: activeWorld.accentColor + '66' }]}
            placeholder={`Enter your name, ${activeWorld.terms.hero}...`}
            placeholderTextColor={activeWorld.textColor + '55'}
            value={heroName}
            onChangeText={setHeroName}
            maxLength={24}
          />

          {/* Learning style */}
          <Text style={[styles.label, { color: activeWorld.accentColor }]}>How do you like to learn?</Text>
          <View style={styles.styleGrid}>
            {LEARNING_STYLES.map((ls) => (
              <TouchableOpacity
                key={ls.id}
                style={[
                  styles.styleCard,
                  { backgroundColor: activeWorld.primaryColor },
                  style === ls.id && { borderColor: activeWorld.accentColor, borderWidth: 2 },
                ]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setStyle(ls.id);
                }}
              >
                <Text style={styles.styleEmoji}>{ls.emoji}</Text>
                <Text style={[styles.styleLabel, { color: activeWorld.textColor }]}>{ls.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: saved ? '#388E3C' : activeWorld.buttonColor }]}
            onPress={save}
          >
            <Text style={styles.saveBtnTxt}>{saved ? '✓ Saved!' : 'Save My Hero'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill:    { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  back:    { marginBottom: 12 },
  backTxt: { fontSize: 16 },
  title:   { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  subtitle:{ fontSize: 15, marginBottom: 16 },
  guideBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, borderWidth: 2, padding: 12, marginBottom: 20,
  },
  guideEmoji: { fontSize: 32 },
  guideText:  { flex: 1, fontSize: 13, lineHeight: 18 },
  label:  { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
  input: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#FFF', marginBottom: 16,
  },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  styleCard: {
    width: '46%', borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  styleEmoji: { fontSize: 28, marginBottom: 6 },
  styleLabel: { fontSize: 13, textAlign: 'center', fontWeight: '600' },
  saveBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    elevation: 4,
  },
  saveBtnTxt: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
