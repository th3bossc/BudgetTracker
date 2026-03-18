import { useEffect, useMemo, useRef } from "react";
import { View, Animated } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
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
        if (percentage >= 1) return theme.colors.error;
        if (percentage >= 0.9) return theme.colors.secondary;
        return theme.colors.primary;
    }, [theme, percentage]);

    const barText = useMemo(() => {
        if (percentage >= 1) return "Exceeded budget limit";
        if (percentage >= 0.9) return "Approaching budget limit";
        return "";
    }, [percentage]);

    return (
        <Card style={{ marginBottom: 16 }}>
            <Card.Content>
                <Text variant="titleMedium">{paymentMethod.name}</Text>

                <AnimatedProgress progress={animatedValue} color={barColor} />

                <View style={{ marginTop: 6 }}>
                    <Text variant="bodySmall">
                        {formatCurrency(amountUsed)} / {formatCurrency(budgetAmount)} (
                        {formatNumber(percentage * 100)}%)
                    </Text>

                    {amountUsed < 0 && (
                        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                            Credit balance: {formatCurrency(Math.abs(amountUsed))}
                        </Text>
                    )}

                    {amountPending > 0 && (
                        <Text variant="bodySmall">
                            IOU pending: {formatCurrency(amountPending)}
                        </Text>
                    )}

                    {percentage >= 0.9 && (
                        <Text
                            variant="bodySmall"
                            style={{ color: theme.colors.error }}
                        >
                            ⚠ {barText}
                        </Text>
                    )}
                </View>
            </Card.Content>
        </Card>
    );
}
