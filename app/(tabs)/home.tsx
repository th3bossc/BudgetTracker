import { ScrollView } from "react-native";
import MonthlySummaryCard from "@/components/dashboard/monthly-summary-card";
import MonthlyAggregateTable from "@/components/dashboard/monthly-aggregate-table";
import SectionHeader from "@/components/dashboard/section-header";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useTheme } from "react-native-paper";
import CategoryBudgetSection from "@/components/dashboard/category-budget-section";
import Loading from "@/components/loading";

export default function HomeScreen() {
  const theme = useTheme();
  const {
    loading,
    summary,
    monthlyData: { incomes, expenses, investments, budgetUsed },
  } = useDashboardData();

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <ScrollView contentContainerStyle={{ 
      padding: 16,
      backgroundColor: theme.colors.background,
      flex: 1,
    }}>
      
      <MonthlySummaryCard summary={summary} />

      <SectionHeader
        title="Expenses"
        onCreate={() => {}}
        onViewAll={() => {}}
      />
      <MonthlyAggregateTable data={expenses} />

      <SectionHeader
        title="Investments"
        onCreate={() => {}}
        onViewAll={() => {}}
      />
      <MonthlyAggregateTable data={investments} />

      <SectionHeader
        title="Income"
        onCreate={() => {}}
        onViewAll={() => {}}
      />
      <MonthlyAggregateTable data={incomes} />

      <SectionHeader
        title="Cateogry Budgets"
      />
      <CategoryBudgetSection budgetUsed={budgetUsed} />

    </ScrollView>
  );
}