import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Appbar,
    Surface,
    ActivityIndicator,
    useTheme,
} from "react-native-paper";
import IncomeSourceForm from "@/components/forms/income-source-form";
import {
    getIncomeSources,
    updateIncomeSource,
} from "@/services/income-source-service";
import { IncomeSourceUpdateInput } from "@/types/create";
import { IncomeSource } from "@/types/schema";

export default function EditIncomeSourcePage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();

    const [source, setSource] = useState<IncomeSource | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchSource = async () => {
            const sources = await getIncomeSources();
            const found = sources.find(s => s.id === id);
            setSource(found ?? null);
            setInitialLoading(false);
        };

        if (id) fetchSource();
    }, [id]);

    const handleSubmit = async (data: IncomeSourceUpdateInput) => {
        try {
            setLoading(true);
            await updateIncomeSource(id as string, data);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Edit Income Source" />
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
                ) : source ? (
                    <IncomeSourceForm
                        initialData={source}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                ) : null}
            </Surface>
        </SafeAreaView>
    );
}