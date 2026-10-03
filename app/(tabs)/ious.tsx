import AggregateSummary from "@/components/common/aggregate-summary";
import TransactionRow from "@/components/common/transaction-row";
import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import MonthGroupedList from "@/components/common/month-grouped-list";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import IousFiltersModal from "@/components/filter-modals/ious-filters";
import { useIousData } from "@/hooks/use-ious-data";
import { deleteIou, markIouPaid } from "@/services/iou-service";
import type { IouFilters } from "@/types/common";
import { formatCurrency } from "@/utils/number";
import { truncateText } from "@/utils/text";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
    Button,
    Chip,
    IconButton,
    Switch,
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
    const [showPaidItems, setShowPaidItems] = useState<boolean>(false);

    const [filters, setFilters] = useState<IouFilters>({
        sortBy: "date",
        sortOrder: "desc",
    });

    const {
        loading,
        ious,
        aggregateTotal,
        monthSections,
        expensesMap,
        paymentMethodsMap,
    } = useIousData(filters, showPaidItems);

    const [expandedMonthKeys, setExpandedMonthKeys] = useState<string[]>([]);

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

    if (loading || processing) {
        return <Loading />;
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            paddingHorizontal: 20,
            backgroundColor: theme.colors.background,
        }}>
            <Header
                title="IOUs"
                icon="filter-variant"
                onPress={showFiltersHandler}
            />

            <View style={{ padding: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text variant="bodyMedium">Show paid IOUs</Text>
                <Switch
                    value={showPaidItems}
                    onValueChange={(enabled) => {
                        setShowPaidItems(enabled);
                        if (!enabled && filters.status === "paid") {
                            setFilters(prev => ({
                                ...prev,
                                status: undefined,
                            }));
                        }
                    }}
                />
            </View>

            <AggregateSummary
                label="Filtered Outstanding IOUs"
                itemCount={ious.length}
                total={aggregateTotal}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 112, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
                <MonthGroupedList
                    sections={monthSections}
                    expandedMonthKeys={expandedMonthKeys}
                    onToggleMonth={toggleMonth}
                    getItemKey={(item) => item.id}
                    emptyLabel="No IOUs yet."
                    renderItem={(item) => {
                    const expense = expensesMap[item.expense.id];
                    const paymentMethod = paymentMethodsMap[item.paymentMethod.id];
                    const amountPaid = Math.max(item.initialAmount - item.amountLeft, 0);

                    return (
                        <TransactionRow amount={`Left ${formatCurrency(item.amountLeft)}`} date={item.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} title={expense?.description || `Expense #${item.expense.id}`} onPress={() => router.push(`/iou/${item.id}`)}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
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

                                <Text variant="bodySmall" style={{ marginTop: 2 }}>
                                    Paid: {formatCurrency(amountPaid)} / {formatCurrency(item.initialAmount)}
                                </Text>

                                <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Chip
                                        style={{
                                            backgroundColor: "transparent",
                                            borderWidth: 1,
                                            borderColor: paymentMethod?.color ?? theme.colors.outline,
                                        }}
                                        textStyle={{ color: paymentMethod?.color ?? theme.colors.onSurface }}
                                        icon={paymentMethod?.icon}
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
                        </TransactionRow>
                    );
                    }}
                />
            </ScrollView>

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
