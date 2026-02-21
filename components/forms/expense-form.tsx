import { useState } from "react";
import { View, Platform } from "react-native";
import {
    TextInput,
    Button,
    HelperText,
    Divider,
    useTheme,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-paper-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { useRouter } from "expo-router";
import { getMonthKey } from "@/utils/date";
import { Expense } from "@/types/schema";
import { ExpenseCreateInput, ExpenseUpdateInput } from "@/types/create";

interface Props {
    initialData?: Expense,
    onSubmit: ((data: ExpenseCreateInput) => Promise<void>) | ((data: ExpenseUpdateInput) => Promise<void>);
    loading: boolean;
}

export default function ExpenseForm({
    initialData,
    onSubmit,
    loading,
}: Props) {
    const router = useRouter();
    const { categories, paymentMethods } = useFinanceConfig();

    const [amount, setAmount] = useState(
        initialData?.amount?.toString() ?? ""
    );
    const [description, setDescription] = useState<string>(
        initialData?.description ?? ""
    );
    const [categoryId, setCategoryId] = useState<string>(
        initialData?.category.id ?? ""
    );
    const [date, setDate] = useState<Date>(
        initialData?.date ?? new Date()
    );

    const [paymentMethodId, setPaymentMethodId] = useState<string>(
        initialData?.paymentMethod.id ?? ""
    )

    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const categoryOptions = [
        ...categories.map(c => ({
            label: c.name,
            value: c.id,
        })),
        { label: "+ Add New Category", value: "__add_new__" },
    ];

    const paymentMethodOptions = [
        ...paymentMethods.map(p => ({
            label: p.name,
            value: p.id,
        })),
        { label: "+ Add New Payment Method", value: "__add_new__"}
    ]

    const handleSubmit = async () => {
        if (!amount || !categoryId || !paymentMethodId) {
            setError("Amount, payment method and category are required.");
            return;
        }

        await onSubmit({
            amount: Number(amount),
            description,
            category: { id: categoryId },
            paymentMethod: { id: paymentMethodId },
            date,
            monthKey: getMonthKey(date),
        });

        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>

            <TextInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
            />

            <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
            />

            <Dropdown
                label="Category"
                mode="outlined"
                value={categoryId}
                options={categoryOptions}
                onSelect={(val?: string) => {
                    if (!val)
                        return;
                    if (val === "__add_new__") {
                        router.push("/expense-category/create");
                        return;
                    }
                    setCategoryId(val);
                }}
            />

            <Dropdown
                label="Payment method"
                mode="outlined"
                value={paymentMethodId}
                options={paymentMethodOptions}
                onSelect={(val?: string) => {
                    if (!val)
                        return;
                    if (val == "__add_new__") {
                        router.push('/payment-method/create');
                        return;
                    }
                    setPaymentMethodId(val);
                }}
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
                {initialData ? "Update Expense" : "Create Expense"}
            </Button>

        </View>
    );
}