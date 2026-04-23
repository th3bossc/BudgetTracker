import Loading from "@/components/common/loading";
import { useBulkCategoryBudgets } from "@/hooks/use-bulk-category-budgets";
import { upsertBudget } from "@/services/category-budget-service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, View } from "react-native";
import {
  Appbar,
  Button,
  Divider,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BulkBudgetEditPage() {
    const theme = useTheme();
    const router = useRouter();

  const { monthKey } = useLocalSearchParams<{ monthKey: string }>();

    const {
        rows,
        updateAmount,
        loading,
        noCategories,
    } = useBulkCategoryBudgets(monthKey);

    const handleSave = useCallback(async () => {
        for (const row of rows) {
            const amount = Number(row.amount);

            if (!amount || amount <= 0) continue;

            await upsertBudget(row.categoryId, row.categoryName, monthKey, amount);
        }

        router.back();
    }, [rows, router, monthKey]);

    const textChangeHandler = useCallback((categoryId: string) => (text: string) => updateAmount(categoryId, text), [updateAmount]);

    if (loading) {
        return <Loading />
    }

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Edit Category Budgets" />
            </Appbar.Header>

            <FlatList
                contentContainerStyle={{ padding: 16, gap: 16 }}
                data={rows}
                keyExtractor={(item) => item.categoryId}
                renderItem={({ item }) => (
                    <View>
                        <Text variant="bodyMedium">
                            {item.categoryName}
                        </Text>

                        <TextInput
                            value={item.amount}
                            onChangeText={textChangeHandler(item.categoryId)}
                            keyboardType="numeric"
                            mode="outlined"
                            placeholder="Set monthly budget"
                        />
                    </View>
                )}
                ListEmptyComponent={
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
                        <Text variant="titleMedium">
                            No categories found
                        </Text>
                        <Text variant="bodyMedium" style={{ opacity: 0.6, textAlign: 'center', marginTop: 8 }}>
                            Add categories first before setting budgets.
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    noCategories
                        ? null
                        : <>
                            <Divider style={{ marginVertical: 20 }} />

                            <Button
                                mode="contained"
                                onPress={handleSave}
                            >
                                Save Budgets for {monthKey}
                            </Button>
                        </>
                }
            />
        </SafeAreaView>
    );
}
