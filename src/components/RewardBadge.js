import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

const RANK_COLORS = ['#CD7F32', '#C0C0C0', '#FFD700', '#00BFFF', '#FF69B4'];
const RANK_LABELS = ['Bronze', 'Silver', 'Gold', 'Sapphire', 'Legendary'];

export default function RewardBadge({ relic, index }) {
  const rank = Math.min(Math.floor(index / 3), 4);
  return (
    <View style={[styles.badge, { borderTopColor: RANK_COLORS[rank] }]}>
      <Text style={styles.worldEmoji}>{relic.worldEmoji || '⭐'}</Text>
      <Text style={[styles.name, { color: RANK_COLORS[rank] }]} numberOfLines={1}>
        {relic.rewardName || 'Mystery Relic'}
      </Text>
      <Text style={styles.desc} numberOfLines={2}>
        {relic.rewardDescription || ''}
      </Text>
      <View style={[styles.rankBadge, { backgroundColor: RANK_COLORS[rank] }]}>
        <Text style={styles.rankText}>{RANK_LABELS[rank]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: '46%',
    margin: '2%',
    borderRadius: THEME.radiusCard,
    borderTopWidth: 5,
    padding: 14,
    backgroundColor: THEME.white,
    alignItems: 'center',
    ...THEME.shadow,
  },
  worldEmoji: { fontSize: 34, marginBottom: 6 },
  name:  { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  desc:  { fontSize: 11, color: THEME.textLight, textAlign: 'center', marginBottom: 8 },
  rankBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  rankText:  { fontSize: 10, color: '#FFF', fontWeight: 'bold' },
});
