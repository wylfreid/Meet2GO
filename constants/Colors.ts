/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#4fc3f7';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f8f9fa',
    card: '#ffffff',
    cardSecondary: '#f1f3f5',
    tint: '#007AFF',
    icon: '#687076',
    border: '#dee2e6',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#010101',
    card: '#161b21',
    cardSecondary: '#161b21',
    tint: '#0A84FF',
    icon: '#9E9E9E',
    border: '#333333',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
