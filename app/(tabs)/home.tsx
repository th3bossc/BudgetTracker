import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import MonthlyAggregateTable from "@/components/dashboard/monthly-aggregate-table";
import MonthlySummaryCard from "@/components/dashboard/monthly-summary-card";
import SectionHeader from "@/components/dashboard/section-header";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const theme = useTheme();
    const router = useRouter();
    const {
        loading,
        summary,
        monthlyData: { incomes, expenses, investments },
    } = useDashboardData();

    const createExpenseItem = useCallback(() => {
        router.push('/expense/create')
    }, [router]);

    const createIncomeItem = useCallback(() => {
        router.push('/income/create');
    }, [router]);

    const createInvestmentItem = useCallback(() => {
        router.push('/investment/create');
    }, [router]);

    const viewAllExpenses = useCallback(() => {
        router.push({
            pathname: '/(tabs)/data-sources' as any,
            params: { source: 'expenses' },
        });
    }, [router]);

    const viewAllIncomes = useCallback(() => {
        router.push({
            pathname: '/(tabs)/data-sources' as any,
            params: { source: 'incomes' },
        });
    }, [router]);

    const viewAllInvestments = useCallback(() => {
        router.push({
            pathname: '/(tabs)/data-sources' as any,
            params: { source: 'investments' },
        });
    }, [router]);

    const openProfile = useCallback(() => {
        router.push('/profile');
    }, [router]);

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
        }}
        >
            <ScrollView style={{ flex: 1 }}>
                <Header
                    title="Dashboard"
                    icon="face-man-profile"
                    onPress={openProfile}
                />


                <MonthlySummaryCard summary={summary} />

                <SectionHeader
                    title="Expenses"
                    onCreate={createExpenseItem}
                    onViewAll={viewAllExpenses}
                />
                <MonthlyAggregateTable data={expenses} />

                <SectionHeader
                    title="Investments"
                    onCreate={createInvestmentItem}
                    onViewAll={viewAllInvestments}
                />
                <MonthlyAggregateTable data={investments} />

                <SectionHeader
                    title="Incomes"
                    onCreate={createIncomeItem}
                    onViewAll={viewAllIncomes}
                />
                <MonthlyAggregateTable data={incomes} />
            </ScrollView>
        </SafeAreaView>
    );
}
