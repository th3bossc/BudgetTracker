import { formatCurrency } from "@/utils/number";
import { View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";

interface Props {
    label: string;
    itemCount: number;
    total: number;
}

export default function AggregateSummary({
    label,
    itemCount,
    total,
}: Props) {
    const theme = useTheme();

    return (
        <Surface
            style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: theme.colors.surface,
                marginBottom: 18,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
            }}
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text variant="labelLarge" style={{ fontWeight: '700' }}>{label}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 3 }}>{itemCount} transactions</Text>
                </View>
                <Text variant="titleMedium" numberOfLines={1} adjustsFontSizeToFit style={{ fontWeight: '800', color: theme.colors.primary }}>{formatCurrency(total)}</Text>
            </View>
        </Surface>
    );
}
