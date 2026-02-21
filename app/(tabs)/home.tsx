import { ScrollView } from "react-native";
import MonthlySummaryCard from "@/components/dashboard/monthly-summary-card";
import MonthlyAggregateTable from "@/components/dashboard/monthly-aggregate-table";
import SectionHeader from "@/components/dashboard/section-header";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useTheme } from "react-native-paper";
import CategoryBudgetSection from "@/components/dashboard/category-budget-section";
import Loading from "@/components/loading";
import { useCallback } from "react";
import { useRouter } from "expo-router";
import Header from "@/components/header";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    loading,
    summary,
    monthlyData: { incomes, expenses, investments },
  } = useDashboardData();

  if (loading) {
    return (
      <Loading />
    )
  }

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
    router.push('/(tabs)/expenses');
  }, [router]);

  const viewAllIncomes = useCallback(() => {
    router.push('/(tabs)/incomes');
  }, [router]);

  const viewAllInvestments = useCallback(() => {
    router.push('/(tabs)/investments');
  }, [router]);

  const openProfile = useCallback(() => {
    router.push('/profile');
  }, [router]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ 
      padding: 16,
      backgroundColor: theme.colors.background,
      flexGrow: 1,
    }}>
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
        title="Income"
        onCreate={createIncomeItem}
        onViewAll={viewAllIncomes}
      />
      <MonthlyAggregateTable data={incomes} />
    </ScrollView>
  );
}