import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import MockTestLandingScreen from '../screens/MockTestLandingScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { LearnNavigator } from './LearnNavigator';
import { colors, useTheme } from '../theme';

const Tab = createBottomTabNavigator<BottomTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof BottomTabParamList, [IoniconsName, IoniconsName]> = {
  HomeTab: ['home', 'home-outline'],
  LearnTab: ['library', 'library-outline'],
  MockTestTab: ['clipboard', 'clipboard-outline'],
  ProgressTab: ['bar-chart', 'bar-chart-outline'],
  SettingsTab: ['settings', 'settings-outline'],
};

export function BottomTabNavigator() {
  const t = useTheme();
  const inactiveTint = t.isDark ? '#64748B' : '#94A3B8';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: inactiveTint,
        tabBarIcon: ({ focused, color, size }) => {
          const [activeIcon, inactiveIcon] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? activeIcon : inactiveIcon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="LearnTab" component={LearnNavigator} options={{ title: 'Learn' }} />
      <Tab.Screen name="MockTestTab" component={MockTestLandingScreen} options={{ title: 'Mock Test' }} />
      <Tab.Screen name="ProgressTab" component={ProgressScreen} options={{ title: 'Progress' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
