import { AuthProvider } from "@/providers/auth-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { ComponentType, useEffect, useState } from "react";
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
  const notificationsSupported = Constants.appOwnership !== "expo";
  const [NotificationBootstrap, setNotificationBootstrap] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!notificationsSupported) {
      setNotificationBootstrap(null);
      return;
    }

    let isMounted = true;

    void import("@/components/notifications/notification-bootstrap").then((module) => {
      if (isMounted) {
        setNotificationBootstrap(() => module.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [notificationsSupported]);

  const theme = scheme === 'dark'
    ? darkTheme
    : lightTheme;
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        {NotificationBootstrap ? <NotificationBootstrap /> : null}
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </AuthProvider>
    </PaperProvider>
  );
}
