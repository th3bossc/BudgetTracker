import { Text, useTheme } from "react-native-paper";
import { DashboardSummary } from "@/hooks/use-dashboard-data";
import { formatCurrency } from "@/utils/number";
import { View } from "react-native";

interface Props {
  summary: DashboardSummary
}

export default function MonthlySummaryCard({ summary }: Props) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 24, padding: 18, borderRadius: 14, backgroundColor: theme.colors.surfaceVariant, gap: 16 }}>
      <View style={{ gap: 4 }}>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.7 }}>MONTHLY CASHFLOW</Text>
        <Text variant="headlineMedium" numberOfLines={1} adjustsFontSizeToFit style={{ color: theme.colors.onSurface, fontWeight: '800', letterSpacing: -0.5 }}>{formatCurrency(summary.cashflow)}</Text>
      </View>
      <View style={{ height: 1, backgroundColor: theme.colors.outlineVariant }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Metric label="Income" value={summary.income} color={theme.colors.tertiary} />
        <Metric label="Spent" value={summary.expense} color={theme.colors.error} />
        <Metric label="Saved" value={summary.netSavings} color={theme.colors.primary} />
      </View>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Invested {formatCurrency(summary.investment)}{summary.expenseYetToGetBack > 0 ? `  ·  ${formatCurrency(summary.expenseYetToGetBack)} to recover` : ''}</Text>
    </View>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  const theme = useTheme();
  return <View style={{ flex: 1, gap: 4 }}><Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{label}</Text><Text variant="titleSmall" numberOfLines={1} adjustsFontSizeToFit style={{ color, fontWeight: '700' }}>{formatCurrency(value)}</Text></View>;
}
