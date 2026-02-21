import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import {
    Modal,
    Portal,
    TextInput,
    Button,
    Divider,
} from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { ExpenseFilters } from "@/types/common";

interface Props {
    visible: boolean;
    onDismiss: () => void;
    filters: ExpenseFilters;
    setFilters: React.Dispatch<React.SetStateAction<ExpenseFilters>>;
}


export default function ExpenseFiltersModal({
    visible,
    onDismiss,
    filters,
    setFilters,
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
        updateFilter('categoryId', val);
    }, [updateFilter]);

    const selectPaymentMethodHandler = useCallback((val?: string) => {
        if (!val)
            return;
        updateFilter('paymentMethodId', val);
    }, [updateFilter]);

    const categoriesOptions = useMemo(() => categories.map(c => ({
        label: c.name,
        value: c.id,
    })), [categories]);
    
    const sortByOptions = useMemo(() => [
        { label: 'Amount', value: 'amount' },
        { label: 'Date', value: 'date' },
    ], []);

    const sortOrderOptions = useMemo(() => [
        { label: 'Descending', value: 'desc' },
        { label: 'Ascending', value: 'asc' },
    ], []);

    const paymentMethodOptions = useMemo(() => paymentMethods.map(p => ({
        label: p.name,
        value: p.id,
    })), [paymentMethods]);

    const updateMinAmountHandler = useCallback((text: string) => {
        updateFilter('minAmount', Number(text));
    }, [updateFilter]);

    const updateMaxAmountHandler = useCallback((text: string) => {
        updateFilter('maxAmount', Number(text));
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


    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}>
                <View
                    style={{
                        padding: 20,
                        margin: 20,
                        borderRadius: 12,
                        gap: 20,
                    }}
                >
                    <Dropdown
                        label="Category"
                        value={filters.categoryId}
                        options={categoriesOptions}
                        onSelect={selectCategoryHandler}
                    />

                    <Dropdown
                        label="Payment Method"
                        value={filters.paymentMethodId}
                        options={paymentMethodOptions}
                        onSelect={selectPaymentMethodHandler}
                    />

                    <TextInput
                        label="Min Amount"
                        value={filters.minAmount?.toString() ?? ""}
                        onChangeText={updateMinAmountHandler}
                        keyboardType="numeric"
                    />

                    <TextInput
                        label="Max Amount"
                        value={filters.maxAmount?.toString() ?? ""}
                        onChangeText={updateMaxAmountHandler}
                        keyboardType="numeric"
                    />

                    <Divider />

                    <Dropdown
                        label="Sort by"
                        value={filters.sortBy}
                        options={sortByOptions}
                        onSelect={updateSortByHandler}
                    />

                    <Dropdown
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