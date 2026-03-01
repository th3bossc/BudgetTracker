import ExpenseForm from "@/components/forms/expense-form";
import {
  getExpenses,
  updateExpense,
} from "@/services/expense-service";
import { getIous } from "@/services/iou-service";
import { ExpenseUpdateInput } from "@/types/create";
import type { Expense } from "@/types/schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  Divider,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditExpensePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [recoveredAmount, setRecoveredAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      const [expenses, ious] = await Promise.all([
        getExpenses(),
        getIous(),
      ]);
      const found = expenses.find(e => e.id === id);
      setExpense(found ?? null);
      if (found) {
        const iou = ious.find(item => item.expense.id === found.id);
        const recovered = iou
          ? Math.max(iou.initialAmount - iou.amountLeft, 0)
          : 0;
        setRecoveredAmount(recovered);
      } else {
        setRecoveredAmount(0);
      }
      setInitialLoading(false);
    };

    if (id) fetchExpense();
  }, [id]);

  const handleSubmit = async (data: ExpenseUpdateInput) => {
    if (!id) return;
    try {
      setLoading(true);
      await updateExpense(id, data);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Expense" />
      </Appbar.Header>

      <Surface
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: theme.colors.background,
        }}
      >
        {initialLoading ? (
          <ActivityIndicator />
        ) : expense ? (
          <>
            <Text variant="bodyMedium">
              Paid by you: ₹ {expense.amount}
            </Text>
            <Text variant="bodyMedium">
              Recovered: ₹ {recoveredAmount}
            </Text>
            <Text variant="bodyMedium">
              Net cost: ₹ {Math.max(expense.amount - recoveredAmount, 0)}
            </Text>

            <Divider style={{ marginVertical: 12 }} />

            <ExpenseForm
              initialData={expense}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </>
        ) : null}
      </Surface>
    </SafeAreaView>
  );
}
