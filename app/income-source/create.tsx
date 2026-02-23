import IncomeSourceForm from "@/components/forms/income-source-form";
import { addIncomeSource } from "@/services/income-source-service";
import { IncomeSourceCreateInput } from "@/types/create";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Appbar, Surface, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateIncomeSourcePage() {
    const router = useRouter();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: IncomeSourceCreateInput) => {
        try {
            setLoading(true);
            await addIncomeSource(data);
            router.back();
        } catch (error) {
            console.error("Create income source failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Create Income Source" />
            </Appbar.Header>

            <Surface
                style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: theme.colors.background,
                }}
            >
                <IncomeSourceForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </Surface>
        </SafeAreaView>
    );
}