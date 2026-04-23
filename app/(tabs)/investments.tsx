import AggregateSummary from "@/components/common/aggregate-summary";
import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import MonthGroupedList from "@/components/common/month-grouped-list";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import InvestmentFiltersModal from "@/components/filter-modals/investments-filter";
import { useInvestmentsData } from "@/hooks/use-investments-data";
import { deleteInvestment } from "@/services/investment-service";
import type { InvestmentFilters } from "@/types/common";
import { formatCurrency } from "@/utils/number";
import { truncateText } from "@/utils/text";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
    Card,
    Chip,
    FAB,
    IconButton,
    Text,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

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
        aggregateTotal,
        monthSections,
        typeMap,
    } = useInvestmentsData(filters);

    const [expandedMonthKeys, setExpandedMonthKeys] = useState<string[]>([]);

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

    useEffect(() => {
        setExpandedMonthKeys(prev => {
            const availableMonthKeys = new Set(monthSections.map(section => section.monthKey));
            const stillExpanded = prev.filter(monthKey => availableMonthKeys.has(monthKey));

            if (stillExpanded.length > 0) {
                return stillExpanded;
            }

            return monthSections[0] ? [monthSections[0].monthKey] : [];
        });
    }, [monthSections]);

    const toggleMonth = useCallback((monthKey: string) => {
        setExpandedMonthKeys(prev =>
            prev.includes(monthKey)
                ? prev.filter(item => item !== monthKey)
                : [...prev, monthKey]
        );
    }, []);

    if (loading || deleting) {
        return <Loading />
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            paddingHorizontal: 16,
            backgroundColor: theme.colors.background,
        }}>
            <Header
                title="All Investments"
                icon="filter-variant"
                onPress={showFiltersHandler}
            />

            <AggregateSummary
                label="Filtered Investments"
                itemCount={investments.length}
                total={aggregateTotal}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
                <MonthGroupedList
                    sections={monthSections}
                    expandedMonthKeys={expandedMonthKeys}
                    onToggleMonth={toggleMonth}
                    getItemKey={(item) => item.id}
                    emptyLabel="No investments found."
                    renderItem={(item) => (
                    <Card onPress={() => router.push(`/investment/${item.id}`)}>
                        <Card.Content>

                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text variant="titleMedium">
                                    {formatCurrency(item.amount)}
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
                                <Chip
                                    icon={typeMap[item.type.id]?.icon}
                                    style={{
                                        backgroundColor: "transparent",
                                        borderWidth: 1,
                                        borderColor: theme.colors.primary,
                                    }}
                                    textStyle={{ color: theme.colors.primary }}
                                >
                                    {truncateText(typeMap[item.type.id]?.name)}
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
            </ScrollView>

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
