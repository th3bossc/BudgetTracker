import CategoryBudgetSection from "@/components/dashboard/category-budget-section";
import Header from "@/components/header";
import Loading from "@/components/loading";
import { useBulkCategoryBudgets } from "@/hooks/use-bulk-category-budgets";
import { BudgetUsed, useMonthlyBudgetData } from "@/hooks/use-monthly-budget-data";
import { getMonthKey } from "@/utils/date";
import { generateMonthOptions } from "@/utils/month-utils";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { FAB, useTheme } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FinancesPage() {
    const theme = useTheme();
    const [monthKey, setMonthKey] = useState<string>(getMonthKey(new Date()));
    const { loading, budgetUsed } = useMonthlyBudgetData(monthKey);

    const monthOptions = useMemo(() => generateMonthOptions(24), []);

    const onSelectMonth = useCallback((val?: string) => {
        if (!val)
            return;

        setMonthKey(val);
    }, []);

    if (loading) {
        return <Loading />
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{
                padding: 16,
                backgroundColor: theme.colors.background,
                flexGrow: 1,
            }}>
                <Header
                    title="Finances"
                />

                <Dropdown
                    label="Month"
                    mode="outlined"
                    value={monthKey}
                    options={monthOptions}
                    onSelect={onSelectMonth}
                />

                <CategoryBudgetSection budgetUsed={budgetUsed} />

            </ScrollView>

            <FAB
                icon="plus"
                style={{
                    position: "absolute",
                    right: 16,
                    bottom: 16,
                }}
                onPress={() => router.push(`/budget/${monthKey}`)}
            />
        </SafeAreaView>
    )
}