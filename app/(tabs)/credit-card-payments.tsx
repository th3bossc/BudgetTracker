import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import {
    deleteCreditCardPayment,
    subscribeToCreditCardPayments,
} from "@/services/credit-card-payment-service";
import type { CreditCardPayment } from "@/types/schema";
import { formatCurrency } from "@/utils/number";
import { truncateText } from "@/utils/text";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { Card, Chip, FAB, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreditCardPaymentsPage() {
    const theme = useTheme();
    const router = useRouter();
    const { loading: configLoading, paymentMethods, bankAccounts } = useFinanceConfig();

    const [payments, setPayments] = useState<CreditCardPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToCreditCardPayments((items) => {
            setPayments(items);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const paymentMethodsMap = useMemo(() => {
        return paymentMethods.reduce<Record<string, typeof paymentMethods[number]>>((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }, [paymentMethods]);

    const bankAccountsMap = useMemo(() => {
        return bankAccounts.reduce<Record<string, typeof bankAccounts[number]>>((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }, [bankAccounts]);

    const handleDelete = useCallback(async () => {
        if (!deleteId) {
            return;
        }

        try {
            setDeleting(true);
            await deleteCreditCardPayment(deleteId);
        } catch (error) {
            console.error("something went wrong while deleting credit card payment", error);
        } finally {
            setDeleteId(null);
            setDeleting(false);
        }
    }, [deleteId]);

    if (loading || configLoading || deleting) {
        return <Loading />;
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                paddingHorizontal: 16,
                backgroundColor: theme.colors.background,
            }}
        >
            <Header title="Credit Card Payments" />

            <FlatList
                contentContainerStyle={{ gap: 12 }}
                data={payments}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text variant="bodyLarge" style={{ textAlign: "center", marginTop: 16 }}>
                        No credit card payments yet.
                    </Text>
                }
                renderItem={({ item }) => {
                    const paymentMethod = paymentMethodsMap[item.paymentMethod.id];
                    const bankAccount = bankAccountsMap[item.bankAccount.id];

                    return (
                        <Card>
                            <Card.Content>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text variant="titleMedium">{formatCurrency(item.amount)}</Text>
                                    <Text variant="bodySmall">{item.date.toDateString()}</Text>
                                </View>

                                {item.description ? (
                                    <Text variant="bodyMedium" style={{ marginTop: 6 }}>
                                        {item.description}
                                    </Text>
                                ) : null}

                                <Text variant="bodySmall" style={{ marginTop: 6 }}>
                                    Month: {item.monthKey}
                                </Text>

                                <View style={{ marginTop: 10, gap: 8 }}>
                                    <Chip
                                        style={{
                                            backgroundColor: "transparent",
                                            borderWidth: 1,
                                            borderColor: paymentMethod?.color ?? theme.colors.outline,
                                        }}
                                        textStyle={{ color: paymentMethod?.color ?? theme.colors.onSurface }}
                                        icon={paymentMethod?.icon ?? "credit-card"}
                                    >
                                        {truncateText(paymentMethod?.name) ?? "Unknown card"}
                                    </Chip>

                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                        <Chip
                                            style={{
                                                backgroundColor: "transparent",
                                                borderWidth: 1,
                                                borderColor: theme.colors.outline,
                                            }}
                                            textStyle={{ color: theme.colors.onSurface }}
                                            icon="bank-outline"
                                        >
                                            {truncateText(bankAccount?.name) ?? "Unknown account"}
                                        </Chip>

                                        <IconButton
                                            icon="delete"
                                            iconColor={theme.colors.error}
                                            onPress={() => setDeleteId(item.id)}
                                        />
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    );
                }}
            />

            <FAB
                icon="plus"
                style={{
                    position: "absolute",
                    right: 16,
                    bottom: 16,
                }}
                onPress={() => router.push("/credit-card-payment/create")}
            />

            <DeleteConfirmationDialog
                visible={!!deleteId}
                onConfirm={handleDelete}
                onDismiss={() => setDeleteId(null)}
            />
        </SafeAreaView>
    );
}
