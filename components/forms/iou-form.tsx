import { useState } from "react";
import { View } from "react-native";
import {
    Button,
    Divider,
    HelperText,
    TextInput,
} from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { useRouter } from "expo-router";
import type { IouCreateInput, IouUpdateInput } from "@/types/create";
import type { Iou } from "@/types/schema";

interface Props {
    expenseId: string;
    monthKey: string;
    initialData?: Iou;
    onSubmit: ((data: IouCreateInput) => Promise<void>) | ((data: IouUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function IouForm({
    expenseId,
    monthKey,
    initialData,
    onSubmit,
    loading,
}: Props) {
    const router = useRouter();
    const { paymentMethods } = useFinanceConfig();

    const [amountLeft, setAmountLeft] = useState(
        initialData ? String(initialData.amountLeft) : ""
    );

    const [paymentMethodId, setPaymentMethodId] = useState(
        initialData?.paymentMethod.id ?? ""
    );

    const [error, setError] = useState<string | null>(null);

    const paymentMethodOptions = [
        ...paymentMethods.map(p => ({
            label: p.name,
            value: p.id,
        })),
        { label: "+ Add New Payment Method", value: "__add_new__" },
    ];

    const handleSubmit = async () => {
        if (!amountLeft || !paymentMethodId) {
            setError("Amount left and payment method are required.");
            return;
        }

        const amount = Number(amountLeft);
        if (Number.isNaN(amount) || amount < 0) {
            setError("Amount left must be a valid non-negative number.");
            return;
        }

        const payload: any = {
            expense: { id: expenseId },
            paymentMethod: { id: paymentMethodId },
            amountLeft: amount,
            monthKey,
            isPaid: amount === 0,
        };

        if (amount === 0) {
            payload.paidAt = new Date();
        }

        await onSubmit(payload);

        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>
            <TextInput
                label="Amount Left"
                value={amountLeft}
                onChangeText={setAmountLeft}
                keyboardType="numeric"
                mode="outlined"
            />

            <Dropdown
                mode="outlined"
                label="Repayment Method"
                value={paymentMethodId}
                options={paymentMethodOptions}
                onSelect={(val?: string) => {
                    if (!val)
                        return;

                    if (val === "__add_new__") {
                        router.push("/payment-method/create");
                        return;
                    }

                    setPaymentMethodId(val);
                }}
            />

            {error && (
                <HelperText type="error" visible>
                    {error}
                </HelperText>
            )}

            <Divider />

            <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                contentStyle={{ paddingVertical: 8 }}
            >
                {initialData ? "Update IOU" : "Create IOU"}
            </Button>
        </View>
    );
}
