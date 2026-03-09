import Loading from "@/components/common/loading";
import { useAuth } from "@/hooks/use-auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useTheme } from "react-native-paper";

export default function TabLayout() {
    const theme = useTheme();
    const { loading, user } = useAuth();

    if (loading) {
        return <Loading />
    }

    if (!user) {
        return <Redirect href='/login' />
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,

                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.outlineVariant,
                    height: 60,
                    paddingBottom: 6,
                    elevation: 4,
                },

                tabBarLabelStyle: {
                    fontWeight: '600'
                }

            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="view-dashboard"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="data-sources"
                options={{
                    title: "Data Sources",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="database-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="expenses"
                options={{
                    href: null,
                }}
            />

            <Tabs.Screen
                name="incomes"
                options={{
                    href: null,
                }}
            />

            <Tabs.Screen
                name="investments"
                options={{
                    href: null,
                }}
            />

            <Tabs.Screen
                name="ious"
                options={{
                    href: null,
                }}
            />

            <Tabs.Screen
                name="transfers"
                options={{
                    href: null,
                }}
            />

            <Tabs.Screen
                name="bank-accounts"
                options={{
                    href: null,
                }}
            />

            <Tabs.Screen
                name="finances"
                options={{
                    title: "Finances",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="abacus"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
