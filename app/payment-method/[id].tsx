import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Appbar,
    Surface,
    ActivityIndicator,
    useTheme,
} from "react-native-paper";
import {
} from "@/services/investment-type-service";
import { PaymentMethod } from "@/types/schema";
import { getPaymentMethods, updatePaymentMethod } from "@/services/payment-method-service";
import { PaymentMethodUpdateInput } from "@/types/create";
import PaymentMethodForm from "@/components/forms/payment-method-form";

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