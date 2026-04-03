import { colors, useTheme } from '../theme';

/**
 * Centralised colour palette derived from the dark-mode setting.
 * Keeps screen components free of repeated ternary chains.
 */
export function usePalette() {
  const t = useTheme();
  return {
    dark: t.isDark,
    bg: t.bg,
    card: t.card,
    text: t.text,
    sub: t.sub,
    border: t.border,
    primary: colors.primary,
  } as const;
}
