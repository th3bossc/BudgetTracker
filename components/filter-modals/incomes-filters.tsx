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
import type { IncomeFilters } from "@/types/common";
import { useCallback, useMemo } from "react";

interface Props {
    visible: boolean;
    onDismiss: () => void;
    filters: IncomeFilters;
    setFilters: React.Dispatch<React.SetStateAction<IncomeFilters>>;
}

export default function IncomeFiltersModal({
    visible,
    onDismiss,
    filters,
    setFilters,
}: Props) {
    const { incomeSources } = useFinanceConfig();

    const updateFilter = (key: keyof IncomeFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const incomeSourcesOptions = useMemo(() => incomeSources.map(s => ({
        label: s.name,
        value: s.id,
    })), [updateFilter]);

    const minAmount = useMemo(() => filters.minAmount?.toString() ?? "", [filters.minAmount]);
    const maxAmount = useMemo(() => filters.maxAmount?.toString() ?? "", [filters.maxAmount]);
        
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

        updateFilter('sourceId', val);
    }, [updateFilter])
    
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
                        backgroundColor: "white",
                        padding: 20,
                        margin: 20,
                        borderRadius: 12,
                        gap: 20,
                    }}
                >

                    <Dropdown
                        label="Income Source"
                        value={filters.sourceId}
                        options={incomeSourcesOptions}
                        onSelect={updateIncomeSourceId}
                    />

                    <TextInput
                        label="Min Amount"
                        value={minAmount}
                        onChangeText={updateMinAmountHandler}
                        keyboardType="numeric"
                    />

                    <TextInput
                        label="Max Amount"
                        value={maxAmount}
                        onChangeText={updateMaxAmountHandler}
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