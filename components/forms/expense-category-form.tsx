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
import type { ExpenseCategory } from "@/types/schema";
import type { ExpenseCategoryCreateInput, ExpenseCategoryUpdateInput } from "@/types/create";
import ColorPicker from 'react-native-wheel-color-picker';

interface Props {
    initialData?: ExpenseCategory;
    onSubmit: ((data: ExpenseCategoryCreateInput) => Promise<void>) | ((data: ExpenseCategoryUpdateInput) => Promise<void>);
    loading?: boolean;
}

export default function CategoryForm({
    initialData,
    onSubmit,
    loading,
}: Props) {
    const [name, setName] = useState(initialData?.name ?? "");
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [color, setColor] = useState(initialData?.color ?? "#4CAF50");
    const [icon, setIcon] = useState(initialData?.icon ?? "");
    const [isArchived, setIsArchived] = useState(
        initialData?.isArchived ?? false
    );

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name) {
            setError("Category name is required.");
            return;
        }

        await onSubmit({
            name,
            color,
            icon,
            isArchived,
        });

        setError(null);
    };

    return (
        <View style={{ gap: 24 }}>

            <TextInput
                label="Category Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
            />


            <TextInput
                label="Icon (MaterialCommunityIcons name)"
                value={icon}
                onChangeText={setIcon}
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
                {initialData ? "Update Category" : "Create Category"}
            </Button>

        </View>
    );
}