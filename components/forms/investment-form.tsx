import { useState } from "react";
import { View, Platform } from "react-native";
import {
    TextInput,
    Button,
    HelperText,
    Divider,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-paper-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { useRouter } from "expo-router";
import { getMonthKey } from "@/utils/date";
import type { Investment } from "@/types/schema";
import { InvestmentCreateInput, InvestmentUpdateInput } from "@/types/create";

interface Props {
    initialData?: Investment;
    onSubmit: ((data: InvestmentCreateInput) => Promise<void>) | ((data: InvestmentUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function InvestmentForm({
    initialData,
    onSubmit,
    loading,
}: Props) {
    const router = useRouter();
    const { investmentTypes, paymentMethods } = useFinanceConfig();

    const [name, setName] = useState(
        initialData?.name ?? ""
    );
    const [amount, setAmount] = useState(
        initialData?.amount?.toString() ?? ""
    );
    const [description, setDescription] = useState(
        initialData?.description ?? ""
    );
    const [typeId, setTypeId] = useState(
        initialData?.type?.id ?? ""
    );
    const [paymentMethodId, setPaymentMethodId] = useState(
        initialData?.paymentMethod?.id ?? "__none__"
    );
    const [date, setDate] = useState<Date>(
        initialData?.date ?? new Date()
    );

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const typeOptions = [
        ...investmentTypes.map(t => ({
            label: t.name,
            value: t.id,
        })),
        { label: "+ Add New Investment Type", value: "__add_new__" },
    ];

    const paymentMethodOptions = [
        { label: "No Payment Method", value: "__none__" },
        ...paymentMethods.map(method => ({
            label: method.name,
            value: method.id,
        })),
        { label: "+ Add New Payment Method", value: "__add_new__" },
    ];

    const handleSubmit = async () => {
        if (!name || !amount || !typeId) {
            setError("Name, amount and type are required.");
            return;
        }

        await onSubmit({
            name,
            type: { id: typeId },
            paymentMethod: paymentMethodId === "__none__"
                ? undefined
                : { id: paymentMethodId },
            description,
            amount: Number(amount),
            date,
            monthKey: getMonthKey(date),
        });

        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>

            <TextInput
                label="Investment Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
            />

            <Dropdown
                label="Investment Type"
                mode="outlined"
                value={typeId}
                options={typeOptions}
                onSelect={(val?: string) => {
                    if (!val)
                        return;
                    if (val === "__add_new__") {
                        router.push("/investment-type/create");
                        return;
                    }
                    setTypeId(val);
                }}
            />

            <Dropdown
                label="Payment Method (Optional)"
                mode="outlined"
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

            <TextInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
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
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}

            <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
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
                {initialData ? "Update Investment" : "Create Investment"}
            </Button>

        </View>
    );
}
