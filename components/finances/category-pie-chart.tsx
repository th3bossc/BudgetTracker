import ExpensePieChart from "./pie-chart"
import { useMemo } from "react"
import { BudgetUsed } from "@/hooks/use-monthly-budget-data"
import { View } from "react-native"
import { Text } from 'react-native-paper';
import { formatCurrency } from "@/utils/number";

type Props = {
    budgetUsed: BudgetUsed[]
}

export default function CategoryPieChart({ budgetUsed }: Props) {
    const pieChartData = useMemo(() => budgetUsed
        .filter(item => item.amountUsed > 0)
        .map(item => ({
        name: item.category.name,
        amount: item.amountUsed
    })), [budgetUsed]);

    const negativeData = useMemo(() => budgetUsed
        .filter(item => item.amountUsed < 0)
        .map(item => ({
            name: item.category.name,
            amount: item.amountUsed,
        })), [budgetUsed]);

    const showChart = useMemo(() => {
        return pieChartData.some(item => item.amount > 0)
    }, [pieChartData]);

    return (
        <View style={{ gap: 20 }}>
            {
                showChart 
                ? (
                    <ExpensePieChart
                        title="Expense Distribution"
                        data={pieChartData}
                        negativeData={negativeData}
                    />

                ) : (
                    <View style={{ gap: 8 }}>
                        <Text variant="titleMedium" style={{ alignSelf: 'center'}}>
                        Not enough data
                        </Text>
                        {negativeData.map((item) => (
                            <Text key={item.name} variant="bodySmall" style={{ alignSelf: "center" }}>
                                {item.name}: {formatCurrency(item.amount)}
                            </Text>
                        ))}
                    </View>
                )
            }
        </View>
    )

}
