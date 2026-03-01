import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import IousFiltersModal from "@/components/filter-modals/ious-filters";
import { useIousData } from "@/hooks/use-ious-data";
import { deleteIou, markIouPaid } from "@/services/iou-service";
import type { IouFilters } from "@/types/common";
import { truncateText } from "@/utils/text";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import {
    Button,
    Card,
    Chip,
    IconButton,
    Text,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IousPage() {
    const theme = useTheme();
    const router = useRouter();

    const [filtersVisible, setFiltersVisible] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);

    const [filters, setFilters] = useState<IouFilters>({
        sortBy: "date",
        sortOrder: "desc",
    });

    const {
        loading,
        ious,
        expensesMap,
        paymentMethodsMap,
    } = useIousData(filters);

    const showFiltersHandler = useCallback(() => {
        setFiltersVisible(true);
    }, []);

    const handleCancelDelete = useCallback(() => {
        setDeleteId(null);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!deleteId)
            return;

        try {
            setProcessing(true);
            await deleteIou(deleteId);
        } catch (error) {
            console.error("something went wrong while deleting IOU", error);
        } finally {
            setDeleteId(null);
            setProcessing(false);
        }
    }, [deleteId]);

    const handleMarkAsPaid = useCallback(async (iouId: string) => {
        try {
            setProcessing(true);
            await markIouPaid(iouId);
        } catch (error) {
            console.error("something went wrong while updating IOU", error);
        } finally {
            setProcessing(false);
        }
    }, []);

    if (loading || processing) {
        return <Loading />;
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
        }}>
            <Header
                title="IOUs"
                icon="filter-variant"
                onPress={showFiltersHandler}
            />

            <FlatList
                contentContainerStyle={{ padding: 16, gap: 12 }}
                data={ious}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text variant="bodyLarge" style={{ textAlign: "center", marginTop: 16 }}>
                        No IOUs yet.
                    </Text>
                }
                renderItem={({ item }) => {
                    const expense = expensesMap[item.expense.id];
                    const paymentMethod = paymentMethodsMap[item.paymentMethod.id];
                    const amountPaid = Math.max(item.initialAmount - item.amountLeft, 0);

                    return (
                        <Card onPress={() => router.push(`/iou/${item.id}` as any)}>
                            <Card.Content>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text variant="titleMedium">
                                        Left: ₹ {item.amountLeft}
                                    </Text>

                                    <Chip
                                        compact
                                        style={{
                                            backgroundColor: item.isPaid
                                                ? theme.colors.primaryContainer
                                                : theme.colors.secondaryContainer,
                                        }}
                                    >
                                        {item.isPaid ? "Paid" : "Open"}
                                    </Chip>
                                </View>

                                <Text variant="bodyMedium" style={{ marginTop: 6 }}>
                                    Expense: {expense?.description || `#${item.expense.id}`}
                                </Text>

                                <Text variant="bodySmall" style={{ marginTop: 2 }}>
                                    Created: {item.createdAt.toDateString()}
                                </Text>

                                <Text variant="bodySmall" style={{ marginTop: 2 }}>
                                    Paid: ₹ {amountPaid} / ₹ {item.initialAmount}
                                </Text>

                                <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Chip
                                        style={{
                                            backgroundColor: paymentMethod?.color ?? "#E0E0E0",
                                        }}
                                        textStyle={{ color: "white" }}
                                    >
                                        {truncateText(paymentMethod?.name) ?? "Unknown Method"}
                                    </Chip>

                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        {!item.isPaid && (
                                            <Button
                                                compact
                                                mode="text"
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    void handleMarkAsPaid(item.id);
                                                }}
                                            >
                                                Mark Paid
                                            </Button>
                                        )}

                                        <IconButton
                                            icon="delete"
                                            iconColor={theme.colors.error}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                setDeleteId(item.id);
                                            }}
                                        />
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    );
                }}
            />

            <IousFiltersModal
                visible={filtersVisible}
                onDismiss={() => setFiltersVisible(false)}
                filters={filters}
                setFilters={setFilters}
                style={{ backgroundColor: theme.colors.background }}
            />

            <DeleteConfirmationDialog
                visible={!!deleteId}
                onDismiss={handleCancelDelete}
                onConfirm={handleDelete}
            />
        </SafeAreaView>
    );
}
