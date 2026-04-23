import type { MonthSection } from "@/types/common";
import { formatCurrency } from "@/utils/number";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Card, Icon, Text, useTheme } from "react-native-paper";

interface Props<T> {
    sections: MonthSection<T>[];
    expandedMonthKeys: string[];
    onToggleMonth: (monthKey: string) => void;
    getItemKey: (item: T) => string;
    renderItem: (item: T) => ReactNode;
    emptyLabel: string;
}

export default function MonthGroupedList<T>({
    sections,
    expandedMonthKeys,
    onToggleMonth,
    getItemKey,
    renderItem,
    emptyLabel,
}: Props<T>) {
    const theme = useTheme();

    if (sections.length === 0) {
        return (
            <Text variant="bodyLarge" style={{ textAlign: "center", marginTop: 16 }}>
                {emptyLabel}
            </Text>
        );
    }

    return (
        <View style={{ gap: 12 }}>
            {sections.map((section) => (
                <View key={section.monthKey} style={{ gap: 12 }}>
                    <Pressable onPress={() => onToggleMonth(section.monthKey)}>
                        <Card
                            style={{
                                borderRadius: 16,
                                backgroundColor: theme.colors.surface,
                            }}
                        >
                            <Card.Content
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                                    <Icon source="calendar-month-outline" size={22} />
                                    <View style={{ flex: 1 }}>
                                        <Text variant="titleMedium">{section.label}</Text>
                                        <Text variant="bodySmall">
                                            {section.count} item(s) • {formatCurrency(section.total)}
                                        </Text>
                                    </View>
                                </View>
                                <Icon
                                    source={expandedMonthKeys.includes(section.monthKey) ? "chevron-up" : "chevron-down"}
                                    size={22}
                                />
                            </Card.Content>
                        </Card>
                    </Pressable>

                    {expandedMonthKeys.includes(section.monthKey) && (
                        <View style={{ gap: 12 }}>
                            {section.items.map((item) => (
                                <View key={getItemKey(item)}>
                                    {renderItem(item)}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
}
