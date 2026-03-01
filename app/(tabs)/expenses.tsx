import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import ExpenseFiltersModal from "@/components/filter-modals/expense-filter";
import { useExpensesData } from "@/hooks/use-expenses-data";
import { deleteExpense } from "@/services/expense-service";
import { ExpenseFilters } from "@/types/common";
import { truncateText } from "@/utils/text";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import {
    Card,
    Chip,
    FAB,
    IconButton,
    Text,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExpenseListPage() {
    const theme = useTheme();
    const router = useRouter();


    const [filtersVisible, setFiltersVisible] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteing, setDeleting] = useState<boolean>(false);

    const [filters, setFilters] = useState<ExpenseFilters>({
        sortBy: "date",
        sortOrder: "desc",
    });

    const {
        loading,
        expenses,
        categoriesMap,
        paymentMethodsMap,
        expenseRecoveryMap,
    } = useExpensesData(filters);

    const showFiltersHandler = useCallback(() => {
        setFiltersVisible(true);
    }, []);

    const handleCancelDelete = useCallback(() => {
        setDeleteId(null);
    }, [])

    const handleDelete = useCallback(async () => {
        if (!deleteId)
            return;
        try {
            setDeleting(true)
            await deleteExpense(deleteId);
        }
        catch (error) {
            console.error('something went wrong while deleting expense', error)
        }
        finally {
            setDeleteId(null)
            setDeleting(false);
        }
    }, [deleteId]);

    if (loading || deleteing) {
        return <Loading />
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            paddingHorizontal: 16,
            backgroundColor: theme.colors.background,
        }}>
            <Header
                title="All Expenses"
                icon="filter-variant"
                onPress={showFiltersHandler}
            />

            <FlatList
                contentContainerStyle={{ gap: 12 }}
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const hasIouAttached = !!expenseRecoveryMap[item.id]
                    const recoveredAmount = expenseRecoveryMap[item.id] ?? 0;
                    const netCost = Math.max(item.amount - recoveredAmount, 0);

                    return (
                        <Card onPress={() => router.push(`/expense/${item.id}`)}>
                            <Card.Content>

                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text variant="titleMedium">
                                        ₹ {netCost}
                                    </Text>

                                    <Text variant="bodySmall">
                                        {item.date.toDateString()}
                                    </Text>
                                </View>

                                <Text variant="bodyMedium">
                                    {item.description}
                                </Text>

                                {
                                    hasIouAttached && (
                                        <View style={{ marginTop: 6 }}>
                                            <Text variant="bodySmall">
                                                Paid by you: ₹ {item.amount}
                                            </Text>
                                            <Text variant="bodySmall">
                                                Recovered: ₹ {recoveredAmount}
                                            </Text>
                                            <Text variant="bodySmall">
                                                Net cost: ₹ {netCost}
                                            </Text>
                                        </View>

                                    )
                                }

                                <View style={{ flexDirection: "column", justifyContent: 'space-between', marginTop: 8 }}>
                                    <View style={{ flexDirection: "row", gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Chip
                                            style={{
                                                backgroundColor:
                                                    categoriesMap[item.category.id]?.color ?? "#E0E0E0",
                                            }}
                                            textStyle={{ color: "white" }}
                                            icon={categoriesMap[item.category.id]?.icon}
                                        >
                                            {truncateText(categoriesMap[item.category.id]?.name)}
                                        </Chip>

                                        <IconButton
                                            icon="cash-refund"
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                router.push({
                                                    pathname: "/iou/create" as any,
                                                    params: { expenseId: item.id },
                                                });
                                            }}
                                        />
                                    </View>

                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
                                        <Chip
                                            style={{
                                                backgroundColor:
                                                    paymentMethodsMap[item.paymentMethod.id]?.color ?? "#E0E0E0",
                                            }}
                                            textStyle={{ color: "white" }}
                                        >
                                            {truncateText(paymentMethodsMap[item.paymentMethod.id]?.name)}
                                        </Chip>

                                        <IconButton
                                            icon="delete"
                                            iconColor={theme.colors.error}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                setDeleteId(item.id)
                                            }}
                                        />
                                    </View>
                                </View>



                            </Card.Content>
                        </Card>
                    )
                }}
            />

            <FAB
                icon="plus"
                style={{
                    position: "absolute",
                    right: 16,
                    bottom: 16,
                }}
                onPress={() => router.push("/expense/create")}
            />

            <ExpenseFiltersModal
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
