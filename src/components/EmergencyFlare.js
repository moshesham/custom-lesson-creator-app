import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function EmergencyFlare({ onPress, isActive }) {
  const handlePress = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.btn, isActive && styles.btnActive]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>🚨</Text>
      <Text style={styles.label}>{isActive ? 'Back to Quest' : 'Emergency Flare'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B71C1C',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  btnActive: { backgroundColor: '#1565C0' },
  icon:  { fontSize: 20 },
  label: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});
