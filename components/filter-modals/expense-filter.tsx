import { useCallback, useMemo } from "react";
import { View, ViewStyle } from "react-native";
import {
    Modal,
    Portal,
    Button,
    Divider,
    TextInput,
} from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { ExpenseFilters } from "@/types/common";
import AmountRangeFilter from "./amount-filter-slider";

interface Props {
    visible: boolean;
    onDismiss: () => void;
    filters: ExpenseFilters;
    setFilters: React.Dispatch<React.SetStateAction<ExpenseFilters>>;
    style?: ViewStyle;
}


export default function ExpenseFiltersModal({
    visible,
    onDismiss,
    filters,
    setFilters,
    style = {},
}: Props) {
    const { categories, paymentMethods } = useFinanceConfig();

    const updateFilter = useCallback((key: keyof ExpenseFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    }, [setFilters]);

    const selectCategoryHandler = useCallback((val?: string) => {
        if (!val)
            return;
        updateFilter('categoryId', val == '__all__' ? undefined : val);
    }, [updateFilter]);

    const selectPaymentMethodHandler = useCallback((val?: string) => {
        if (!val)
            return;
        updateFilter('paymentMethodId', val == '__all__' ? undefined : val);
    }, [updateFilter]);

    const categoriesOptions = useMemo(() => [
        { label: 'All Categories', value: '__all__' },
        ...(categories.map(c => ({
            label: c.name,
            value: c.id,
        })))
    ], [categories]);
    
    const sortByOptions = useMemo(() => [
        { label: 'Amount', value: 'amount' },
        { label: 'Date', value: 'date' },
    ], []);

    const sortOrderOptions = useMemo(() => [
        { label: 'Descending', value: 'desc' },
        { label: 'Ascending', value: 'asc' },
    ], []);

    const paymentMethodOptions = useMemo(() => [
        { label: 'All Payment Methods', value: '__all__' },
        ...(paymentMethods.map(p => ({
            label: p.name,
            value: p.id,
        })))
    ], [paymentMethods]);

    const updateAmountHandler = useCallback((data?: { min: number, max: number }) => {
        updateFilter('amount', data);
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
    }, [updateFilter]);

    const viewStyle: ViewStyle = useMemo(() => ({
        elevation: 5,
        padding: 30,
        margin: 10,
        borderRadius: 12,
        gap: 12,
        ...style,
    }), [style]);


    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}>
                <View style={viewStyle}>
                    <Dropdown
                        mode="outlined"
                        label="Category"
                        value={filters.categoryId}
                        options={categoriesOptions}
                        onSelect={selectCategoryHandler}
                    />

                    <Dropdown
                        mode="outlined"
                        label="Payment Method"
                        value={filters.paymentMethodId}
                        options={paymentMethodOptions}
                        onSelect={selectPaymentMethodHandler}
                    />

                    <AmountRangeFilter
                        data={filters.amount}
                        onChange={updateAmountHandler}
                    />

                    <Divider />

                    <Dropdown
                        mode="outlined"
                        label="Sort by"
                        value={filters.sortBy}
                        options={sortByOptions}
                        onSelect={updateSortByHandler}
                    />

                    <Dropdown
                        mode="outlined"
                        label="Sort order"
                        value={filters.sortOrder}
                        options={sortOrderOptions}
                        onSelect={updateSortOrderHandler}
                    />

                    <Divider />

                    <Button mode="contained" onPress={onDismiss}>
                        Apply Filters
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}