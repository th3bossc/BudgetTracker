import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Appbar, Surface, useTheme } from "react-native-paper";
import InvestmentTypeForm from "@/components/forms/investment-type-form";
import { addInvestmentType } from "@/services/investment-type-service";
import { InvestmentTypeCreateInput } from "@/types/create";

export default function CreateInvestmentTypePage() {
    const router = useRouter();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: InvestmentTypeCreateInput) => {
        try {
            setLoading(true);
            await addInvestmentType(data);
            router.back();
        } catch (error) {
            console.error("Create investment type failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Create Investment Type" />
            </Appbar.Header>

            <Surface
                style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: theme.colors.background,
                }}
            >
                <InvestmentTypeForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </Surface>
        </SafeAreaView>
    );
}