import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { migrateStorageSchema, StorageService } from './src/services/StorageService';
import WorldDashboard from './src/screens/WorldDashboard';
import HeroProfiler from './src/screens/HeroProfiler';
import MagicCamera from './src/screens/MagicCamera';
import QuestDisplay from './src/screens/QuestDisplay';
import RewardRoom from './src/screens/RewardRoom';
import Settings from './src/screens/Settings';
import ParentalConsent from './src/screens/ParentalConsent';
import ParentalDashboard from './src/screens/ParentalDashboard';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        // Run storage migration
        await migrateStorageSchema();

        // Check parental consent status
        const consentStatus = await StorageService.getParentalConsent();
        setHasConsent(consentStatus === 'verified');
      } catch (error) {
        console.error('Initialization failed:', error);
        // Continue anyway with defaults
      } finally {
        setIsReady(true);
      }
    }
    initialize();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' }}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Loading QuestLens...</Text>
      </View>
    );
  }

  // COPPA compliance: require parental consent before app access
  if (!hasConsent) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ParentalConsent onConsentGranted={() => setHasConsent(true)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="WorldDashboard"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="WorldDashboard" component={WorldDashboard} />
          <Stack.Screen name="HeroProfiler" component={HeroProfiler} />
          <Stack.Screen name="MagicCamera" component={MagicCamera} />
          <Stack.Screen name="QuestDisplay" component={QuestDisplay} />
          <Stack.Screen name="RewardRoom" component={RewardRoom} />
          <Stack.Screen name="Settings" component={Settings} />          <Stack.Screen name="ParentalDashboard" component={ParentalDashboard} />        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

