import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

const STAGE_ICONS = ['⚡', '⚔️', '🏆'];
const STAGE_ACCENT_OPACITIES = ['1A', '1A', '1A'];

export default function QuestCard({ content, title, index, accentColor, textColor, primaryColor }) {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor, backgroundColor: THEME.white }]}>
      <View style={[styles.header, { backgroundColor: accentColor + '20' }]}>
        <Text style={styles.icon}>{STAGE_ICONS[index] || '⚡'}</Text>
        <Text style={[styles.stageLabel, { color: primaryColor }]}>{title}</Text>
      </View>
      <Text style={[styles.content, { color: textColor }]}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: THEME.radiusCard,
    borderLeftWidth: 5,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...THEME.shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  icon: { fontSize: 20 },
  stageLabel: { fontSize: 15, fontWeight: 'bold', flex: 1 },
  content: { padding: 14, fontSize: 14, lineHeight: 22 },
});
