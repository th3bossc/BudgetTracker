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
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: theme.colors.surfaceVariant,
            }}
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text variant="titleSmall">{label}</Text>
                    <Text variant="bodySmall">{itemCount} item(s)</Text>
                </View>
                <Text variant="titleMedium">{formatCurrency(total)}</Text>
            </View>
        </Surface>
    );
}
