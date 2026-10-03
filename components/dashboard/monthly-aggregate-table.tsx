import { formatCurrency } from "@/utils/number";
import type { MonthlyAggregate } from "@/types/common";
import { View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";

interface Props {
  data: MonthlyAggregate[];
}

export default function MonthlyAggregateTable({ data }: Props) {
  const theme = useTheme();

  if (data.length === 0) {
    return <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, paddingVertical: 14 }}>No activity recorded yet.</Text>;
  }

  return (
    <View style={{ marginBottom: 20 }}>
      {data.map((row, index) => (
        <View key={`${row.month}-${index}`}>
          <View style={{ minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{row.month}</Text>
            <View style={{ alignItems: "flex-end", flexShrink: 1 }}>
              <Text variant="bodyMedium" numberOfLines={1} style={{ color: theme.colors.onSurface, fontWeight: "700" }}>{formatCurrency(row.total)}</Text>
              {(row.auxiliaryTotal ?? 0) > 0 && <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>+ {formatCurrency(row.auxiliaryTotal ?? 0)} pending</Text>}
            </View>
          </View>
          {index < data.length - 1 && <Divider style={{ backgroundColor: theme.colors.outlineVariant, opacity: 0.65 }} />}
        </View>
      ))}
    </View>
  );
}
