import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Animated, Modal,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { WORLDS } from '../constants/worlds';
import { StorageService } from '../services/StorageService';
import SpeechBubble from '../components/SpeechBubble';
import QuestCard from '../components/QuestCard';
import EmergencyFlare from '../components/EmergencyFlare';
import { getRandomEmergencyMessage } from '../utils/questPrompts';
import { THEME } from '../constants/theme';

export default function QuestDisplay({ navigation, route }) {
  const { quest, world } = route.params || {};
  const [activeWorld, setActiveWorld] = useState(world || WORLDS[0]);
  const [hintVisible, setHintVisible] = useState(false);
  const [emergency, setEmergency]     = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [showReward, setShowReward]   = useState(false);
  const [heroName, setHeroName]       = useState('');
  const rewardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!world) StorageService.getActiveWorld().then(w => { if (w) setActiveWorld(w); });
    StorageService.getHeroName().then(n => { if (n) setHeroName(n); });
  }, []);

  /* ── Voice narration ── */
  const voiceQuest = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); return; }
    const lines = [
      quest?.questTitle,
      quest?.stage1?.content,
      quest?.stage2?.content,
      quest?.stage3?.content,
    ].filter(Boolean);
    setIsSpeaking(true);
    const speakNext = (i) => {
      if (i >= lines.length) { setIsSpeaking(false); return; }
      Speech.speak(lines[i], { rate: 0.9, pitch: 1.1, onDone: () => speakNext(i + 1), onError: () => setIsSpeaking(false) });
    };
    speakNext(0);
  };

  /* ── Complete quest ── */
  const completeQuest = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (quest) {
      await StorageService.addRelic({
        rewardName:        quest.rewardName        || 'Mystery Relic',
        rewardDescription: quest.rewardDescription || '',
        worldEmoji:        activeWorld.emoji,
        worldId:           activeWorld.id,
        worldName:         activeWorld.name,
        questTitle:        quest.questTitle || '',
      });
    }
    Animated.spring(rewardAnim, { toValue: 1, useNativeDriver: true }).start();
    setShowReward(true);
  };

  /* ── Emergency mode ── */
  const toggleEmergency = async () => {
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); }
    setEmergency(e => !e);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const name = heroName || activeWorld.terms.hero;

  /* ── Emergency overlay ── */
  if (emergency) {
    return (
      <SafeAreaView style={styles.emergencyBg}>
        <View style={styles.emergencyContainer}>
          <Text style={styles.emergencyTitle}>🌙 Take a Breath</Text>
          <Text style={styles.emergencyMsg}>{getRandomEmergencyMessage()}</Text>
          <View style={styles.simplifiedBox}>
            <Text style={styles.simplifiedLabel}>👉 Just start here:</Text>
            <Text style={styles.simplifiedStep}>{quest?.simplifiedStep || 'Read just the first word or number.'}</Text>
          </View>
          <EmergencyFlare onPress={toggleEmergency} isActive={true} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: activeWorld.bgColor }]}>
      {/* Header */}
      <View style={[styles.headerBar, { backgroundColor: activeWorld.headerBg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{quest?.questTitle || 'Your Quest'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.objective, { color: activeWorld.textColor }]}>{quest?.objective || ''}</Text>

        {/* Guide bubble */}
        <SpeechBubble
          guideEmoji={activeWorld.guideEmoji}
          guideName={activeWorld.guide}
          text={`${name}! Your quest awaits. Conquer all 3 stages to earn your ${quest?.rewardName || activeWorld.terms.relic}!`}
          accentColor={activeWorld.accentColor}
          textColor={activeWorld.textColor}
          bgColor={activeWorld.cardBg || THEME.white}
        />

        {/* 3 stage cards */}
        {[
          { data: quest?.stage1, index: 0 },
          { data: quest?.stage2, index: 1 },
          { data: quest?.stage3, index: 2 },
        ].map(({ data, index }) =>
          data ? (
            <QuestCard
              key={index}
              index={index}
              title={data.title || ''}
              content={data.content || ''}
              accentColor={activeWorld.accentColor}
              textColor={activeWorld.textColor}
              primaryColor={activeWorld.primaryColor}
            />
          ) : null,
        )}

        {/* Hint */}
        <TouchableOpacity
          style={[styles.hintBtn, { borderColor: activeWorld.primaryColor }]}
          onPress={() => setHintVisible(h => !h)}
        >
          <Text style={[styles.hintBtnTxt, { color: activeWorld.primaryColor }]}>
            💡 {hintVisible ? 'Hide' : 'Show'} {activeWorld.terms.hint}
          </Text>
        </TouchableOpacity>
        {hintVisible && quest?.hint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintTxt}>{quest.hint}</Text>
          </View>
        )}

        {/* Voice button */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.voiceBtn, { backgroundColor: isSpeaking ? '#B71C1C' : activeWorld.primaryColor }]}
            onPress={voiceQuest}
          >
            <Text style={styles.voiceTxt}>{isSpeaking ? '🔇 Stop' : '🔊 Voice My Quest'}</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency flare */}
        <EmergencyFlare onPress={toggleEmergency} isActive={false} />

        {/* Complete button */}
        <TouchableOpacity
          style={[styles.completeBtn, { backgroundColor: activeWorld.buttonColor }]}
          onPress={completeQuest}
        >
          <Text style={styles.completeBtnTxt}>🏆 Complete Quest!</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Reward modal */}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.modalBg}>
          <Animated.View style={[styles.rewardCard, { transform: [{ scale: rewardAnim }] }]}>
            <Text style={styles.rewardStars}>⭐⭐⭐</Text>
            <Text style={styles.rewardTitle}>Quest Complete!</Text>
            <Text style={styles.rewardEmoji}>{activeWorld.emoji}</Text>
            <Text style={[styles.rewardName, { color: activeWorld.accentColor }]}>
              {quest?.rewardName || activeWorld.terms.relic}
            </Text>
            <Text style={styles.rewardDesc}>{quest?.rewardDescription || 'Added to your trophy room!'}</Text>
            <TouchableOpacity
              style={[styles.rewardBtn, { backgroundColor: activeWorld.buttonColor }]}
              onPress={() => { setShowReward(false); navigation.reset({ index: 0, routes: [{ name: 'WorldDashboard' }] }); }}
            >
              <Text style={styles.rewardBtnTxt}>Back to Home 🏠</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rewardBtnSecondary}
              onPress={() => { setShowReward(false); navigation.navigate('RewardRoom'); }}
            >
              <Text style={styles.rewardBtnSecTxt}>View Trophy Room 🏆</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill:      { flex: 1 },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    marginBottom: 4,
  },
  back:        { width: 60 },
  backTxt:     { color: '#FFF', fontSize: 15 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFF', flex: 1, textAlign: 'center' },
  container: { padding: 16, paddingBottom: 40 },
  objective: { fontSize: 13, marginBottom: 12, opacity: 0.8 },
  hintBtn: {
    marginHorizontal: 16, marginBottom: 6, borderRadius: THEME.radiusPill,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 2, backgroundColor: THEME.white,
    ...THEME.shadow,
  },
  hintBtnTxt: { fontSize: 14, fontWeight: '600' },
  hintBox: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 12,
    borderWidth: 0, borderLeftWidth: 4, borderLeftColor: '#F9A825',
    backgroundColor: '#FFF9C4', padding: 12,
  },
  hintTxt:  { fontSize: 14, color: '#5D4037', lineHeight: 20 },
  actionRow:{ marginHorizontal: 16, marginBottom: 6 },
  voiceBtn: { borderRadius: THEME.radiusPill, paddingVertical: 12, alignItems: 'center' },
  voiceTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  completeBtn: {
    marginHorizontal: 16, marginTop: 8, borderRadius: THEME.radiusBtn,
    paddingVertical: 18, alignItems: 'center', elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10,
  },
  completeBtnTxt: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  /* Emergency */
  emergencyBg:        { flex: 1, backgroundColor: '#0D0D1A' },
  emergencyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emergencyTitle:     { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
  emergencyMsg:       { fontSize: 16, color: '#CCC', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  simplifiedBox:      { backgroundColor: '#1A1A3E', borderRadius: 12, padding: 16, width: '100%', marginBottom: 24 },
  simplifiedLabel:    { fontSize: 14, color: '#AAA', marginBottom: 8 },
  simplifiedStep:     { fontSize: 18, color: '#FFF', fontWeight: 'bold', lineHeight: 26 },
  /* Reward modal */
  modalBg:    { flex: 1, backgroundColor: '#000000BB', justifyContent: 'center', alignItems: 'center', padding: 24 },
  rewardCard: { backgroundColor: THEME.white, borderRadius: 24, padding: 24, alignItems: 'center', width: '100%', ...THEME.shadow },
  rewardStars:  { fontSize: 32, marginBottom: 8 },
  rewardTitle:  { fontSize: 24, fontWeight: 'bold', color: THEME.textDark, marginBottom: 8 },
  rewardEmoji:  { fontSize: 48, marginVertical: 8 },
  rewardName:   { fontSize: 18, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  rewardDesc:   { fontSize: 14, color: THEME.textMid, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  rewardBtn:    { width: '100%', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  rewardBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  rewardBtnSecondary: { paddingVertical: 8 },
  rewardBtnSecTxt:    { color: THEME.textLight, fontSize: 14 },
});
