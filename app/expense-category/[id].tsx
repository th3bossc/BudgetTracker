import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import CategoryForm from "@/components/forms/expense-category-form";
import {
    getExpenseCategories,
    updateExpenseCategory,
} from "@/services/expense-category-service";
import { ExpenseCategory } from "@/types/schema";
import { ExpenseCategoryUpdateInput } from "@/types/create";
import { Appbar, Surface, useTheme } from "react-native-paper";

export default function EditCategoryPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();
    const [category, setCategory] = useState<ExpenseCategory | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetch = async () => {
            const list = await getExpenseCategories();
            const found = list.find(c => c.id === id);
            setCategory(found ?? null);
            setInitialLoading(false);
        };
        if (id) fetch();
    }, [id]);

    const handleSubmit = async (data: ExpenseCategoryUpdateInput) => {
        try {
            setLoading(true);
            await updateExpenseCategory(id!, data);
            router.back();
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Edit Investment Type" />
            </Appbar.Header>

            <Surface
                style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: theme.colors.background,
                }}
            >
                {initialLoading ? (
                    <ActivityIndicator />
                ) : category ? (
                    <CategoryForm
                        initialData={category}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                ) : null}
            </Surface>
        </SafeAreaView>
    );
}