import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WORLDS } from '../constants/worlds';
import { StorageService } from '../services/StorageService';
import RewardBadge from '../components/RewardBadge';
import { THEME } from '../constants/theme';

export default function RewardRoom({ navigation }) {
  const [activeWorld, setActiveWorld] = useState(WORLDS[0]);
  const [relics, setRelics]           = useState([]);

  useFocusEffect(
    useCallback(() => {
      StorageService.getActiveWorld().then(w => { if (w) setActiveWorld(w); });
      StorageService.getRelics().then(r => setRelics([...r].reverse()));
    }, []),
  );

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: activeWorld.bgColor }]}>
      {/* Header */}
      <View style={[styles.headerBar, { backgroundColor: activeWorld.headerBg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏆 Trophy Room</Text>
        <View style={{ width: 60 }} />
      </View>

      {relics.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{activeWorld.guideEmoji}</Text>
          <Text style={[styles.emptyTitle, { color: activeWorld.primaryColor }]}>No Relics Yet!</Text>
          <Text style={[styles.emptyMsg, { color: activeWorld.textColor }]}>
            Complete quests to fill your trophy room, {activeWorld.terms.hero}!
          </Text>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: activeWorld.buttonColor }]}
            onPress={() => navigation.navigate('MagicCamera', { world: activeWorld })}
          >
            <Text style={styles.startBtnTxt}>Start First Quest!</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          <Text style={[styles.count, { color: activeWorld.primaryColor }]}>
            {relics.length} {relics.length === 1 ? 'Relic' : 'Relics'} Collected
          </Text>
          <View style={styles.badgeRow}>
            {relics.map((relic, i) => (
              <RewardBadge key={relic.id || i} relic={relic} index={i} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill:   { flex: 1 },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    marginBottom: 4,
  },
  back:   { width: 60 },
  backTxt:{ color: '#FFF', fontSize: 15 },
  title:  { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  empty:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 12 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  emptyMsg:   { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  startBtn:   { borderRadius: THEME.radiusBtn, paddingVertical: 14, paddingHorizontal: 28 },
  startBtnTxt:{ color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  grid:   { padding: 16, paddingBottom: 40 },
  count:  { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
