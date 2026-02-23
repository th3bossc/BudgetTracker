import PaymentMethodForm from "@/components/forms/payment-method-form";
import { } from "@/services/investment-type-service";
import { getPaymentMethods, updatePaymentMethod } from "@/services/payment-method-service";
import { PaymentMethodUpdateInput } from "@/types/create";
import { PaymentMethod } from "@/types/schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Appbar,
    Surface,
    useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditPaymentMethodPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();

    const [method, setMethod] = useState<PaymentMethod | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchMethod = async () => {
            const types = await getPaymentMethods();
            const found = types.find(t => t.id === id);
            setMethod(found ?? null);
            setInitialLoading(false);
        };

        if (id) fetchMethod();
    }, [id]);

    const handleSubmit = async (data: PaymentMethodUpdateInput) => {
        try {
            setLoading(true);
            await updatePaymentMethod(id as string, data);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Edit Payment Method" />
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
                ) : method ? (
                    <PaymentMethodForm
                        initialData={method}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                ) : null}
            </Surface>
        </SafeAreaView>
    );
}