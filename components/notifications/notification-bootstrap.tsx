import { useAuth } from "@/hooks/use-auth";
import {
    clearManagedScheduledNotifications,
    handleManagedNotificationResponse,
    initializeNotifications,
    syncManagedNotifications,
} from "@/services/notification-service";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { AppState } from "react-native";

export default function NotificationBootstrap() {
    const { user } = useAuth();

    useEffect(() => {
        initializeNotifications().catch((error) => {
            console.error("notification initialization failed", error);
        });
    }, []);

    useEffect(() => {
        if (!user) {
            clearManagedScheduledNotifications().catch((error) => {
                console.error("notification clear failed", error);
            });
            return;
        }

        syncManagedNotifications().catch((error) => {
            console.error("notification sync failed", error);
        });

        const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
            handleManagedNotificationResponse(response, (route) => {
                router.push(route as any);
            }).catch((error) => {
                console.error("notification action handling failed", error);
            });
        });

        const appStateSub = AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") {
                syncManagedNotifications().catch((error) => {
                    console.error("notification resync failed", error);
                });
            }
        });

        return () => {
            responseSub.remove();
            appStateSub.remove();
        };
    }, [user]);

    return null;
}
