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
import type { InvestmentFilters } from "@/types/common";
import { useCallback, useMemo } from "react";

interface Props {
    visible: boolean;
    onDismiss: () => void;
    filters: InvestmentFilters;
    setFilters: React.Dispatch<React.SetStateAction<InvestmentFilters>>;
}

export default function InvestmentFiltersModal({
    visible,
    onDismiss,
    filters,
    setFilters,
}: Props) {
    const { investmentTypes } = useFinanceConfig();

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
    ], []);

    const selectInvestmentTypeHandler = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter('typeId', val == '__all__' ? undefined : val);
    }, [updateFilter])

    const updateFilterMinAmount = useCallback((text: string) => {
        updateFilter('minAmount', Number(text));
    }, [updateFilter]);

    const updateFilterMaxAmount = useCallback((text: string) => {
        updateFilter('maxAmount', Number(text));
    }, [updateFilter])

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
    }, [updateFilter])

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}>
                <View
                    style={{
                        elevation: 5,
                        padding: 30,
                        margin: 10,
                        borderRadius: 12,
                        gap: 20,
                    }}
                >

                    <Dropdown
                        label="Investment Type"
                        value={filters.typeId}
                        options={investmentTypesOptions}
                        onSelect={selectInvestmentTypeHandler}
                    />

                    <TextInput
                        label="Min Amount"
                        value={filters.minAmount?.toString() ?? ""}
                        onChangeText={updateFilterMinAmount }
                        keyboardType="numeric"
                    />

                    <TextInput
                        label="Max Amount"
                        value={filters.maxAmount?.toString() ?? ""}
                        onChangeText={updateFilterMaxAmount}
                        keyboardType="numeric"
                    />

                    <Divider />

                    <Dropdown
                        label="Sort By"
                        value={filters.sortBy}
                        options={sortByOptions}
                        onSelect={updateSortByHandler}
                    />

                    <Dropdown
                        label="Sort Order"
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