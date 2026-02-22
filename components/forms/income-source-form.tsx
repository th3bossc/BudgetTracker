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
import type { IncomeSource } from "@/types/schema";
import { IncomeSourceCreateInput, IncomeSourceUpdateInput } from "@/types/create";
import ColorPicker from "react-native-wheel-color-picker";
interface Props {
    initialData?: IncomeSource;
    onSubmit: ((data: IncomeSourceCreateInput) => Promise<void>) | ((data: IncomeSourceUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function IncomeSourceForm({
    initialData,
    onSubmit,
    loading,
}: Props) {
    const [name, setName] = useState(initialData?.name ?? "");
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [color, setColor] = useState(initialData?.color ?? "#2196F3");
    const [isArchived, setIsArchived] = useState(
        initialData?.isArchived ?? false
    );

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name) {
            setError("Income source name is required.");
            return;
        }

        await onSubmit({
            name,
            color,
            isArchived,
        });

        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>

            <TextInput
                label="Income Source Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
            />

            <Button
                mode="outlined"
                onPress={() => setShowColorPicker(prev => !prev)}
            >
                Pick color
            </Button>

            {
                showColorPicker && (
                    <ColorPicker
                        color={color}
                        onColorChange={setColor}
                        thumbSize={30}
                        sliderSize={30}
                        noSnap
                        row={false}
                    />
                )
            }

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
                {initialData ? "Update Source" : "Create Source"}
            </Button>

        </View>
    );
}