import { useState } from "react";
import { View } from "react-native";
import {
    TextInput,
    Button,
    HelperText,
    Divider,
    Switch,
    Text,
} from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import {
    InvestmentType,
    InvestmentRiskLevel,
} from "@/types/schema";
import { InvestmentTypeCreateInput, InvestmentTypeUpdateInput } from "@/types/create";

interface Props {
    initialData?: InvestmentType;
    onSubmit: ((data: InvestmentTypeCreateInput) => Promise<void>) | ((data: InvestmentTypeUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function InvestmentTypeForm({
    initialData,
    onSubmit,
    loading,
}: Props) {
    const [name, setName] = useState(initialData?.name ?? "");
    const [riskLevel, setRiskLevel] = useState(
        initialData?.riskLevel ?? InvestmentRiskLevel.MEDIUM
    );
    const [isArchived, setIsArchived] = useState(
        initialData?.isArchived ?? false
    );

    const [error, setError] = useState<string | null>(null);

    const riskOptions = Object.values(InvestmentRiskLevel).map(level => ({
        label: level.toUpperCase(),
        value: level,
    }));

    const handleSubmit = async () => {
        if (!name) {
            setError("Investment type name is required.");
            return;
        }

        await onSubmit({
            name,
            riskLevel,
            isArchived,
        });

        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>

            <TextInput
                label="Investment Type Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
            />

            <Dropdown
                label="Risk Level"
                mode="outlined"
                value={riskLevel}
                options={riskOptions}
                onSelect={(val?: string) => {
                    if (!val)
                        return;
                    setRiskLevel(val as InvestmentRiskLevel)
                }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Switch
                    value={isArchived}
                    onValueChange={setIsArchived}
                />
                <Text>Archived</Text>
            </View>

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
            >
                {initialData ? "Update Type" : "Create Type"}
            </Button>

        </View>
    );
}