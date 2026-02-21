import { ScrollView } from "react-native";
import MonthlySummaryCard from "@/components/dashboard/monthly-summary-card";
import MonthlyAggregateTable from "@/components/dashboard/monthly-aggregate-table";
import SectionHeader from "@/components/dashboard/section-header";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      
      <MonthlySummaryCard />

      <SectionHeader
        title="Income"
        onCreate={() => {}}
        onViewAll={() => {}}
      />
      <MonthlyAggregateTable data={[]} />

      <SectionHeader
        title="Expenses"
        onCreate={() => {}}
        onViewAll={() => {}}
      />
      <MonthlyAggregateTable data={[]} />

      <SectionHeader
        title="Investments"
        onCreate={() => {}}
        onViewAll={() => {}}
      />
      <MonthlyAggregateTable data={[]} />

    </ScrollView>
  );
}