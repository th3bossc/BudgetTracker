import { AuthProvider } from "@/providers/auth-provider";
import NotificationBootstrap from "@/components/notifications/notification-bootstrap";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import "react-native-reanimated";
import { registerTranslation } from "react-native-paper-dates";
import { DATE_PICKER_TRANSLATIONS } from "@/translations/root";

const lightTheme = {
  ...MD3LightTheme,
};

const darkTheme = {
  ...MD3DarkTheme,
}

registerTranslation('en', DATE_PICKER_TRANSLATIONS.en)

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark'
    ? darkTheme
    : lightTheme;
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NotificationBootstrap />
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </AuthProvider>
    </PaperProvider>
  );
}
