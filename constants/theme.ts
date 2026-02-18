/**
 * False App — Design System
 * Ultra-minimalist, strict dark mode tokens.
 */

export const Colors = {
  // Backgrounds
  background: '#000000',
  surface: '#121212',
  surfaceLight: '#1A1A1A',
  card: '#0A0A0A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',

  // Accent
  accent: '#2B58E5',

  // Borders / Separators
  border: '#2A2A2A',

  // Tab Bar
  tabBarBackground: '#000000',
  tabIconDefault: '#666666',
  tabIconActive: '#2B58E5',

  // Misc
  danger: '#E53935',
  success: '#4CAF50',
  overlay: 'rgba(0,0,0,0.6)',
  threadLine: '#2A2A2A',
  miniPlayerBg: '#0A4D34',
  miniPlayerBgFallback: '#1A1A1A',
  progressBar: '#FFFFFF',
  progressTrack: 'rgba(255,255,255,0.15)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
