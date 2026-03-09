import ExpensePieChart from "./pie-chart";
import { useMemo } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { PaymentChannelBudgetUsed } from "@/hooks/use-monthly-payment-channel-budget-data";

type Props = {
    budgetUsed: PaymentChannelBudgetUsed[];
};

export default function PaymentChannelPieChart({ budgetUsed }: Props) {
    const pieChartData = useMemo(() => budgetUsed.map(item => ({
        name: item.paymentMethod.name,
        amount: item.amountUsed,
    })), [budgetUsed]);

    const showChart = useMemo(() => pieChartData.some(item => item.amount > 0), [pieChartData]);

    return (
        <View style={{ gap: 20 }}>
            {showChart ? (
                <ExpensePieChart
                    title="Expense Distribution by Payment Method"
                    data={pieChartData}
                />
            ) : (
                <Text variant="titleMedium" style={{ alignSelf: "center" }}>
                    Not enough data
                </Text>
            )}
        </View>
    );
}
