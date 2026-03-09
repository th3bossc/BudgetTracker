import Loading from "@/components/common/loading";
import { useBulkPaymentChannelBudgets } from "@/hooks/use-bulk-payment-channel-budgets";
import { upsertPaymentChannelBudget } from "@/services/payment-channel-budget-service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, View } from "react-native";
import {
  Appbar,
  Button,
  Divider,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BulkPaymentChannelBudgetEditPage() {
    const theme = useTheme();
    const router = useRouter();

    const { monthKey } = useLocalSearchParams<{ monthKey: string }>();

    const {
        rows,
        updateAmount,
        loading,
        noPaymentMethods,
    } = useBulkPaymentChannelBudgets(monthKey);

    const handleSave = useCallback(async () => {
        for (const row of rows) {
            const amount = Number(row.amount);

            if (!amount || amount <= 0) continue;

            await upsertPaymentChannelBudget(row.paymentMethodId, monthKey, amount);
        }

        router.back();
    }, [rows, router, monthKey]);

    const textChangeHandler = useCallback((paymentMethodId: string) => (text: string) => updateAmount(paymentMethodId, text), [updateAmount]);

    if (loading) {
        return <Loading />;
    }

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Edit Payment Channel Budgets" />
            </Appbar.Header>

            <FlatList
                contentContainerStyle={{ padding: 16, gap: 16 }}
                data={rows}
                keyExtractor={(item) => item.paymentMethodId}
                renderItem={({ item }) => (
                    <View>
                        <Text variant="bodyMedium">
                            {item.paymentMethodName}
                        </Text>

                        <TextInput
                            value={item.amount}
                            onChangeText={textChangeHandler(item.paymentMethodId)}
                            keyboardType="numeric"
                            mode="outlined"
                            placeholder="Set monthly budget"
                        />
                    </View>
                )}
                ListEmptyComponent={
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 }}>
                        <Text variant="titleMedium">
                            No payment methods found
                        </Text>
                        <Text variant="bodyMedium" style={{ opacity: 0.6, textAlign: "center", marginTop: 8 }}>
                            Add payment methods first before setting budgets.
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    noPaymentMethods
                        ? null
                        : <>
                            <Divider style={{ marginVertical: 20 }} />

                            <Button
                                mode="contained"
                                onPress={handleSave}
                            >
                                Save Budgets for {monthKey}
                            </Button>
                        </>
                }
            />
        </SafeAreaView>
    );
}
