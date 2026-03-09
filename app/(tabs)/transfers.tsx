import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { useAccountTransfersData } from "@/hooks/use-account-transfers-data";
import { deleteAccountTransfer } from "@/services/account-transfer-service";
import { formatCurrency } from "@/utils/number";
import { truncateText } from "@/utils/text";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { Card, Chip, FAB, Icon, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransfersPage() {
    const theme = useTheme();
    const router = useRouter();

    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { loading, transfers, bankAccountsMap } = useAccountTransfersData();

    const handleDelete = useCallback(async () => {
        if (!deleteId) {
            return;
        }

        try {
            setDeleting(true);
            await deleteAccountTransfer(deleteId);
        } catch (error) {
            console.error("something went wrong while deleting transfer", error);
        } finally {
            setDeleteId(null);
            setDeleting(false);
        }
    }, [deleteId]);

    const handleCancelDelete = useCallback(() => setDeleteId(null), []);

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
            <Header title="Money Movements" />

            <FlatList
                contentContainerStyle={{ gap: 12 }}
                data={transfers}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text variant="bodyLarge" style={{ textAlign: "center", marginTop: 16 }}>
                        No money movements yet.
                    </Text>
                }
                renderItem={({ item }) => {
                    const fromAccount = bankAccountsMap[item.fromBankAccount.id];
                    const toAccount = bankAccountsMap[item.toBankAccount.id];

                    return (
                        <Card onPress={() => router.push(`/account-transfer/${item.id}`)}>
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

                                <View
                                    style={{
                                        marginTop: 10,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <Chip
                                            style={{
                                                backgroundColor: "transparent",
                                                borderWidth: 1,
                                                borderColor: theme.colors.outline,
                                            }}
                                            textStyle={{ color: theme.colors.onSurface }}
                                            icon="bank-outline"
                                        >
                                            {truncateText(fromAccount?.name) ?? "Unknown"}
                                        </Chip>

                                        <Icon source="arrow-right" size={16} color={theme.colors.onSurfaceVariant} />

                                        <Chip
                                            style={{
                                                backgroundColor: "transparent",
                                                borderWidth: 1,
                                                borderColor: theme.colors.outline,
                                            }}
                                            textStyle={{ color: theme.colors.onSurface }}
                                            icon="bank-outline"
                                        >
                                            {truncateText(toAccount?.name) ?? "Unknown"}
                                        </Chip>
                                    </View>

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
                onPress={() => router.push("/account-transfer/create")}
            />

            <DeleteConfirmationDialog
                visible={!!deleteId}
                onConfirm={handleDelete}
                onDismiss={handleCancelDelete}
            />
        </SafeAreaView>
    );
}
