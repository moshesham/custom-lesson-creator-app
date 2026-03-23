import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import WorldDashboard from './src/screens/WorldDashboard';
import HeroProfiler from './src/screens/HeroProfiler';
import MagicCamera from './src/screens/MagicCamera';
import QuestDisplay from './src/screens/QuestDisplay';
import RewardRoom from './src/screens/RewardRoom';
import Settings from './src/screens/Settings';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="WorldDashboard"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="WorldDashboard" component={WorldDashboard} />
          <Stack.Screen name="HeroProfiler"   component={HeroProfiler} />
          <Stack.Screen name="MagicCamera"    component={MagicCamera} />
          <Stack.Screen name="QuestDisplay"   component={QuestDisplay} />
          <Stack.Screen name="RewardRoom"     component={RewardRoom} />
          <Stack.Screen name="Settings"       component={Settings} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

