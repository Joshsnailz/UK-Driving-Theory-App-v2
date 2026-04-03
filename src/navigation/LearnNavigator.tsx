import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { LearnStackParamList } from '../types';
import LearnHomeScreen from '../screens/learn/LearnHomeScreen';
import HighwayCodeListScreen from '../screens/learn/HighwayCodeListScreen';
import HighwayCodeSectionScreen from '../screens/learn/HighwayCodeSectionScreen';
import SignLibraryScreen from '../screens/learn/SignLibraryScreen';
import SignDetailScreen from '../screens/learn/SignDetailScreen';

const Stack = createStackNavigator<LearnStackParamList>();

export function LearnNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LearnHome" component={LearnHomeScreen} />
      <Stack.Screen name="HighwayCodeList" component={HighwayCodeListScreen} />
      <Stack.Screen name="HighwayCodeSection" component={HighwayCodeSectionScreen} />
      <Stack.Screen name="SignLibrary" component={SignLibraryScreen} />
      <Stack.Screen name="SignDetail" component={SignDetailScreen} />
    </Stack.Navigator>
  );
}
