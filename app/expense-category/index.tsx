import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View } from "react-native";
import {
    Appbar,
    Card,
    Text,
    FAB,
    Switch,
    useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { updateExpenseCategory } from "@/services/expense-category-service";
import { useCallback } from "react";

export default function CategoryListPage() {
    const router = useRouter();
    const theme = useTheme();
    const { categories } = useFinanceConfig();

    const toggleArchive = useCallback(async (id: string, current: boolean) => {
        await updateExpenseCategory(id, {
            isArchived: !current,
        });
    }, []);

    const backAction = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={backAction} />
                <Appbar.Content title="Expense Categories" />
            </Appbar.Header>

            <FlatList
                contentContainerStyle={{ padding: 16, gap: 12 }}
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card
                        onPress={() => router.push(`/expense-category/${item.id}`)}
                    >
                        <Card.Content
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <View
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 4,
                                        backgroundColor: item.color,
                                    }}
                                />

                                <Text
                                    variant="bodyLarge"
                                    style={{
                                        opacity: item.isArchived ? 0.5 : 1,
                                    }}
                                >
                                    {item.name}
                                </Text>
                            </View>

                            <Switch
                                value={!item.isArchived}
                                onValueChange={() =>
                                    toggleArchive(item.id, item.isArchived ?? false)
                                }
                            />
                        </Card.Content>
                    </Card>
                )}
            />

            <FAB
                icon="plus"
                style={{
                    position: "absolute",
                    right: 16,
                    bottom: 16,
                }}
                onPress={() => router.push("/expense-category/create")}
            />
        </SafeAreaView>
    );
}