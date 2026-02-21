import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import "react-native-reanimated";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4CAF50", // finance vibe
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2E7D32',
  }
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark'
    ? darkTheme
    : lightTheme;
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}