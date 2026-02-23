import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View } from "react-native";
import {
    Appbar,
    Card,
    Text,
    FAB,
    Switch,
    useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { useCallback } from "react";
import { updatePaymentMethod } from "@/services/payment-method-service";

export default function PaymentMethodListPage() {
    const router = useRouter();
    const theme = useTheme();
    const { incomeSources } = useFinanceConfig();

    const toggleArchive = useCallback(async (id: string, current: boolean) => {
        await updatePaymentMethod(id, {
            isArchived: !current,
        })
    }, []);

    const backAction = useCallback(() => router.back(), [router]);

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={backAction} />
                <Appbar.Content title="Payment Methods" />
            </Appbar.Header>

            <FlatList
                contentContainerStyle={{ padding: 16, gap: 12 }}
                data={incomeSources}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card
                        onPress={() =>
                            router.push(`/payment-method/${item.id}`)
                        }
                    >
                        <Card.Content
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text
                                style={{
                                    opacity: item.isArchived ? 0.5 : 1,
                                }}
                            >
                                {item.name}
                            </Text>

                            <Switch
                                value={!item.isArchived}
                                onValueChange={() =>
                                    toggleArchive(item.id, item.isArchived ?? false)
                                }
                            />
                        </Card.Content>
                    </Card>
                )}
            />

            <FAB
                icon="plus"
                style={{
                    position: "absolute",
                    right: 16,
                    bottom: 16,
                }}
                onPress={() =>
                    router.push("/payment-method/create")
                }
            />
        </SafeAreaView>
    );
}