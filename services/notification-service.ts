import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getIous, markIouPaid } from "./iou-service";
import { getPaymentMethods } from "./payment-method-service";
import { formatCurrency } from "@/utils/number";

const MANAGED_BY = "budget-tracker-managed";
const IOU_ACTION_CATEGORY = "iou-actions";
const IOU_ACTION_MARK_PAID = "mark-iou-paid";
const IOU_ACTION_OPEN_UPDATE = "open-iou-update";

type ManagedNotificationData = {
    managedBy: string;
    type: "iou-weekly" | "credit-card-daily" | "credit-card-due";
    route?: string;
    iouId?: string;
    paymentMethodId?: string;
};

export const notificationsSupported = Platform.OS !== "web" && Constants.appOwnership !== "expo";

if (notificationsSupported) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

const getLastDayOfMonth = (year: number, monthIndex: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
};

const createDueDate = (year: number, monthIndex: number, dueDay: number) => {
    const day = Math.min(Math.max(dueDay, 1), getLastDayOfMonth(year, monthIndex));
    return new Date(year, monthIndex, day, 10, 0, 0, 0);
};

const toManagedData = (value: unknown): ManagedNotificationData | null => {
    if (!value || typeof value !== "object") {
        return null;
    }

    const data = value as Partial<ManagedNotificationData>;
    if (data.managedBy !== MANAGED_BY) {
        return null;
    }

    return data as ManagedNotificationData;
};

export const initializeNotifications = async () => {
    if (!notificationsSupported) {
        return;
    }

    await Notifications.setNotificationCategoryAsync(IOU_ACTION_CATEGORY, [
        {
            identifier: IOU_ACTION_MARK_PAID,
            buttonTitle: "Mark as Paid",
        },
        {
            identifier: IOU_ACTION_OPEN_UPDATE,
            buttonTitle: "Update",
        },
    ]);

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }
};

export const requestNotificationPermissions = async () => {
    if (!notificationsSupported) {
        return false;
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
        return true;
    }

    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
};

export const clearManagedScheduledNotifications = async () => {
    if (!notificationsSupported) {
        return;
    }

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
        scheduled
            .filter(item => toManagedData(item.content.data))
            .map(item => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );
};

export const syncManagedNotifications = async () => {
    if (!notificationsSupported) {
        return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
        return;
    }

    await clearManagedScheduledNotifications();

    const [ious, paymentMethods] = await Promise.all([
        getIous(),
        getPaymentMethods(),
    ]);

    const pendingIous = ious.filter(iou => !iou.isPaid && iou.amountLeft > 0);
    await Promise.all(pendingIous.map(async (iou) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Pending IOU Reminder",
                body: `${formatCurrency(iou.amountLeft)} is pending. Confirm if it has been paid back.`,
                categoryIdentifier: IOU_ACTION_CATEGORY,
                data: {
                    managedBy: MANAGED_BY,
                    type: "iou-weekly",
                    iouId: iou.id,
                    route: `/iou/${iou.id}`,
                } satisfies ManagedNotificationData,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: 2,
                hour: 9,
                minute: 0,
            },
        });
    }));

    const creditCards = paymentMethods.filter(
        method => !method.isArchived && method.isCreditCard
    );

    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    for (const card of creditCards) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${card.name}: Daily Card Usage Check`,
                body: card.creditLimit
                    ? `Track your usage for today. Limit: ${formatCurrency(card.creditLimit)}`
                    : "Track your usage for today.",
                data: {
                    managedBy: MANAGED_BY,
                    type: "credit-card-daily",
                    paymentMethodId: card.id,
                    route: `/payment-method/${card.id}`,
                } satisfies ManagedNotificationData,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 20,
                minute: 0,
            },
        });

        const dueDay = card.billingDueDay;
        if (!dueDay) {
            continue;
        }

        for (let monthOffset = 0; monthOffset < 12; monthOffset += 1) {
            const targetMonth = thisMonth + monthOffset;
            const dueDate = createDueDate(
                thisYear + Math.floor(targetMonth / 12),
                targetMonth % 12,
                dueDay
            );

            for (let daysBefore = 5; daysBefore >= 0; daysBefore -= 1) {
                const alertDate = new Date(dueDate);
                alertDate.setDate(dueDate.getDate() - daysBefore);

                if (alertDate <= now) {
                    continue;
                }

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `${card.name} Due Reminder`,
                        body: daysBefore === 0
                            ? "Credit card due date is today. Pay it off."
                            : `Credit card due in ${daysBefore} day(s).`,
                        data: {
                            managedBy: MANAGED_BY,
                            type: "credit-card-due",
                            paymentMethodId: card.id,
                            route: `/payment-method/${card.id}`,
                        } satisfies ManagedNotificationData,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: alertDate,
                    },
                });
            }
        }
    }
};

export const handleManagedNotificationResponse = async (
    response: Notifications.NotificationResponse,
    navigate: (route: string) => void
) => {
    const data = toManagedData(response.notification.request.content.data);
    if (!data) {
        return;
    }

    if (
        response.actionIdentifier === IOU_ACTION_MARK_PAID
        && data.type === "iou-weekly"
        && data.iouId
    ) {
        await markIouPaid(data.iouId);
        await syncManagedNotifications();
        navigate(`/iou/${data.iouId}`);
        return;
    }

    if (
        response.actionIdentifier === IOU_ACTION_OPEN_UPDATE
        && data.route
    ) {
        navigate(data.route);
        return;
    }

    if (data.route) {
        navigate(data.route);
    }
};
