/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#171A1F', background: '#F5F6FA', tint: '#635BFF', icon: '#687184',
    tabIconDefault: '#687184', tabIconSelected: '#635BFF', surface: '#FFFFFF',
    surfaceVariant: '#EAEBF3', outline: '#D7D9E3', positive: '#168B68', negative: '#D34F68',
  },
  dark: {
    text: '#F3F4FA', background: '#101117', tint: '#A49CFF', icon: '#A3A5B5',
    tabIconDefault: '#A3A5B5', tabIconSelected: '#A49CFF', surface: '#191A23',
    surfaceVariant: '#242530', outline: '#393A48', positive: '#5CD6AE', negative: '#FF7489',
  },
};

export const PaperThemes = {
  light: {
    dark: false,
    roundness: 8,
    colors: {
      primary: '#635BFF', onPrimary: '#FFFFFF', primaryContainer: '#E7E5FF', onPrimaryContainer: '#211A83',
      secondary: '#7662D9', onSecondary: '#FFFFFF', secondaryContainer: '#EEE9FF', onSecondaryContainer: '#2D205F',
      tertiary: '#168B68', onTertiary: '#FFFFFF', tertiaryContainer: '#C8F3E4', onTertiaryContainer: '#003829',
      error: '#D34F68', onError: '#FFFFFF', errorContainer: '#FFE0E5', onErrorContainer: '#601827',
      background: '#F5F6FA', onBackground: '#171A1F', surface: '#FFFFFF', onSurface: '#171A1F',
      surfaceVariant: '#EAEBF3', onSurfaceVariant: '#5F6372', outline: '#777B8A', outlineVariant: '#D7D9E3',
      inverseSurface: '#2B2C36', inverseOnSurface: '#F1F0F7', inversePrimary: '#C2BCFF', shadow: '#000000',
      scrim: '#000000', backdrop: 'rgba(20, 20, 30, 0.4)', elevation: { level0: 'transparent', level1: '#FAFAFE', level2: '#F5F5FC', level3: '#F0F0FA', level4: '#EDEDF7', level5: '#E9E9F4' },
    },
  },
  dark: {
    dark: true,
    roundness: 8,
    colors: {
      primary: '#A49CFF', onPrimary: '#211A5C', primaryContainer: '#393184', onPrimaryContainer: '#E7E3FF',
      secondary: '#C1B5FF', onSecondary: '#30245F', secondaryContainer: '#493D79', onSecondaryContainer: '#EEE8FF',
      tertiary: '#5CD6AE', onTertiary: '#003829', tertiaryContainer: '#00513D', onTertiaryContainer: '#B7F2DA',
      error: '#FF7489', onError: '#601827', errorContainer: '#812D41', onErrorContainer: '#FFD9DF',
      background: '#101117', onBackground: '#F3F4FA', surface: '#191A23', onSurface: '#F3F4FA',
      surfaceVariant: '#242530', onSurfaceVariant: '#C2C3D1', outline: '#8B8D9D', outlineVariant: '#393A48',
      inverseSurface: '#E7E7F0', inverseOnSurface: '#292A34', inversePrimary: '#5147C9', shadow: '#000000',
      scrim: '#000000', backdrop: 'rgba(0, 0, 0, 0.55)', elevation: { level0: 'transparent', level1: '#1D1E28', level2: '#20212B', level3: '#23242F', level4: '#252631', level5: '#282934' },
    },
  },
};

export const AppSpacing = { screen: 20, section: 22, card: 16, compact: 10 } as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
