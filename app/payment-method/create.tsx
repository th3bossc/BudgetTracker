import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Appbar, Surface, useTheme } from "react-native-paper";
import { addInvestmentType } from "@/services/investment-type-service";
import { PaymentMethodCreateInput } from "@/types/create";
import PaymentMethodForm from "@/components/forms/payment-method-form";
import { addPaymentMethod } from "@/services/payment-method-service";

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
        <SafeAreaView style={{ flex: 1 }}>
            <Appbar.Header>
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