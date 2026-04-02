import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import MockTestScreen from '../screens/MockTestScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useSettingsStore } from '../store/settingsStore';

const Tab = createBottomTabNavigator<BottomTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export function BottomTabNavigator() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  const bg = darkMode ? '#0F172A' : '#FFFFFF';
  const active = '#1A56A0';
  const inactive = darkMode ? '#64748B' : '#94A3B8';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: bg, borderTopColor: darkMode ? '#1E293B' : '#E2E8F0' },
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [IoniconsName, IoniconsName]> = {
            HomeTab: ['home', 'home-outline'],
            MockTestTab: ['clipboard', 'clipboard-outline'],
            ProgressTab: ['bar-chart', 'bar-chart-outline'],
            SettingsTab: ['settings', 'settings-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['help-circle', 'help-circle-outline'];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="MockTestTab" component={MockTestScreen} options={{ title: 'Mock Test' }} />
      <Tab.Screen name="ProgressTab" component={ProgressScreen} options={{ title: 'Progress' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
