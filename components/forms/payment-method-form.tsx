import { PaymentMethodCreateInput, PaymentMethodUpdateInput } from "@/types/create";
import { PaymentMethod } from "@/types/schema";
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
import ColorPicker from "../form-fields/color-picker";
import IconPicker from "../form-fields/icon-picker";

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
    const [name, setName] = useState(initialData?.name ?? "");
    const [color, setColor] = useState(initialData?.color ?? "#9C27B0");
    const [icon, setIcon] = useState(initialData?.icon ?? "");
    const [isArchived, setIsArchived] = useState(
        initialData?.isArchived ?? false
    );
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name) {
            setError("Payment method name is required.");
            return;
        }

        await onSubmit({ name, color, icon, isArchived });
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

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Switch value={isArchived} onValueChange={setIsArchived} />
                <Text>Archived</Text>
            </View>

            {error && <HelperText type="error">{error}</HelperText>}

            <Divider />

            <Button mode="contained" onPress={handleSubmit} loading={loading}>
                {initialData ? "Update" : "Create"}
            </Button>
        </View>
    );
}
