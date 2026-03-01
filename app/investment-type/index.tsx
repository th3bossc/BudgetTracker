import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View } from "react-native";
import {
    Appbar,
    Card,
    Icon,
    Text,
    FAB,
    Switch,
    useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useFinanceConfig } from "@/hooks/use-finance-config";
import { useCallback } from "react";
import { updateInvestmentType } from "@/services/investment-type-service";

export default function InvestmentTypesListPage() {
    const router = useRouter();
    const theme = useTheme();
    const { investmentTypes } = useFinanceConfig();

    const toggleArchive = useCallback(async (id: string, current: boolean) => {
        await updateInvestmentType(id, {
            isArchived: !current,
        })
    }, []);

    const backAction = useCallback(() => router.back(), [router]);

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={backAction} />
                <Appbar.Content title="Investment Types" />
            </Appbar.Header>

            <FlatList
                contentContainerStyle={{ padding: 16, gap: 12 }}
                data={investmentTypes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card
                        onPress={() =>
                            router.push(`/investment-type/${item.id}`)
                        }
                    >
                        <Card.Content
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                <Icon source={item.icon || "chart-line"} size={20} />
                                <Text
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
                onPress={() =>
                    router.push("/investment-type/create")
                }
            />
        </SafeAreaView>
    );
}
