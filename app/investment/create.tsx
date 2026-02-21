import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Appbar, Surface, useTheme } from "react-native-paper";
import InvestmentForm from "@/components/forms/investment-form";
import { addInvestment } from "@/services/investment-service";
import { InvestmentCreateInput } from "@/types/create";

export default function CreateInvestmentPage() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: InvestmentCreateInput) => {
    try {
      setLoading(true);
      await addInvestment(data);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create Investment" />
      </Appbar.Header>

      <Surface
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: theme.colors.background,
        }}
      >
        <InvestmentForm
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Surface>
    </SafeAreaView>
  );
}