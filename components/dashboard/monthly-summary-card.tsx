import { Card, Text, Divider, useTheme } from "react-native-paper";
import { DashboardSummary } from "@/hooks/use-dashboard-data";
import { formatCurrency } from "@/utils/number";

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

        <Text style={{ color: theme.colors.primary }}>Income: {formatCurrency(summary.income)}</Text>
        <Text style={{ color: theme.colors.error }}>Expense: {formatCurrency(summary.expense)}</Text>
        <Text style={{ color: theme.colors.inverseSurface }}>Invested: {formatCurrency(summary.investment)}</Text>

        <Divider style={{ marginVertical: 12 }} />

        <Text variant="titleSmall">
          Net Savings: {formatCurrency(summary.netSavings)}
        </Text>
        <Text variant="titleSmall">
          Net Cashflow: {formatCurrency(summary.cashflow)}
        </Text>
      </Card.Content>
    </Card>
  );
}
