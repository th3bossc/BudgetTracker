import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Appbar,
  Surface,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import InvestmentForm from "@/components/forms/investment-form";
import {
  getInvestments,
  updateInvestment,
} from "@/services/investment-service";
import { Investment } from "@/types/schema";
import { InvestmentUpdateInput } from "@/types/create";

export default function EditInvestmentPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchInvestment = async () => {
      const investments = await getInvestments();
      const found = investments.find(i => i.id === id);
      setInvestment(found ?? null);
      setInitialLoading(false);
    };

    if (id) fetchInvestment();
  }, [id]);

  const handleSubmit = async (data: InvestmentUpdateInput) => {
    try {
      setLoading(true);
      await updateInvestment(id as string, data);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Investment" />
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
        ) : investment ? (
          <InvestmentForm
            initialData={investment}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : null}
      </Surface>
    </SafeAreaView>
  );
}