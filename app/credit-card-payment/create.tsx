import CreditCardPaymentForm from "@/components/forms/credit-card-payment-form";
import { addCreditCardPayment } from "@/services/credit-card-payment-service";
import type { CreditCardPaymentCreateInput } from "@/types/create";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Appbar, Surface, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateCreditCardPaymentPage() {
    const { paymentMethodId } = useLocalSearchParams<{ paymentMethodId?: string }>();
    const router = useRouter();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: CreditCardPaymentCreateInput) => {
        try {
            setLoading(true);
            await addCreditCardPayment(data);
            router.back();
        } catch (error) {
            console.error("Create credit card payment failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Record Credit Card Payment" />
            </Appbar.Header>

            <Surface
                style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: theme.colors.background,
                }}
            >
                <CreditCardPaymentForm
                    defaultPaymentMethodId={paymentMethodId}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </Surface>
        </SafeAreaView>
    );
}
