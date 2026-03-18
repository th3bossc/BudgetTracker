import { useState } from "react";
import { Platform, View } from "react-native";
import { Button, Divider, HelperText, TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-paper-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { useRouter } from "expo-router";
import { getMonthKey } from "@/utils/date";
import type { CreditCardPayment } from "@/types/schema";
import type {
    CreditCardPaymentCreateInput,
    CreditCardPaymentUpdateInput,
} from "@/types/create";

interface Props {
    initialData?: CreditCardPayment;
    defaultPaymentMethodId?: string;
    onSubmit: ((data: CreditCardPaymentCreateInput) => Promise<void>) | ((data: CreditCardPaymentUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function CreditCardPaymentForm({
    initialData,
    defaultPaymentMethodId,
    onSubmit,
    loading,
}: Props) {
    const router = useRouter();
    const { bankAccounts, paymentMethods } = useFinanceConfig();

    const [paymentMethodId, setPaymentMethodId] = useState(
        initialData?.paymentMethod.id ?? defaultPaymentMethodId ?? ""
    );
    const [bankAccountId, setBankAccountId] = useState(
        initialData?.bankAccount.id ?? ""
    );
    const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [date, setDate] = useState<Date>(initialData?.date ?? new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const creditCardOptions = [
        ...paymentMethods
            .filter(method => method.isCreditCard)
            .map(method => ({
                label: method.name,
                value: method.id,
            })),
        { label: "+ Add New Payment Method", value: "__add_new__" },
    ];
    const bankAccountOptions = [
        ...bankAccounts.map(account => ({
            label: account.name,
            value: account.id,
        })),
        { label: "+ Add New Bank Account", value: "__add_new__" },
    ];

    const handleSubmit = async () => {
        const parsedAmount = Number(amount);

        if (!paymentMethodId || !bankAccountId) {
            setError("Credit card and bank account are required.");
            return;
        }

        if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Amount must be a positive number.");
            return;
        }

        await onSubmit({
            paymentMethod: { id: paymentMethodId },
            bankAccount: { id: bankAccountId },
            amount: parsedAmount,
            description,
            date,
            monthKey: getMonthKey(date),
        });

        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>
            <Dropdown
                label="Credit Card"
                mode="outlined"
                value={paymentMethodId}
                options={creditCardOptions}
                onSelect={(val?: string) => {
                    if (!val) {
                        return;
                    }

                    if (val === "__add_new__") {
                        router.push("/payment-method/create");
                        return;
                    }

                    setPaymentMethodId(val);
                }}
            />

            <Dropdown
                label="Pay From Bank Account"
                mode="outlined"
                value={bankAccountId}
                options={bankAccountOptions}
                onSelect={(val?: string) => {
                    if (!val) {
                        return;
                    }

                    if (val === "__add_new__") {
                        router.push("/bank-account/create");
                        return;
                    }

                    setBankAccountId(val);
                }}
            />

            <TextInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
            />

            <TextInput
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
            />

            <TextInput
                label="Date"
                value={date.toDateString()}
                mode="outlined"
                right={<TextInput.Icon icon="calendar" />}
                onPressIn={() => setShowDatePicker(true)}
            />

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={(_, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            setDate(selectedDate);
                        }
                    }}
                />
            )}

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
                {initialData ? "Update Payment" : "Record Payment"}
            </Button>
        </View>
    );
}
