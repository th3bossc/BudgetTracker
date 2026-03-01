import IouForm from "@/components/forms/iou-form";
import { getExpenses } from "@/services/expense-service";
import { addIou } from "@/services/iou-service";
import type { IouCreateInput } from "@/types/create";
import type { Expense } from "@/types/schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateIouPage() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpense = async () => {
      if (!expenseId) {
        setError("Expense is required to create an IOU.");
        setInitialLoading(false);
        return;
      }

      try {
        const expenses = await getExpenses();
        const found = expenses.find(e => e.id === expenseId);

        if (!found) {
          setError("Expense not found.");
          return;
        }

        setExpense(found);
      } catch (e: any) {
        setError(e.message ?? "Unable to load expense.");
      } finally {
        setInitialLoading(false);
      }
    };

    void fetchExpense();
  }, [expenseId]);

  const initialAmount = useMemo(() => {
    if (!expense)
      return "-";
    return String(expense.amount);
  }, [expense]);

  const handleSubmit = async (data: IouCreateInput) => {
    try {
      setLoading(true);
      await addIou(data);
      router.back();
    } catch (e: any) {
      setError(e.message ?? "Unable to create IOU.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create IOU" />
      </Appbar.Header>

      <Surface
        style={{
          flex: 1,
          padding: 20,
          gap: 16,
          backgroundColor: theme.colors.background,
        }}
      >
        {initialLoading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
            {error}
          </Text>
        ) : expense ? (
          <>
            <Text variant="bodyMedium">
              Expense Amount: ₹ {initialAmount}
            </Text>

            <IouForm
              expenseId={expense.id}
              monthKey={expense.monthKey}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </>
        ) : null}
      </Surface>
    </SafeAreaView>
  );
}
