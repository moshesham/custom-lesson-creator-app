import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { WORLDS } from '../constants/worlds';
import { StorageService } from '../services/StorageService';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

export default function WorldDashboard({ navigation }) {
  const [activeWorld, setActiveWorld] = useState(WORLDS[0]);
  const [relicCount, setRelicCount] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      StorageService.getActiveWorld().then(w => { if (w) setActiveWorld(w); });
      StorageService.getRelics().then(r => setRelicCount(r.length));
    }, []),
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const selectWorld = async (world) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveWorld(world);
    await StorageService.setActiveWorld(world);
  };

  return (
    <LinearGradient colors={[activeWorld.bgColor, activeWorld.primaryColor]} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>⚡ QuestLens</Text>
            <Text style={[styles.tagline, { color: activeWorld.accentColor }]}>
              Turn Boring into Boss Levels
            </Text>
          </View>
          <View style={styles.headerBtns}>
            <TouchableOpacity onPress={() => navigation.navigate('RewardRoom')} style={styles.iconBtn}>
              <Text style={styles.iconBtnTxt}>🏆</Text>
              {relicCount > 0 && (
                <View style={[styles.badge, { backgroundColor: activeWorld.accentColor }]}>
                  <Text style={styles.badgeTxt}>{relicCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
              <Text style={styles.iconBtnTxt}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Guide greeting ── */}
        <View style={[styles.guideCard, { backgroundColor: activeWorld.primaryColor + 'BB' }]}>
          <Text style={styles.guideEmoji}>{activeWorld.guideEmoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.guideName, { color: activeWorld.accentColor }]}>{activeWorld.guide}</Text>
            <Text style={[styles.guideText, { color: activeWorld.textColor }]}>
              {activeWorld.guideGreeting}
            </Text>
          </View>
        </View>

        {/* ── World grid ── */}
        <Text style={[styles.sectionTitle, { color: activeWorld.textColor }]}>Pick Your World</Text>
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {WORLDS.map((world) => {
            const isActive = world.id === activeWorld.id;
            return (
              <TouchableOpacity
                key={world.id}
                style={[
                  styles.worldCard,
                  { backgroundColor: world.primaryColor, borderColor: isActive ? world.accentColor : 'transparent', width: CARD_W },
                ]}
                onPress={() => selectWorld(world)}
                activeOpacity={0.85}
              >
                <Text style={styles.worldEmoji}>{world.emoji}</Text>
                <Text style={[styles.worldName, { color: world.textColor }]} numberOfLines={1}>{world.name}</Text>
                <Text style={[styles.worldGuide, { color: world.accentColor }]}>{world.guide}</Text>
                {isActive && (
                  <View style={[styles.activePip, { backgroundColor: world.accentColor }]}>
                    <Text style={styles.activePipTxt}>ACTIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Hero Profile button ── */}
        <TouchableOpacity
          style={[styles.profileBtn, { backgroundColor: activeWorld.primaryColor + 'CC' }]}
          onPress={() => navigation.navigate('HeroProfiler')}
        >
          <Text style={[styles.profileBtnTxt, { color: activeWorld.textColor }]}>🧙 Set Up My Hero</Text>
        </TouchableOpacity>

        {/* ── Magic Camera button ── */}
        <Animated.View style={[styles.cameraWrap, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={[styles.cameraBtn, { backgroundColor: activeWorld.buttonColor }]}
            onPress={() => navigation.navigate('MagicCamera', { world: activeWorld })}
            activeOpacity={0.85}
          >
            <Text style={styles.cameraBtnIcon}>📸</Text>
            <Text style={styles.cameraBtnTxt}>MAGIC CAMERA</Text>
            <Text style={[styles.cameraBtnSub, { color: activeWorld.accentColor }]}>
              Take a photo of your homework!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  appName:  { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  tagline:  { fontSize: 12 },
  headerBtns: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8, position: 'relative' },
  iconBtnTxt: { fontSize: 24 },
  badge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2,
  },
  badgeTxt: { fontSize: 10, color: '#FFF', fontWeight: 'bold' },
  guideCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, padding: 12, gap: 10,
  },
  guideEmoji: { fontSize: 36 },
  guideName:  { fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  guideText:  { fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 16, marginBottom: 8, opacity: 0.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  worldCard: {
    borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 2,
  },
  worldEmoji: { fontSize: 28, marginBottom: 4 },
  worldName:  { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  worldGuide: { fontSize: 11, marginTop: 2 },
  activePip: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activePipTxt: { fontSize: 10, color: '#FFF', fontWeight: 'bold' },
  profileBtn: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  profileBtnTxt: { fontSize: 14, fontWeight: '600' },
  cameraWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  cameraBtn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10,
  },
  cameraBtnIcon: { fontSize: 40 },
  cameraBtnTxt:  { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginTop: 4 },
  cameraBtnSub:  { fontSize: 13, marginTop: 2 },
});
