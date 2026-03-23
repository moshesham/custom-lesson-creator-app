import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STAGE_ICONS = ['⚡', '⚔️', '🏆'];

export default function QuestCard({ stage, content, title, index, accentColor, textColor, primaryColor }) {
  return (
    <View style={[styles.card, { borderColor: accentColor }]}>
      <View style={[styles.header, { backgroundColor: primaryColor + 'CC' }]}>
        <Text style={styles.icon}>{STAGE_ICONS[index] || '⚡'}</Text>
        <Text style={[styles.stageLabel, { color: accentColor }]}>{title}</Text>
      </View>
      <Text style={[styles.content, { color: textColor }]}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  icon: { fontSize: 20 },
  stageLabel: { fontSize: 15, fontWeight: 'bold', flex: 1 },
  content: { padding: 12, fontSize: 14, lineHeight: 22 },
});
