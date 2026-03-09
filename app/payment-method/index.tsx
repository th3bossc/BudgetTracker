import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View } from "react-native";
import {
    Appbar,
    Card,
    Icon,
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
    const { paymentMethods, bankAccounts } = useFinanceConfig();
    const bankAccountsMap = bankAccounts.reduce<Record<string, string>>((acc, account) => {
        acc[account.id] = account.name;
        return acc;
    }, {});

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
                data={paymentMethods}
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
                            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                <Icon source={item.icon || "credit-card"} size={20} />
                                <View>
                                    <Text
                                        style={{
                                            opacity: item.isArchived ? 0.5 : 1,
                                        }}
                                    >
                                        {item.name}
                                    </Text>
                                    {item.bankAccount?.id ? (
                                        <Text variant="bodySmall">
                                            {bankAccountsMap[item.bankAccount.id] ?? "Unknown account"}
                                        </Text>
                                    ) : null}
                                </View>
                            </View>

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
