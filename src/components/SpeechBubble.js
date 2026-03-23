import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

export default function SpeechBubble({ guideEmoji, guideName, text, accentColor, textColor, bgColor }) {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor, backgroundColor: bgColor || THEME.white }]}>
      <View style={[styles.avatar, { backgroundColor: accentColor + '25' }]}>
        <Text style={styles.avatarEmoji}>{guideEmoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: accentColor }]}>{guideName}</Text>
        <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: THEME.radiusCard,
    borderLeftWidth: 5,
    padding: 14,
    gap: 10,
    ...THEME.shadow,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 26 },
  name: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  text: { fontSize: 14, lineHeight: 20 },
});
