export interface Palette {
  bg: string;
  card: string;
  surfaceAlt: string;
  text: string;
  sub: string;
  border: string;
}

export const light: Palette = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  text: '#1E293B',
  sub: '#64748B',
  border: '#E2E8F0',
};

export const dark: Palette = {
  bg: '#0F172A',
  card: '#1E293B',
  surfaceAlt: '#1E293B',
  text: '#F1F5F9',
  sub: '#94A3B8',
  border: '#1E293B',
};

export const colors = {
  primary: '#1A56A0',
  primaryTint: '#EFF6FF',
  success: '#16A34A',
  successBg: '#F0FDF4',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  warning: '#D97706',
  white: '#FFFFFF',
} as const;
