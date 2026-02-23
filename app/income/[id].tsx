import IncomeForm from "@/components/forms/income-form";
import {
  getIncomes,
  updateIncome,
} from "@/services/income-service";
import type { IncomeUpdateInput } from "@/types/create";
import type { Income } from "@/types/schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  Surface,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditIncomePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [income, setIncome] = useState<Income | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchIncome = async () => {
      const incomes = await getIncomes();
      const found = incomes.find(i => i.id === id);
      setIncome(found ?? null);
      setInitialLoading(false);
    };

    if (id) fetchIncome();
  }, [id]);

  const handleSubmit = async (data: IncomeUpdateInput) => {
    if (!id) return;

    try {
      setLoading(true);
      await updateIncome(id, data);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Income" />
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
        ) : income ? (
          <IncomeForm
            initialData={income}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : null}
      </Surface>
    </SafeAreaView>
  );
}