import { useFinanceConfig } from "@/hooks/use-finance-config";
import type { InvestmentFilters } from "@/types/common";
import { useCallback, useMemo } from "react";
import { View, ViewStyle } from "react-native";
import {
    Button,
    Divider,
    Modal,
    Portal,
    useTheme,
} from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import AmountRangeFilter from "../form-fields/amount-filter-slider";
import DateRangeFilter from "../form-fields/date-filter-range";

interface Props {
    visible: boolean;
    onDismiss: () => void;
    filters: InvestmentFilters;
    setFilters: React.Dispatch<React.SetStateAction<InvestmentFilters>>;
    style?: ViewStyle;
}

export default function InvestmentFiltersModal({
    visible,
    onDismiss,
    filters,
    setFilters,
    style = {},
}: Props) {
    const { investmentTypes } = useFinanceConfig();
    const theme = useTheme();


    const updateFilter = useCallback((key: keyof InvestmentFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    }, [setFilters]);

    const investmentTypesOptions = useMemo(() => [
        { label: 'All Investment Types', value: '__all__' },
        ...(investmentTypes.map(t => ({
            label: t.name,
            value: t.id,
        })))
    ], [investmentTypes]);

    const selectInvestmentTypeHandler = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter('typeId', val === '__all__' ? undefined : val);
    }, [updateFilter])

    const updateAmountHandler = useCallback((data?: { min: number, max: number }) => {
        updateFilter('amount', data);
    }, [updateFilter]);

    const updateDateRangeHandler = useCallback((data?: { start?: Date, end?: Date }) => {
        updateFilter('date', data);
    }, [updateFilter]);

    const sortByOptions = useMemo(() => [
        { label: 'Amount', value: 'amount' },
        { label: 'Date', value: 'date' },
    ], []);

    const sortOrderOptions = useMemo(() => [
        { label: 'Descending', value: 'desc' },
        { label: 'Ascending', value: 'asc' },
    ], []);

    const updateSortByHandler = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter('sortBy', val);
    }, [updateFilter]);

    const updateSortOrderHandler = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter('sortOrder', val);
    }, [updateFilter]);

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
    }, [setFilters, onDismiss]);

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}>
                <View style={viewStyle}>

                    <Dropdown
                        mode="outlined"
                        label="Investment Type"
                        value={filters.typeId}
                        options={investmentTypesOptions}
                        onSelect={selectInvestmentTypeHandler}
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