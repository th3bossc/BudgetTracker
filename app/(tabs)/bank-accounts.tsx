import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { useBankAccountsData } from "@/hooks/use-bank-accounts-data";
import { useCreditCardData } from "@/hooks/use-credit-card-data";
import { addBankAccountBalanceAdjustment } from "@/services/bank-account-balance-adjustment-service";
import { deleteBankAccount } from "@/services/bank-account-service";
import type { BankAccountComputed } from "@/hooks/use-bank-accounts-data";
import { getMonthKey } from "@/utils/date";
import { formatCurrency } from "@/utils/number";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import {
    Button,
    Card,
    Chip,
    Dialog,
    FAB,
    Divider,
    IconButton,
    Portal,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface BalanceAdjustDialogProps {
    account: BankAccountComputed | null;
    visible: boolean;
    loading: boolean;
    onDismiss: () => void;
    onSubmit: (targetBalance: number) => Promise<void>;
}

function BalanceAdjustDialog({
    account,
    visible,
    loading,
    onDismiss,
    onSubmit,
}: BalanceAdjustDialogProps) {
    const theme = useTheme();
    const [targetBalance, setTargetBalance] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!visible || !account) {
            setTargetBalance("");
            setError(null);
            return;
        }

        setTargetBalance(account.currentBalance.toString());
        setError(null);
    }, [account, visible]);

    const handleSubmit = useCallback(async () => {
        if (!account) {
            return;
        }

        const parsedTarget = Number(targetBalance);
        if (!targetBalance || Number.isNaN(parsedTarget)) {
            setError("Enter a valid target balance.");
            return;
        }

        if (parsedTarget === account.currentBalance) {
            setError("Target balance is already current balance.");
            return;
        }

        try {
            await onSubmit(parsedTarget);
        } catch (submitError) {
            console.error("failed to adjust balance", submitError);
            setError("Unable to adjust balance right now.");
        }
    }, [account, onSubmit, targetBalance]);

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>Set Current Balance</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
                        Account: {account?.name ?? "-"}
                    </Text>
                    <TextInput
                        autoFocus
                        label="Target Balance"
                        value={targetBalance}
                        onChangeText={(value) => {
                            setTargetBalance(value);
                            if (error) {
                                setError(null);
                            }
                        }}
                        keyboardType="decimal-pad"
                        inputMode="decimal"
                        mode="outlined"
                        error={!!error}
                    />
                    {error ? (
                        <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.error }}>
                            {error}
                        </Text>
                    ) : null}
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>Cancel</Button>
                    <Button loading={loading} onPress={handleSubmit}>
                        Save
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

export default function BankAccountsPage() {
    const theme = useTheme();
    const router = useRouter();

    const { loading, accounts } = useBankAccountsData();
    const { loading: creditCardsLoading, creditCards } = useCreditCardData(getMonthKey(new Date()));

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    const [adjustAccountId, setAdjustAccountId] = useState<string | null>(null);
    const [adjusting, setAdjusting] = useState<boolean>(false);

    const selectedAdjustAccount = useMemo(
        () => accounts.find(item => item.id === adjustAccountId) ?? null,
        [accounts, adjustAccountId]
    );

    const handleDelete = useCallback(async () => {
        if (!deleteId) {
            return;
        }

        try {
            setDeleting(true);
            await deleteBankAccount(deleteId);
        } catch (error) {
            console.error("something went wrong while deleting account", error);
        } finally {
            setDeleteId(null);
            setDeleting(false);
        }
    }, [deleteId]);

    const handleAdjustBalance = useCallback(async (parsedTarget: number) => {
        if (!selectedAdjustAccount) {
            return;
        }

        const delta = parsedTarget - selectedAdjustAccount.currentBalance;

        setAdjusting(true);
        try {
            await addBankAccountBalanceAdjustment({
                bankAccount: { id: selectedAdjustAccount.id },
                amount: delta,
                note: "Manual balance sync",
                date: new Date(),
                monthKey: getMonthKey(new Date()),
            });
            setAdjustAccountId(null);
        } finally {
            setAdjusting(false);
        }
    }, [selectedAdjustAccount]);

    if (loading || creditCardsLoading || deleting) {
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
            <Header title="Bank Accounts & Credit Cards" />

            <FlatList
                contentContainerStyle={{ gap: 12, paddingBottom: 96 }}
                data={accounts}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text variant="bodyLarge" style={{ textAlign: "center", marginTop: 16 }}>
                        No bank accounts yet.
                    </Text>
                }
                ListFooterComponent={
                    <View style={{ gap: 12 }}>
                        <Divider style={{ marginVertical: 4 }} />
                        <Text variant="titleMedium">Credit Cards</Text>
                        {creditCards.length === 0 ? (
                            <Text variant="bodyMedium">No credit cards yet.</Text>
                        ) : creditCards.map((card) => (
                            <Card key={card.id}>
                                <Card.Content style={{ gap: 4 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text variant="titleMedium">{card.name}</Text>
                                        <Chip
                                            style={{
                                                backgroundColor: card.isOverLimit
                                                    ? theme.colors.errorContainer
                                                    : theme.colors.primaryContainer,
                                            }}
                                        >
                                            {card.netBalance < 0 ? "Credit" : "In Use"}
                                        </Chip>
                                    </View>
                                    <Text variant="bodyLarge">
                                        Used: {formatCurrency(card.amountUsed)}
                                        {typeof card.creditLimit === "number"
                                            ? ` / ${formatCurrency(card.creditLimit)}`
                                            : ""}
                                    </Text>
                                    <Text variant="bodySmall">
                                        Net Balance: {formatCurrency(card.netBalance)}
                                    </Text>
                                    <Text variant="bodySmall">
                                        This Month Payments: {formatCurrency(card.monthlyPayments)}
                                    </Text>
                                    <Button
                                        compact
                                        style={{ alignSelf: "flex-start", marginTop: 4 }}
                                        onPress={() => router.push({
                                            pathname: "/credit-card-payment/create",
                                            params: { paymentMethodId: card.id },
                                        })}
                                    >
                                        Record Payment
                                    </Button>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                }
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/bank-account/${item.id}`)}>
                        <Card.Content>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text variant="titleMedium">{item.name}</Text>

                                <Chip
                                    style={{
                                        backgroundColor: item.isBelowMinimum
                                            ? theme.colors.errorContainer
                                            : theme.colors.primaryContainer,
                                    }}
                                >
                                    {item.isBelowMinimum ? "Below Min" : "Healthy"}
                                </Chip>
                            </View>

                            <Text variant="bodyLarge" style={{ marginTop: 8 }}>
                                Balance: {formatCurrency(item.currentBalance)}
                            </Text>

                            <Text variant="bodySmall" style={{ marginTop: 2 }}>
                                Min Balance: {item.minimumBalance !== undefined
                                    ? formatCurrency(item.minimumBalance)
                                    : "Not set"}
                            </Text>

                            <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                                <Button
                                    compact
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setAdjustAccountId(item.id);
                                    }}
                                >
                                    Set Balance
                                </Button>

                                <IconButton
                                    icon="delete"
                                    iconColor={theme.colors.error}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setDeleteId(item.id);
                                    }}
                                />
                            </View>
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
                onPress={() => router.push("/bank-account/create")}
            />

            <DeleteConfirmationDialog
                visible={!!deleteId}
                onConfirm={handleDelete}
                onDismiss={() => setDeleteId(null)}
            />

            <BalanceAdjustDialog
                account={selectedAdjustAccount}
                visible={!!adjustAccountId}
                loading={adjusting}
                onDismiss={() => setAdjustAccountId(null)}
                onSubmit={handleAdjustBalance}
            />
        </SafeAreaView>
    );
}
