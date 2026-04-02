import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/store/settingsStore';

export default function App() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style={darkMode ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
