import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import { WORLDS } from '../constants/worlds';
import { StorageService } from '../services/StorageService';
import { transformHomeworkToQuest, analyzeHomeworkImage } from '../services/AIService';

export default function MagicCamera({ navigation, route }) {
  const [activeWorld, setActiveWorld]   = useState(route.params?.world || WORLDS[0]);
  const [inputMode, setInputMode]       = useState('text'); // 'text' | 'camera'
  const [homeworkText, setHomeworkText] = useState('');
  const [photoUri, setPhotoUri]         = useState(null);
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    StorageService.getActiveWorld().then(w => { if (w) setActiveWorld(w); });
  }, []);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera needed', 'Please allow camera access to snap your homework.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setInputMode('camera');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setInputMode('camera');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const transformQuest = async () => {
    if (!homeworkText.trim() && !photoUri) {
      Alert.alert('Missing homework!', 'Type your homework or snap a photo first.');
      return;
    }
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const learningStyle  = await StorageService.getLearningStyle();
      const fixationLevel  = await StorageService.getFixationLevel();
      let quest;
      if (inputMode === 'camera' && photoUri) {
        const b64 = await FileSystem.readAsStringAsync(photoUri, { encoding: FileSystem.EncodingType.Base64 });
        quest = await analyzeHomeworkImage(b64, activeWorld, learningStyle, fixationLevel);
      } else {
        quest = await transformHomeworkToQuest(homeworkText, activeWorld, learningStyle, fixationLevel);
      }
      navigation.navigate('QuestDisplay', { quest, world: activeWorld });
    } catch (err) {
      Alert.alert('Oops!', 'Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[activeWorld.bgColor, activeWorld.primaryColor]} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={[styles.backTxt, { color: activeWorld.textColor }]}>← Back</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>📸 Magic Camera</Text>
          <Text style={[styles.subtitle, { color: activeWorld.textColor }]}>
            Show {activeWorld.guide} your homework!
          </Text>

          {/* Guide */}
          <View style={[styles.guideBubble, { backgroundColor: activeWorld.primaryColor + 'AA', borderColor: activeWorld.accentColor }]}>
            <Text style={styles.guideEmoji}>{activeWorld.guideEmoji}</Text>
            <Text style={[styles.guideText, { color: activeWorld.textColor }]}>
              Snap a photo of your homework OR type it below. I'll transform it into an epic quest!
            </Text>
          </View>

          {/* Camera buttons */}
          <View style={styles.camRow}>
            <TouchableOpacity
              style={[styles.camBtn, { backgroundColor: activeWorld.buttonColor }]}
              onPress={takePhoto}
            >
              <Text style={styles.camBtnIcon}>📷</Text>
              <Text style={styles.camBtnTxt}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.camBtn, { backgroundColor: activeWorld.primaryColor }]}
              onPress={pickFromLibrary}
            >
              <Text style={styles.camBtnIcon}>🖼️</Text>
              <Text style={styles.camBtnTxt}>From Library</Text>
            </TouchableOpacity>
          </View>

          {/* Photo preview */}
          {photoUri && (
            <View style={styles.photoWrap}>
              <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
              <TouchableOpacity
                style={styles.clearPhoto}
                onPress={() => { setPhotoUri(null); setInputMode('text'); }}
              >
                <Text style={styles.clearPhotoTxt}>✕ Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: activeWorld.textColor + '33' }]} />
            <Text style={[styles.dividerTxt, { color: activeWorld.textColor + '88' }]}>OR TYPE IT</Text>
            <View style={[styles.divider, { backgroundColor: activeWorld.textColor + '33' }]} />
          </View>

          {/* Text input */}
          <Text style={[styles.inputLabel, { color: activeWorld.accentColor }]}>
            {activeWorld.guideEmoji} Type your homework here:
          </Text>
          <TextInput
            style={[styles.textInput, { color: activeWorld.textColor, borderColor: activeWorld.accentColor + '66' }]}
            multiline
            placeholder={`What's the ${activeWorld.terms.quest}, ${activeWorld.terms.hero}? Paste it here...`}
            placeholderTextColor={activeWorld.textColor + '44'}
            value={homeworkText}
            onChangeText={text => { setHomeworkText(text); if (text) setInputMode('text'); }}
            textAlignVertical="top"
            numberOfLines={5}
          />

          {/* Transform button */}
          <TouchableOpacity
            style={[styles.transformBtn, { backgroundColor: loading ? '#555' : activeWorld.buttonColor }]}
            onPress={transformQuest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="large" />
            ) : (
              <>
                <Text style={styles.transformIcon}>⚡</Text>
                <Text style={styles.transformTxt}>TRANSFORM QUEST!</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill:      { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  back:      { marginBottom: 12 },
  backTxt:   { fontSize: 16 },
  title:     { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  subtitle:  { fontSize: 15, color: '#FFF', marginBottom: 16 },
  guideBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, borderWidth: 2, padding: 12, marginBottom: 20,
  },
  guideEmoji: { fontSize: 32 },
  guideText:  { flex: 1, fontSize: 13, lineHeight: 18 },
  camRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  camBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 16, alignItems: 'center', gap: 4,
    elevation: 3,
  },
  camBtnIcon: { fontSize: 28 },
  camBtnTxt:  { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  photoWrap:  { marginBottom: 16, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photo:      { width: '100%', height: 200 },
  clearPhoto: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#00000099', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  clearPhotoTxt: { color: '#FFF', fontWeight: 'bold' },
  dividerRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  divider:     { flex: 1, height: 1 },
  dividerTxt:  { fontSize: 12, fontWeight: 'bold' },
  inputLabel:  { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15,
    minHeight: 110, marginBottom: 20,
  },
  transformBtn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    elevation: 6, minHeight: 60,
  },
  transformIcon: { fontSize: 24 },
  transformTxt:  { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
});
