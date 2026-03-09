import { useState } from "react";
import { View, Platform } from "react-native";
import { Button, Divider, HelperText, TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-paper-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { useRouter } from "expo-router";
import { getMonthKey } from "@/utils/date";
import type { AccountTransfer } from "@/types/schema";
import type { AccountTransferCreateInput, AccountTransferUpdateInput } from "@/types/create";

interface Props {
    initialData?: AccountTransfer;
    onSubmit: ((data: AccountTransferCreateInput) => Promise<void>) | ((data: AccountTransferUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function AccountTransferForm({
    initialData,
    onSubmit,
    loading,
}: Props) {
    const router = useRouter();
    const { bankAccounts } = useFinanceConfig();

    const [fromBankAccountId, setFromBankAccountId] = useState(
        initialData?.fromBankAccount.id ?? ""
    );
    const [toBankAccountId, setToBankAccountId] = useState(
        initialData?.toBankAccount.id ?? ""
    );
    const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [date, setDate] = useState<Date>(initialData?.date ?? new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const bankAccountOptions = [
        ...bankAccounts.map(account => ({
            label: account.name,
            value: account.id,
        })),
        { label: "+ Add New Bank Account", value: "__add_new__" },
    ];

    const handleSubmit = async () => {
        const parsedAmount = Number(amount);

        if (!fromBankAccountId || !toBankAccountId) {
            setError("From and to accounts are required.");
            return;
        }

        if (fromBankAccountId === toBankAccountId) {
            setError("From and to accounts must be different.");
            return;
        }

        if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Amount must be a positive number.");
            return;
        }

        await onSubmit({
            fromBankAccount: { id: fromBankAccountId },
            toBankAccount: { id: toBankAccountId },
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
                label="From Account"
                mode="outlined"
                value={fromBankAccountId}
                options={bankAccountOptions}
                onSelect={(val?: string) => {
                    if (!val) {
                        return;
                    }

                    if (val === "__add_new__") {
                        router.push("/bank-account/create");
                        return;
                    }

                    setFromBankAccountId(val);
                }}
            />

            <Dropdown
                label="To Account"
                mode="outlined"
                value={toBankAccountId}
                options={bankAccountOptions}
                onSelect={(val?: string) => {
                    if (!val) {
                        return;
                    }

                    if (val === "__add_new__") {
                        router.push("/bank-account/create");
                        return;
                    }

                    setToBankAccountId(val);
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
                {initialData ? "Update Transfer" : "Create Transfer"}
            </Button>
        </View>
    );
}
