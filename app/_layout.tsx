import { AuthProvider } from "@/providers/auth-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import "react-native-reanimated";

const lightTheme = {
  ...MD3LightTheme,
};

const darkTheme = {
  ...MD3DarkTheme,
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark'
    ? darkTheme
    : lightTheme;
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </AuthProvider>
    </PaperProvider>
  );
}