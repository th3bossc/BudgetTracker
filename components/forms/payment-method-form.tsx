import { PaymentMethodCreateInput, PaymentMethodUpdateInput } from "@/types/create";
import { PaymentMethod } from "@/types/schema";
import { useState } from "react";
import { View } from "react-native";
import { Dropdown } from "react-native-paper-dropdown";
import {
    TextInput,
    Button,
    HelperText,
    Divider,
    Switch,
    Text,
} from "react-native-paper";
import ColorPicker from "../form-fields/color-picker";
import IconPicker from "../form-fields/icon-picker";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { useRouter } from "expo-router";

interface Props {
    initialData?: PaymentMethod;
    onSubmit: ((data: PaymentMethodCreateInput) => Promise<void>) | ((data: PaymentMethodUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function PaymentMethodForm({
    initialData,
    onSubmit,
    loading,
}: Props) {
    const router = useRouter();
    const { bankAccounts } = useFinanceConfig();
    const [name, setName] = useState(initialData?.name ?? "");
    const [color, setColor] = useState(initialData?.color ?? "#9C27B0");
    const [icon, setIcon] = useState(initialData?.icon ?? "");
    const [isArchived, setIsArchived] = useState(
        initialData?.isArchived ?? false
    );
    const [bankAccountId, setBankAccountId] = useState(
        initialData?.bankAccount?.id ?? ""
    );
    const [isCreditCard, setIsCreditCard] = useState(
        initialData?.isCreditCard ?? false
    );
    const [creditLimit, setCreditLimit] = useState(
        initialData?.creditLimit?.toString() ?? ""
    );
    const [statementClosingDay, setStatementClosingDay] = useState(
        initialData?.statementClosingDay?.toString() ?? ""
    );
    const [billingDueDay, setBillingDueDay] = useState(
        initialData?.billingDueDay?.toString() ?? ""
    );
    const [error, setError] = useState<string | null>(null);
    const bankAccountOptions = [
        ...bankAccounts.map(account => ({
            label: account.name,
            value: account.id,
        })),
        { label: "+ Add New Bank Account", value: "__add_new__" },
    ];

    const handleSubmit = async () => {
        if (!name) {
            setError("Payment method name is required.");
            return;
        }

        const parsedCreditLimit = Number(creditLimit);
        const parsedClosingDay = Number(statementClosingDay);
        const parsedDueDay = Number(billingDueDay);

        if (isCreditCard) {
            if (!creditLimit || Number.isNaN(parsedCreditLimit) || parsedCreditLimit <= 0) {
                setError("Credit limit must be a positive number.");
                return;
            }

            if (
                !statementClosingDay
                || Number.isNaN(parsedClosingDay)
                || parsedClosingDay < 1
                || parsedClosingDay > 31
            ) {
                setError("Statement closing day must be between 1 and 31.");
                return;
            }

            if (
                !billingDueDay
                || Number.isNaN(parsedDueDay)
                || parsedDueDay < 1
                || parsedDueDay > 31
            ) {
                setError("Billing due day must be between 1 and 31.");
                return;
            }
        }

        await onSubmit({
            name,
            color,
            icon,
            isArchived,
            bankAccount: bankAccountId ? { id: bankAccountId } : undefined,
            isCreditCard,
            creditLimit: isCreditCard ? parsedCreditLimit : undefined,
            statementClosingDay: isCreditCard ? parsedClosingDay : undefined,
            billingDueDay: isCreditCard ? parsedDueDay : undefined,
        });
        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>
            <TextInput
                label="Payment Method Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
            />

            <ColorPicker
                color={color}
                onSelect={setColor}
            />

            <IconPicker
                icon={icon}
                onSelect={setIcon}
            />

            <Dropdown
                mode="outlined"
                label="Linked Bank Account"
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

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Switch value={isArchived} onValueChange={setIsArchived} />
                <Text>Archived</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Switch value={isCreditCard} onValueChange={setIsCreditCard} />
                <Text>Credit Card</Text>
            </View>

            {isCreditCard && (
                <>
                    <TextInput
                        label="Credit Limit"
                        value={creditLimit}
                        onChangeText={setCreditLimit}
                        keyboardType="numeric"
                        mode="outlined"
                    />

                    <TextInput
                        label="Statement Closing Day (1-31)"
                        value={statementClosingDay}
                        onChangeText={setStatementClosingDay}
                        keyboardType="numeric"
                        mode="outlined"
                    />

                    <TextInput
                        label="Billing Due Day (1-31)"
                        value={billingDueDay}
                        onChangeText={setBillingDueDay}
                        keyboardType="numeric"
                        mode="outlined"
                    />
                </>
            )}

            {error && <HelperText type="error">{error}</HelperText>}

            <Divider />

            <Button mode="contained" onPress={handleSubmit} loading={loading}>
                {initialData ? "Update" : "Create"}
            </Button>
        </View>
    );
}
