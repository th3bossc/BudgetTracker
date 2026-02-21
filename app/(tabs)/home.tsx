import { ScrollView, View } from "react-native";
import MonthlySummaryCard from "@/components/dashboard/monthly-summary-card";
import MonthlyAggregateTable from "@/components/dashboard/monthly-aggregate-table";
import SectionHeader from "@/components/dashboard/section-header";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { ActivityIndicator } from "react-native-paper";

export default function HomeScreen() {

  const {
    loading,
    summary,
    monthlyData: { incomes, expenses, investments },
  } = useDashboardData();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size='large' />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      
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

    </ScrollView>
  );
}