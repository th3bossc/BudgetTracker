import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { useBankAccountsData } from "@/hooks/use-bank-accounts-data";
import { addBankAccountBalanceAdjustment } from "@/services/bank-account-balance-adjustment-service";
import { deleteBankAccount } from "@/services/bank-account-service";
import { getMonthKey } from "@/utils/date";
import { formatCurrency } from "@/utils/number";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import {
    Button,
    Card,
    Chip,
    Dialog,
    FAB,
    IconButton,
    Portal,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BankAccountsPage() {
    const theme = useTheme();
    const router = useRouter();

    const { loading, accounts } = useBankAccountsData();

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    const [adjustAccountId, setAdjustAccountId] = useState<string | null>(null);
    const [targetBalance, setTargetBalance] = useState<string>("");
    const [adjusting, setAdjusting] = useState<boolean>(false);
    const [adjustError, setAdjustError] = useState<string | null>(null);

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

    const handleAdjustBalance = useCallback(async () => {
        if (!selectedAdjustAccount) {
            return;
        }

        const parsedTarget = Number(targetBalance);
        if (!targetBalance || Number.isNaN(parsedTarget)) {
            setAdjustError("Enter a valid target balance.");
            return;
        }

        const delta = parsedTarget - selectedAdjustAccount.currentBalance;
        if (delta === 0) {
            setAdjustError("Target balance is already current balance.");
            return;
        }

        try {
            setAdjusting(true);
            await addBankAccountBalanceAdjustment({
                bankAccount: { id: selectedAdjustAccount.id },
                amount: delta,
                note: "Manual balance sync",
                date: new Date(),
                monthKey: getMonthKey(new Date()),
            });
            setAdjustAccountId(null);
            setTargetBalance("");
            setAdjustError(null);
        } catch (error) {
            console.error("failed to adjust balance", error);
            setAdjustError("Unable to adjust balance right now.");
        } finally {
            setAdjusting(false);
        }
    }, [selectedAdjustAccount, targetBalance]);

    if (loading || deleting) {
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
            <Header title="Bank Accounts" />

            <FlatList
                contentContainerStyle={{ gap: 12 }}
                data={accounts}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text variant="bodyLarge" style={{ textAlign: "center", marginTop: 16 }}>
                        No bank accounts yet.
                    </Text>
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
                                        setTargetBalance(item.currentBalance.toString());
                                        setAdjustError(null);
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

            <Portal>
                <Dialog visible={!!adjustAccountId} onDismiss={() => setAdjustAccountId(null)}>
                    <Dialog.Title>Set Current Balance</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
                            Account: {selectedAdjustAccount?.name ?? "-"}
                        </Text>
                        <TextInput
                            label="Target Balance"
                            value={targetBalance}
                            onChangeText={setTargetBalance}
                            keyboardType="numeric"
                            mode="outlined"
                            error={!!adjustError}
                        />
                        {adjustError ? (
                            <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.error }}>
                                {adjustError}
                            </Text>
                        ) : null}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setAdjustAccountId(null)}>Cancel</Button>
                        <Button loading={adjusting} onPress={handleAdjustBalance}>
                            Save
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}
