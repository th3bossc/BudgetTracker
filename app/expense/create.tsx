import ExpenseForm from "@/components/forms/expense-form";
import { addExpense } from "@/services/expense-service";
import type { ExpenseCreateInput } from "@/types/create";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Appbar,
  Surface,
  useTheme
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateExpensePage() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ExpenseCreateInput) => {
    try {
      setLoading(true);
      await addExpense(data);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create Expense" />
      </Appbar.Header>

      <Surface
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: theme.colors.background,
        }}
      >
        <ExpenseForm
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Surface>
    </SafeAreaView>
  );
}