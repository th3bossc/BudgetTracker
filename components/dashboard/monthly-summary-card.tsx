import { Card, Text, Divider } from "react-native-paper";
import { View } from "react-native";
import { DashboardSummary } from "@/hooks/use-dashboard-data";

interface Props {
  summary: DashboardSummary
}

export default function MonthlySummaryCard({ summary }: Props) {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Card.Content>
        <Text variant="titleMedium" style={{ marginBottom: 12 }}>
          This Month
        </Text>

        <Text>Income: ₹ {summary.income}</Text>
        <Text>Expense: ₹ {summary.expense}</Text>
        <Text>Invested: ₹ {summary.investment}</Text>

        <Divider style={{ marginVertical: 12 }} />

        <Text variant="titleSmall">
          Net Savings: ₹ {summary.netSavings}
        </Text>
        <Text variant="titleSmall">
          Net Cashflow: ₹ {summary.cashflow}
        </Text>
      </Card.Content>
    </Card>
  );
}