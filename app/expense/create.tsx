import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Appbar,
  Surface,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import ExpenseForm from "@/components/forms/expense-form";
import { addExpense } from "@/services/expense-service";
import type { ExpenseCreateInput } from "@/types/create";

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
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
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