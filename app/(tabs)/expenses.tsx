import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View } from "react-native";
import {
    Card,
    Chip,
    Text,
    useTheme,
    IconButton,
    FAB,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useExpensesData } from "@/hooks/use-expenses-data";
import ExpenseFiltersModal from "@/components/filter-modals/expense-filter";
import { ExpenseFilters } from "@/types/common";
import Loading from "@/components/loading";
import Header from "@/components/header";
import { deleteExpense } from "@/services/expense-service";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";

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
            padding: 16,
            backgroundColor: theme.colors.background,
        }}>
            <Header
                title="All Expenses"
                icon="filter-variant"
                onPress={showFiltersHandler}
            />

            <FlatList
                contentContainerStyle={{ padding: 16, gap: 12 }}
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/expense/${item.id}`)}>
                        <Card.Content>

                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text variant="titleMedium">
                                    ₹ {item.amount}
                                </Text>

                                <Text variant="bodySmall">
                                    {item.date.toDateString()}
                                </Text>
                            </View>

                            <Text variant="bodyMedium">
                                {item.description}
                            </Text>

                            <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: 8 }}>
                                <View style={{ flexDirection: "row", gap: 8, alignItems: 'center' }}>
                                    <Chip
                                        style={{
                                            backgroundColor:
                                                categoriesMap[item.category.id]?.color ?? "#E0E0E0",
                                        }}
                                        textStyle={{ color: "white" }}
                                        icon={categoriesMap[item.category.id]?.icon}
                                    >
                                        {categoriesMap[item.category.id]?.name}
                                    </Chip>

                                    <Chip
                                        style={{
                                            backgroundColor:
                                                paymentMethodsMap[item.paymentMethod.id]?.color ?? "#E0E0E0",
                                        }}
                                        textStyle={{ color: "white" }}
                                    >
                                        {paymentMethodsMap[item.paymentMethod.id]?.name}
                                    </Chip>
                                </View>

                                <IconButton
                                    icon="delete"
                                    iconColor={theme.colors.error}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setDeleteId(item.id)
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