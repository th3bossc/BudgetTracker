import { useEffect, useMemo, useRef } from "react";
import { View, Animated } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import type { ExpenseCategory } from "@/types/schema";
import AnimatedProgress from "../common/animated-progress";

interface Props {
  category: ExpenseCategory;
  amountUsed: number;
  budgetAmount: number;
}

export default function CategoryBudgetCard({
  category,
  amountUsed,
  budgetAmount,
}: Props) {
  const theme = useTheme();

  const percentage =
    budgetAmount > 0 ? amountUsed / budgetAmount : 0;

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: Math.min(percentage, 1),
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [percentage, animatedValue]);

  const barColor = useMemo(() => {
    if (percentage >= 1)
      return theme.colors.error;
    else if (percentage >= 0.9)
      return theme.colors.secondary;

    return theme.colors.primary;
  }, [theme, percentage]);

  const barText = useMemo(() => {
    if (percentage >= 1)
      return 'Exceeded budget limit';
    else if (percentage >= 0.9)
      return 'Approaching budget limit';

    return '';
  }, [percentage])


  return (
    <Card style={{ marginBottom: 16 }}>
      <Card.Content>
        <Text variant="titleMedium">{category.name}</Text>

        <AnimatedProgress
          progress={animatedValue}
          color={barColor}
        />

        <View style={{ marginTop: 6 }}>
          <Text variant="bodySmall">
            ₹ {amountUsed} / ₹ {budgetAmount} (
            {Math.round(percentage * 100)}%)
          </Text>

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