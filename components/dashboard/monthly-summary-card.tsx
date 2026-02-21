import { Card, Text, Divider } from "react-native-paper";
import { View } from "react-native";

export default function MonthlySummaryCard() {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Card.Content>
        <Text variant="titleMedium" style={{ marginBottom: 12 }}>
          This Month
        </Text>

        <Text>Income: ₹ 0</Text>
        <Text>Expense: ₹ 0</Text>
        <Text>Invested: ₹ 0</Text>

        <Divider style={{ marginVertical: 12 }} />

        <Text variant="titleSmall">
          Net Savings: ₹ 0
        </Text>
      </Card.Content>
    </Card>
  );
}