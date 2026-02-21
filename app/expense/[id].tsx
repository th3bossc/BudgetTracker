import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Appbar,
  Surface,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import ExpenseForm from "@/components/forms/expense-form";
import {
  getExpenses,
  updateExpense,
} from "@/services/expense-service";
import type { Expense } from "@/types/schema";
import { ExpenseUpdateInput } from "@/types/create";

export default function EditExpensePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      const expenses = await getExpenses();
      const found = expenses.find(e => e.id === id);
      setExpense(found ?? null);
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
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
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
          <ExpenseForm
            initialData={expense}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : null}
      </Surface>
    </SafeAreaView>
  );
}