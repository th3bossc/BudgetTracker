import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View } from "react-native";
import {
    Card,
    Chip,
    Text,
    FAB,
    useTheme,
    IconButton,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useInvestmentsData } from "@/hooks/use-investments-data";
import type { InvestmentFilters } from "@/types/common";
import InvestmentFiltersModal from "@/components/filter-modals/investments-filter";
import Loading from "@/components/loading";
import Header from "@/components/header";
import { deleteInvestment } from "@/services/investment-service";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";

export default function InvestmentListPage() {
    const router = useRouter();
    const theme = useTheme();

    const [filters, setFilters] = useState<InvestmentFilters>({
        sortBy: "date",
        sortOrder: "desc",
    });
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [filtersVisible, setFiltersVisible] = useState(false);

    const {
        loading,
        investments,
        typeMap,
    } = useInvestmentsData(filters);

    const showFiltersHandler = useCallback(() => {
        setFiltersVisible(true);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!deleteId)
            return;

        try {
            setDeleting(true);
            await deleteInvestment(deleteId);
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
                title="All Investments"
                icon="filter-variant"
                onPress={showFiltersHandler}
            />

            <FlatList
                contentContainerStyle={{ padding: 16, gap: 12 }}
                data={investments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/investment/${item.id}`)}>
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
                                {item.name}
                            </Text>

                            {item.description && (
                                <Text variant="bodySmall">
                                    {item.description}
                                </Text>
                            )}

                            <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip>
                                    {typeMap[item.type.id]?.name}
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
                onPress={() => router.push("/investment/create")}
            />

            <InvestmentFiltersModal
                visible={filtersVisible}
                onDismiss={() => setFiltersVisible(false)}
                filters={filters}
                setFilters={setFilters}
            />

            <DeleteConfirmationDialog
                visible={!!deleteId}
                onConfirm={handleDelete}
                onDismiss={handleCancelDelete}
            />
        </SafeAreaView>
    );
}