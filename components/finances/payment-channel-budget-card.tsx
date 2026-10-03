import { useEffect, useMemo, useRef } from "react";
import { View, Animated } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import type { PaymentMethod } from "@/types/schema";
import { formatCurrency, formatNumber } from "@/utils/number";
import AnimatedProgress from "../common/animated-progress";

interface Props {
    paymentMethod: PaymentMethod;
    amountUsed: number;
    budgetAmount: number;
    amountPending: number;
}

export default function PaymentChannelBudgetCard({
    paymentMethod,
    amountUsed,
    budgetAmount,
    amountPending,
}: Props) {
    const theme = useTheme();
    const normalizedUsed = Math.max(amountUsed, 0);
    const percentage = budgetAmount > 0 ? normalizedUsed / budgetAmount : 0;
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: Math.min(percentage, 1),
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [percentage, animatedValue]);

    const barColor = useMemo(() => {
        if (amountUsed < 0) return theme.colors.primary;
        if (percentage >= 1) return theme.colors.error;
        if (percentage >= 0.9) return theme.colors.secondary;
        return theme.colors.primary;
    }, [amountUsed, theme, percentage]);

    const barText = useMemo(() => {
        if (amountUsed < 0) return "Net recovery exceeds this month's spend";
        if (percentage >= 1) return "Exceeded budget limit";
        if (percentage >= 0.9) return "Approaching budget limit";
        return "";
    }, [amountUsed, percentage]);

    return (
        <View style={{ gap: 8, paddingVertical: 12 }}>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>{paymentMethod.name}</Text>

                <AnimatedProgress progress={animatedValue} color={barColor} />

                <View style={{ gap: 4 }}>
                    <Text variant="bodySmall">
                        {formatCurrency(amountUsed)} / {formatCurrency(budgetAmount)} (
                        {formatNumber((budgetAmount > 0 ? amountUsed / budgetAmount : 0) * 100)}%)
                    </Text>

                    {amountPending > 0 && (
                        <Text variant="bodySmall">
                            IOU pending: {formatCurrency(amountPending)}
                        </Text>
                    )}

                    {(amountUsed < 0 || percentage >= 0.9) && (
                        <Text
                            variant="bodySmall"
                            style={{ color: amountUsed < 0 ? theme.colors.primary : theme.colors.error }}
                        >
                            ⚠ {barText}
                        </Text>
                    )}
                </View>
            <Divider style={{ opacity: 0.6 }} />
        </View>
    );
}
