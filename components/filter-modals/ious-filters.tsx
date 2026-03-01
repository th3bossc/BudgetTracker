import { useFinanceConfig } from "@/hooks/use-finance-config";
import type { IouFilters } from "@/types/common";
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
    filters: IouFilters;
    setFilters: React.Dispatch<React.SetStateAction<IouFilters>>;
    style?: ViewStyle;
}

export default function IousFiltersModal({
    visible,
    onDismiss,
    filters,
    setFilters,
    style = {},
}: Props) {
    const { paymentMethods } = useFinanceConfig();
    const theme = useTheme();

    const updateFilter = useCallback((key: keyof IouFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    }, [setFilters]);

    const paymentMethodOptions = useMemo(() => [
        { label: "All Repayment Methods", value: "__all__" },
        ...(paymentMethods.map(method => ({
            label: method.name,
            value: method.id,
        }))),
    ], [paymentMethods]);

    const statusOptions = useMemo(() => [
        { label: "All", value: "__all__" },
        { label: "Open", value: "open" },
        { label: "Paid", value: "paid" },
    ], []);

    const sortByOptions = useMemo(() => [
        { label: "Amount", value: "amount" },
        { label: "Date", value: "date" },
    ], []);

    const sortOrderOptions = useMemo(() => [
        { label: "Descending", value: "desc" },
        { label: "Ascending", value: "asc" },
    ], []);

    const onSelectPaymentMethod = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter("paymentMethodId", val === "__all__" ? undefined : val);
    }, [updateFilter]);

    const onSelectStatus = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter("status", val === "__all__" ? undefined : val);
    }, [updateFilter]);

    const onUpdateAmount = useCallback((data?: { min: number, max: number }) => {
        updateFilter("amount", data);
    }, [updateFilter]);

    const onUpdateDate = useCallback((data?: { start?: Date, end?: Date }) => {
        updateFilter("date", data);
    }, [updateFilter]);

    const onSelectSortBy = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter("sortBy", val);
    }, [updateFilter]);

    const onSelectSortOrder = useCallback((val?: string) => {
        if (!val)
            return;

        updateFilter("sortOrder", val);
    }, [updateFilter]);

    const viewStyle: ViewStyle = useMemo(() => ({
        elevation: 5,
        padding: 30,
        margin: 10,
        borderRadius: 12,
        gap: 12,
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
                        label="Repayment Method"
                        value={filters.paymentMethodId}
                        options={paymentMethodOptions}
                        onSelect={onSelectPaymentMethod}
                    />

                    <Dropdown
                        mode="outlined"
                        label="Status"
                        value={filters.status}
                        options={statusOptions}
                        onSelect={onSelectStatus}
                    />

                    <AmountRangeFilter
                        data={filters.amount}
                        onChange={onUpdateAmount}
                    />

                    <DateRangeFilter
                        data={filters.date}
                        onChange={onUpdateDate}
                    />

                    <Divider />

                    <Dropdown
                        mode="outlined"
                        label="Sort by"
                        value={filters.sortBy}
                        options={sortByOptions}
                        onSelect={onSelectSortBy}
                    />

                    <Dropdown
                        mode="outlined"
                        label="Sort order"
                        value={filters.sortOrder}
                        options={sortOrderOptions}
                        onSelect={onSelectSortOrder}
                    />

                    <Divider />

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
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
