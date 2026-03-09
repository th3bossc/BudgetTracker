import type { BankAccountCreateInput, BankAccountUpdateInput } from "@/types/create";
import type { BankAccount } from "@/types/schema";
import { useState } from "react";
import { View } from "react-native";
import { Button, Divider, HelperText, Switch, Text, TextInput } from "react-native-paper";

interface Props {
    initialData?: BankAccount;
    onSubmit: ((data: BankAccountCreateInput) => Promise<void>) | ((data: BankAccountUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function BankAccountForm({
    initialData,
    onSubmit,
    loading,
}: Props) {
    const [name, setName] = useState(initialData?.name ?? "");
    const [openingBalance, setOpeningBalance] = useState(
        initialData?.openingBalance?.toString() ?? "0"
    );
    const [minimumBalance, setMinimumBalance] = useState(
        initialData?.minimumBalance?.toString() ?? ""
    );
    const [isArchived, setIsArchived] = useState(initialData?.isArchived ?? false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        const parsedOpeningBalance = Number(openingBalance);
        const parsedMinimumBalance = minimumBalance ? Number(minimumBalance) : undefined;

        if (!name) {
            setError("Account name is required.");
            return;
        }

        if (Number.isNaN(parsedOpeningBalance)) {
            setError("Opening balance must be a valid number.");
            return;
        }

        if (minimumBalance && Number.isNaN(parsedMinimumBalance)) {
            setError("Minimum balance must be a valid number.");
            return;
        }

        await onSubmit({
            name,
            openingBalance: parsedOpeningBalance,
            minimumBalance: parsedMinimumBalance,
            isArchived,
        });
        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>
            <TextInput
                label="Account Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
            />

            <TextInput
                label="Opening Balance"
                value={openingBalance}
                onChangeText={setOpeningBalance}
                keyboardType="numeric"
                mode="outlined"
            />

            <TextInput
                label="Minimum Balance (optional)"
                value={minimumBalance}
                onChangeText={setMinimumBalance}
                keyboardType="numeric"
                mode="outlined"
            />

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Switch value={isArchived} onValueChange={setIsArchived} />
                <Text>Archived</Text>
            </View>

            {error && <HelperText type="error">{error}</HelperText>}

            <Divider />

            <Button mode="contained" onPress={handleSubmit} loading={loading}>
                {initialData ? "Update Account" : "Create Account"}
            </Button>
        </View>
    );
}
