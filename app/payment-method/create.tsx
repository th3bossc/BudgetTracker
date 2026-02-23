import PaymentMethodForm from "@/components/forms/payment-method-form";
import { addPaymentMethod } from "@/services/payment-method-service";
import { PaymentMethodCreateInput } from "@/types/create";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Appbar, Surface, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePaymentMethodPage() {
    const router = useRouter();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: PaymentMethodCreateInput) => {
        try {
            setLoading(true);
            await addPaymentMethod(data);
            router.back();
        } catch (error) {
            console.error("Create payment method failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Create Payment Method" />
            </Appbar.Header>

            <Surface
                style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: theme.colors.background,
                }}
            >
                <PaymentMethodForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </Surface>
        </SafeAreaView>
    );
}