import CategoryForm from "@/components/forms/expense-category-form";
import { addExpenseCategory } from "@/services/expense-category-service";
import { ExpenseCategoryCreateInput } from "@/types/create";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Appbar, Surface, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateCategoryPage() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ExpenseCategoryCreateInput) => {
    try {
      setLoading(true);
      await addExpenseCategory(data);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create Category" />
      </Appbar.Header>

      <Surface style={{ flex: 1, padding: 20, backgroundColor: theme.colors.background }}>
        <CategoryForm onSubmit={handleSubmit} loading={loading} />
      </Surface>
    </SafeAreaView>
  );
}