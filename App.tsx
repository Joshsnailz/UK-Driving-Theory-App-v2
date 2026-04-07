import 'react-native-gesture-handler';
import { initialiseSentry } from './src/services/sentry';
// Initialise before the component tree renders so native crashes are captured.
initialiseSentry();
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { useSettingsStore } from './src/store/settingsStore';
import { useUserStore } from './src/store/userStore';
import { useEntitlementStore } from './src/store/entitlementStore';
import { initialiseAds } from './src/services/ads';
import { logInPurchases, logOutPurchases } from './src/services/purchases';
import { currentUser } from './src/services/auth';

export default function App() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const initialiseUser = useUserStore((s) => s.initialise);
  const initialiseEntitlements = useEntitlementStore((s) => s.initialise);

  // Bootstrap third-party SDKs once.
  useEffect(() => {
    initialiseUser();
    void initialiseEntitlements(currentUser()?.uid ?? null);
    void initialiseAds();
  }, [initialiseUser, initialiseEntitlements]);

  // Keep RevenueCat's app-user-id aligned with Firebase auth so
  // entitlements follow the user across devices.
  useEffect(
    () =>
      useUserStore.subscribe((state, prev) => {
        if (state.user?.uid === prev.user?.uid) return;
        if (state.user) void logInPurchases(state.user.uid);
        else void logOutPurchases();
      }),
    [],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppErrorBoundary>
          <AppNavigator />
          <StatusBar style={darkMode ? 'light' : 'dark'} />
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
