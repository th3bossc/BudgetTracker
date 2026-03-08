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
import { formatNumber } from "@/utils/number";

interface Props {
    expenseId: string;
    expenseMonthKey: string;
    createdMonthKey: string;
    defaultInitialAmount?: number;
    initialData?: Iou;
    onSubmit: ((data: IouCreateInput) => Promise<void>) | ((data: IouUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function IouForm({
    expenseId,
    expenseMonthKey,
    createdMonthKey,
    defaultInitialAmount,
    initialData,
    onSubmit,
    loading,
}: Props) {
    const router = useRouter();
    const { paymentMethods } = useFinanceConfig();

    const [initialAmount, setInitialAmount] = useState(
        initialData
            ? String(initialData.initialAmount)
            : defaultInitialAmount !== undefined
                ? String(defaultInitialAmount)
                : ""
    );
    const [amountPaid, setAmountPaid] = useState(
        initialData
            ? String(Math.max(initialData.initialAmount - initialData.amountLeft, 0))
            : "0"
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
        if (!initialAmount || !paymentMethodId) {
            setError("Initial amount and payment method are required.");
            return;
        }

        const initial = Number(initialAmount);
        const paid = Number(amountPaid || "0");

        if (Number.isNaN(initial) || initial < 0) {
            setError("Initial amount must be a valid non-negative number.");
            return;
        }

        if (Number.isNaN(paid) || paid < 0) {
            setError("Amount paid must be a valid non-negative number.");
            return;
        }

        if (paid > initial) {
            setError("Amount paid cannot be greater than initial amount.");
            return;
        }

        const amountLeft = Math.max(initial - paid, 0);

        const payload: any = {
            expense: { id: expenseId },
            paymentMethod: { id: paymentMethodId },
            initialAmount: initial,
            amountLeft,
            expenseMonthKey,
            createdMonthKey,
            isPaid: amountLeft === 0,
        };

        if (amountLeft === 0) {
            payload.paidAt = new Date();
        }

        await onSubmit(payload);

        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>
            <TextInput
                label="Initial IOU Amount"
                value={initialAmount}
                onChangeText={setInitialAmount}
                keyboardType="numeric"
                mode="outlined"
            />

            <TextInput
                label="Amount Paid"
                value={amountPaid}
                onChangeText={setAmountPaid}
                keyboardType="numeric"
                mode="outlined"
            />

            <TextInput
                label="Amount Left"
                value={(() => {
                    const initial = Number(initialAmount || "0");
                    const paid = Number(amountPaid || "0");
                    if (Number.isNaN(initial) || Number.isNaN(paid)) {
                        return "-";
                    }

                    return formatNumber(Math.max(initial - paid, 0));
                })()}
                mode="outlined"
                disabled
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
