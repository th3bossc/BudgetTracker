import { useState } from "react";
import { View, Platform } from "react-native";
import {
    TextInput,
    Button,
    HelperText,
    Divider,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "@/components/form-fields/keyboard-aware-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { useRouter } from "expo-router";
import { getMonthKey } from "@/utils/date";
import type { Income } from "@/types/schema";
import type { IncomeCreateInput, IncomeUpdateInput } from "@/types/create";
import { getSelectableOptions } from "@/utils/archived-options";

interface Props {
    initialData?: Income;
    onSubmit: ((data: IncomeCreateInput) => Promise<void>) | ((data: IncomeUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function IncomeForm({
    initialData,
    onSubmit,
    loading,
}: Props) {
    const router = useRouter();
    const { incomeSources, bankAccounts } = useFinanceConfig();

    const [amount, setAmount] = useState(
        initialData?.amount?.toString() ?? ""
    );
    const [description, setDescription] = useState(
        initialData?.description ?? ""
    );
    const [sourceId, setSourceId] = useState(
        initialData?.source.id ?? ""
    );
    const [bankAccountId, setBankAccountId] = useState(
        initialData?.bankAccount?.id ?? ""
    );
    const [date, setDate] = useState<Date>(
        initialData?.date ?? new Date()
    );

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sourceOptions = [
        ...getSelectableOptions(incomeSources, sourceId),
        { label: "+ Add New Income Source", value: "__add_new__" },
    ];

    const bankAccountOptions = [
        ...getSelectableOptions(bankAccounts, bankAccountId),
        { label: "+ Add New Bank Account", value: "__add_new__" },
    ];

    const handleSubmit = async () => {
        if (!amount || !sourceId || !bankAccountId) {
            setError("Amount, source and destination account are required.");
            return;
        }

        await onSubmit({
            amount: Number(amount),
            description,
            source: { id: sourceId },
            bankAccount: { id: bankAccountId },
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
                label="Income Source"
                mode="outlined"
                value={sourceId}
                options={sourceOptions}
                onSelect={(val?: string) => {
                    if (!val)
                        return;
                    if (val === "__add_new__") {
                        router.push("/income-source/create");
                        return;
                    }
                    setSourceId(val);
                }}
            />

            <Dropdown
                label="Destination Account"
                mode="outlined"
                value={bankAccountId}
                options={bankAccountOptions}
                onSelect={(val?: string) => {
                    if (!val)
                        return;
                    if (val === "__add_new__") {
                        router.push("/bank-account/create");
                        return;
                    }
                    setBankAccountId(val);
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
                {initialData ? "Update Income" : "Create Income"}
            </Button>

        </View>
    );
}
