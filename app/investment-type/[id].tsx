import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Appbar,
    Surface,
    ActivityIndicator,
    useTheme,
} from "react-native-paper";
import InvestmentTypeForm from "@/components/forms/investment-type-form";
import {
    getInvestmentTypes,
    updateInvestmentType,
} from "@/services/investment-type-service";
import { InvestmentTypeUpdateInput } from "@/types/create";
import { InvestmentType } from "@/types/schema";

export default function EditInvestmentTypePage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();

    const [type, setType] = useState<InvestmentType | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchType = async () => {
            const types = await getInvestmentTypes();
            const found = types.find(t => t.id === id);
            setType(found ?? null);
            setInitialLoading(false);
        };

        if (id) fetchType();
    }, [id]);

    const handleSubmit = async (data: InvestmentTypeUpdateInput) => {
        try {
            setLoading(true);
            await updateInvestmentType(id as string, data);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Edit Investment Type" />
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
                ) : type ? (
                    <InvestmentTypeForm
                        initialData={type}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                ) : null}
            </Surface>
        </SafeAreaView>
    );
}