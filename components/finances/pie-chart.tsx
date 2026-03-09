import React, { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Text, useTheme } from "react-native-paper";
import SectionHeader from "../dashboard/section-header";

type Props = {
    title: string;
    data: {
        name: string;
        amount: number;
    }[];
};

function generateColors(count: number) {
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
        const hue = Math.round((360 / count) * i);
        colors.push(`hsl(${hue}, 65%, 55%)`);
    }

    return colors;
}

export default function ExpensePieChart({ title, data }: Props) {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const visibleData = useMemo(
        () => data.filter(item => item.amount > 0),
        [data]
    );

    const colors = useMemo(() => generateColors(visibleData.length), [visibleData.length]);
    const chartSize = useMemo(() => Math.max(width - 48, 0), [width]);

    const chartData = useMemo(() => visibleData.map((item, index) => ({
        name: item.name,
        population: item.amount,
        color: colors[index],
    })), [colors, visibleData]);

    return (
        <View style={{ alignItems: "center", width: "100%" }}>
            <SectionHeader title={title} />

            <PieChart
                data={chartData}
                height={chartSize}
                width={chartSize}
                chartConfig={{
                    color: () => theme.colors.primary,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft={(chartSize/4).toString()}
                hasLegend={false}
            />

            <View style={{ marginTop: 16, width: chartSize }}>
                {visibleData.map((item, index) => (
                    <View
                        key={item.name}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 8,
                        }}
                    >
                        {/* Color dot */}
                        <View
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: colors[index],
                                marginRight: 8,
                            }}
                        />

                        {/* Label */}
                        <Text style={{ flex: 1 }}>
                            {item.name}
                        </Text>

                    </View>
                ))}
            </View>
        </View>
    );
}
