import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SpeechBubble({ guideEmoji, guideName, text, accentColor, textColor, bgColor }) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: accentColor + '33' }]}>
        <Text style={styles.avatarEmoji}>{guideEmoji}</Text>
      </View>
      <View style={[styles.bubble, { backgroundColor: bgColor, borderColor: accentColor }]}>
        <Text style={[styles.name, { color: accentColor }]}>{guideName}</Text>
        <Text style={[styles.text, { color: textColor }]}>{text}</Text>
        <View style={[styles.tail, { borderTopColor: bgColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarEmoji: { fontSize: 26 },
  bubble: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    position: 'relative',
  },
  tail: {
    position: 'absolute',
    left: -8,
    top: 14,
    borderWidth: 8,
    borderColor: 'transparent',
    borderRightColor: 'transparent',
  },
  name: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  text: { fontSize: 14, lineHeight: 20 },
});
