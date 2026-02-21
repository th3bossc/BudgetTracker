import { useCallback, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View } from "react-native";
import {
    Appbar,
    Card,
    Chip,
    Text,
    useTheme,
    IconButton,
    FAB,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useExpensesData } from "@/hooks/use-expenses-data"; // assume you create this
import ExpenseFiltersModal from "@/components/filter-modals/expense-filter";
import { ExpenseFilters } from "@/types/common";
import Loading from "@/components/loading";
import Header from "@/components/header";

export default function ExpenseListPage() {
    const theme = useTheme();
    const router = useRouter();

    
    const [filtersVisible, setFiltersVisible] = useState(false);
    
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

    if (loading) {
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

                            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                                <Chip>
                                    {categoriesMap[item.category.id]?.name}
                                </Chip>

                                <Chip>
                                    {paymentMethodsMap[item.paymentMethod.id]?.name}
                                </Chip>
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
            />
        </SafeAreaView>
    );
}