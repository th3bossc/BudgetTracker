import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View } from "react-native";
import {
    Appbar,
    Card,
    Chip,
    Text,
    FAB,
    useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useIncomesData } from "@/hooks/use-incomes-data";
import type { IncomeFilters } from "@/types/common";
import IncomeFiltersModal from "@/components/filter-modals/incomes-filters";
import Loading from "@/components/loading";

export default function IncomeListPage() {
    const theme = useTheme();
    const router = useRouter();

    const [filters, setFilters] = useState<IncomeFilters>({
        sortBy: "date",
        sortOrder: "desc",
    });

    const [filtersVisible, setFiltersVisible] = useState(false);

    const {
        loading,
        incomes,
        sourcesMap,
    } = useIncomesData(filters);

    if (loading) {
        return <Loading />
    }


    return (
        <SafeAreaView style={{ 
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
        }}>
            <Appbar.Header>
                <Appbar.Content title="All Incomes" />
                <Appbar.Action
                    icon="filter-variant"
                    onPress={() => setFiltersVisible(true)}
                />
            </Appbar.Header>

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

                            <View style={{ marginTop: 8 }}>
                                <Chip>
                                    {sourcesMap[item.source.id]?.name}
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
                onPress={() => router.push("/income/create")}
            />

            <IncomeFiltersModal
                visible={filtersVisible}
                onDismiss={() => setFiltersVisible(false)}
                filters={filters}
                setFilters={setFilters}
            />
        </SafeAreaView>
    );
}