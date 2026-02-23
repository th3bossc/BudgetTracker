import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { Appbar, Button, Card, Divider, List, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfilePage = () => {
    const theme = useTheme();
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = useCallback(() => {
        logout();
        router.replace('/login');
    }, [logout]);

    const backAction = useCallback(() => {
        router.back();
    }, [router]);
    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={backAction} />
                <Appbar.Content title="Profile" />
            </Appbar.Header>

            <View style={{ padding: 16, gap: 16 }}>

                {/* User Info */}
                <Card>
                    <Card.Content>
                        <Text variant="titleMedium">
                            {user?.email}
                        </Text>

                        <Text
                            variant="bodySmall"
                            style={{ color: theme.colors.onSurfaceVariant }}
                        >
                            UID: {user?.uid}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Settings Section */}
                <Card>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                            Manage
                        </Text>

                        <List.Item
                            title="Expense Categories"
                            left={(props) => (
                                <List.Icon {...props} icon="shape" />
                            )}
                            onPress={() => router.push("/expense-category")}
                        />

                        <Divider />

                        <List.Item
                            title="Payment Methods"
                            left={(props) => (
                                <List.Icon {...props} icon="credit-card" />
                            )}
                            onPress={() => router.push("/payment-method")}
                        />

                        <Divider />

                        <List.Item
                            title="Income Sources"
                            left={(props) => (
                                <List.Icon {...props} icon="bank" />
                            )}
                            onPress={() => router.push("/income-source")}
                        />

                        <Divider />

                        <List.Item
                            title="Investment Types"
                            left={(props) => (
                                <List.Icon {...props} icon="chart-line" />
                            )}
                            onPress={() => router.push("/investment-type")}
                        />

                    </Card.Content>
                </Card>

                {/* Logout */}
                <Button
                    mode="contained"
                    buttonColor={theme.colors.error}
                    onPress={handleLogout}
                >
                    Logout
                </Button>

            </View>
        </SafeAreaView>
    )
}

export default ProfilePage;