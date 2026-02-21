import { Card, Text, Divider, useTheme } from "react-native-paper";
import { DashboardSummary } from "@/hooks/use-dashboard-data";

interface Props {
  summary: DashboardSummary
}

export default function MonthlySummaryCard({ summary }: Props) {
  const theme = useTheme();
  return (
    <Card style={{ marginBottom: 24 }}>
      <Card.Content>
        <Text variant="titleMedium" style={{ marginBottom: 12 }}>
          This Month
        </Text>

        <Text style={{ color: theme.colors.primary }}>Income: ₹ {summary.income}</Text>
        <Text style={{ color: theme.colors.error }}>Expense: ₹ {summary.expense}</Text>
        <Text style={{ color: theme.colors.inverseSurface }}>Invested: ₹ {summary.investment}</Text>

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