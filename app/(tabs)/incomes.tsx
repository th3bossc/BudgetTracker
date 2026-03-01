import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import IncomeFiltersModal from "@/components/filter-modals/incomes-filters";
import { useIncomesData } from "@/hooks/use-incomes-data";
import { deleteIncome } from "@/services/income-service";
import type { IncomeFilters } from "@/types/common";
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

export default function IncomeListPage() {
    const theme = useTheme();
    const router = useRouter();

    const [filters, setFilters] = useState<IncomeFilters>({
        sortBy: "date",
        sortOrder: "desc",
    });

    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [filtersVisible, setFiltersVisible] = useState(false);

    const {
        loading,
        incomes,
        sourcesMap,
    } = useIncomesData(filters);

    const showFiltersHandler = useCallback(() => {
        setFiltersVisible(true);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!deleteId)
            return;

        try {
            setDeleting(true);
            await deleteIncome(deleteId);
        }
        catch (error) {
            console.error('something went wrong while deleting income', error)
        }
        finally {
            setDeleteId(null);
            setDeleting(false);
        }
    }, [deleteId]);

    const handleCancelDelete = useCallback(() => setDeleteId(null), []);

    if (loading || deleting) {
        return <Loading />
    }


    return (
        <SafeAreaView style={{ 
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
        }}>
            <Header
                title="All Incomes"
                icon="filter-variant"
                onPress={showFiltersHandler}
            />

            <FlatList
                contentContainerStyle={{ padding: 16, gap: 12 }}
                data={incomes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/income/${item.id}`)}>
                        <Card.Content>

                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text variant="titleMedium">
                                    ₹ {item.amount}
                                </Text>

                                <Text variant="bodySmall">
                                    {item.date.toDateString()}
                                </Text>
                            </View>

                            {item.description && (
                                <Text variant="bodyMedium">
                                    {item.description}
                                </Text>
                            )}
                            <View style={{ marginTop: 8, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                                <Chip
                                    style={{
                                        backgroundColor:
                                            sourcesMap[item.source.id]?.color ?? "#E0E0E0",
                                    }}
                                    textStyle={{ color: "white" }}
                                >
                                    {sourcesMap[item.source.id]?.name}
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
                onPress={() => router.push("/income/create")}
            />

            <IncomeFiltersModal
                visible={filtersVisible}
                onDismiss={() => setFiltersVisible(false)}
                filters={filters}
                setFilters={setFilters}
                style={{ backgroundColor: theme.colors.background }}
            />

            <DeleteConfirmationDialog
                visible={!!deleteId}
                onConfirm={handleDelete}
                onDismiss={handleCancelDelete}
            />
        </SafeAreaView>
    );
}