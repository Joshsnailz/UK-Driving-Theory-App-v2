import { useSettingsStore } from '../store/settingsStore';
import { dark, light, Palette } from './palette';

export interface Theme extends Palette {
  isDark: boolean;
}

export function useTheme(): Theme {
  const isDark = useSettingsStore((s) => s.darkMode);
  const palette = isDark ? dark : light;
  return { ...palette, isDark };
}
