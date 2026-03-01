import { View, ViewStyle } from "react-native";
import {
    Modal,
    Portal,
    Button,
    Divider,
    useTheme,
} from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import type { IncomeFilters } from "@/types/common";
import { useCallback, useMemo } from "react";
import AmountRangeFilter from "./amount-filter-slider";
import DateRangeFilter from "./date-filter-range";

interface Props {
    visible: boolean;
    onDismiss: () => void;
    filters: IncomeFilters;
    setFilters: React.Dispatch<React.SetStateAction<IncomeFilters>>;
    style?: ViewStyle;
}

export default function IncomeFiltersModal({
    visible,
    onDismiss,
    filters,
    setFilters,
    style = {},
}: Props) {
    const { incomeSources } = useFinanceConfig();
    const theme = useTheme();

    const updateFilter = (key: keyof IncomeFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const incomeSourcesOptions = useMemo(() => [
        { label: 'All Sources', value: '__all__' },
        ...(incomeSources.map(s => ({
            label: s.name,
            value: s.id,
        })))
    ], [updateFilter]);

    const sortByOptions = useMemo(() => [
        { label: 'Amount', value: 'amount' },
        { label: 'Date', value: 'date' },
    ], []);

    const sortOrderOptions = useMemo(() => [
        { label: 'Descending', value: 'desc' },
        { label: 'Ascending', value: 'asc' },
    ], []);

    const updateIncomeSourceId = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter('sourceId', val == '__all__' ? undefined : val);
    }, [updateFilter])

    const updateAmountHandler = useCallback((data?: { min: number, max: number }) => {
        updateFilter('amount', data);
    }, [updateFilter]);

    const updateDateRangeHandler = useCallback((data?: { start?: Date, end?: Date }) => {
        updateFilter('date', data);
    }, [updateFilter]);

    const updateSortByHandler = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter('sortBy', val);
    }, [updateFilter]);

    const updateSortOrderHandler = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter('sortOrder', val);
    }, [updateFilter])

    const viewStyle: ViewStyle = useMemo(() => ({
        elevation: 5,
        padding: 30,
        margin: 10,
        borderRadius: 12,
        gap: 20,
        ...style,
    }), [style]);

    const clearFilters = useCallback(() => {
        setFilters({});
        onDismiss();
    }, [setFilters]);

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}>
                <View style={viewStyle}>

                    <Dropdown
                        mode="outlined"
                        label="Income Source"
                        value={filters.sourceId}
                        options={incomeSourcesOptions}
                        onSelect={updateIncomeSourceId}
                    />

                    <AmountRangeFilter
                        data={filters.amount}
                        onChange={updateAmountHandler}
                    />

                    <DateRangeFilter
                        data={filters.date}
                        onChange={updateDateRangeHandler}
                    />

                    <Divider />

                    <Dropdown
                        mode="outlined"
                        label="Sort By"
                        value={filters.sortBy}
                        options={sortByOptions}
                        onSelect={updateSortByHandler}
                    />

                    <Dropdown
                        mode="outlined"
                        label="Sort Order"
                        value={filters.sortOrder}
                        options={sortOrderOptions}
                        onSelect={updateSortOrderHandler}
                    />

                    <Divider />


                    <View
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}
                    >
                        <Button mode="contained" onPress={onDismiss}>
                            Apply Filters
                        </Button>
                        <Button mode="contained" buttonColor={theme.colors.error} onPress={clearFilters}>
                            Clear Filters
                        </Button>

                    </View>

                </View>
            </Modal>
        </Portal>
    );
}