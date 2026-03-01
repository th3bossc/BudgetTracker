import ExpensePieChart from "./pie-chart"
import { useMemo } from "react"
import { BudgetUsed } from "@/hooks/use-monthly-budget-data"
import { View } from "react-native"
import { Text } from 'react-native-paper';

type Props = {
    budgetUsed: BudgetUsed[]
}

export default function CategoryPieChart({ budgetUsed }: Props) {
    const pieChartData = useMemo(() => budgetUsed.map(item => ({
        name: item.category.name,
        amount: item.amountUsed
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
                    />

                ) : (
                    <Text variant="titleMedium" style={{ alignSelf: 'center'}}>
                        Not enough data
                    </Text>
                )
            }
        </View>
    )

}