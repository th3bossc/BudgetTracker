import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import MonthlySummaryCard from "@/components/dashboard/monthly-summary-card";
import CategoryBudgetSection from "@/components/finances/category-budget-section";
import CategoryPieChart from "@/components/finances/category-pie-chart";
import { useMonthlyBudgetData } from "@/hooks/use-monthly-budget-data";
import { ExpenseCategory } from "@/types/schema";
import { getMonthKey } from "@/utils/date";
import { generateMonthOptions } from "@/utils/month-utils";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { Divider, FAB, useTheme } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FinancesPage() {
    const theme = useTheme();
    const [monthKey, setMonthKey] = useState<string>(getMonthKey(new Date()));
    const { loading, budgetUsed, summary } = useMonthlyBudgetData(monthKey);

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
        <SafeAreaView style={{
            padding: 16,
            backgroundColor: theme.colors.background,
            flexGrow: 1,
        }}>
            <ScrollView style={{ flex: 1 }}>
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

                <Divider style={{ marginVertical: 16 }} />

                <MonthlySummaryCard
                    summary={summary}
                />

                <Divider style={{ marginVertical: 16 }} />

                <CategoryBudgetSection budgetUsed={budgetUsed} />

                <Divider />

                <CategoryPieChart
                    budgetUsed={budgetUsed}
                />

            </ScrollView>

            <FAB
                icon="pencil"
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