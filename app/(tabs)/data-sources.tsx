import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

import ExpensesPage from "./expenses";
import IncomesPage from "./incomes";
import InvestmentsPage from "./investments";
import IousPage from "./ious";
import TransfersPage from "./transfers";
import BankAccountsPage from "./bank-accounts";
import CreditCardPaymentsPage from "./credit-card-payments";
import { SafeAreaView } from "react-native-safe-area-context";

type DataSourceTab = "expenses" | "incomes" | "investments" | "ious" | "transfers" | "accounts" | "credit-card-payments";

const tabs: { key: DataSourceTab; label: string, icon: string }[] = [
    { key: "expenses", label: "Expenses", icon: "cash-minus" },
    { key: "incomes", label: "Incomes", icon: "cash-plus" },
    { key: "investments", label: "Investments", icon: "chart-line" },
    { key: "ious", label: "IOUs", icon: "cash-refund" },
    { key: "accounts", label: "Accounts", icon: "bank-outline" },
    { key: "transfers", label: "Transfers", icon: "bank-transfer" },
    { key: "credit-card-payments", label: "CC Payments", icon: "credit-card-check-outline" },
];

export default function DataSourcesPage() {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const { source } = useLocalSearchParams<{ source?: string }>();
    const listRef = useRef<FlatList<DataSourceTab>>(null);
    const tabsScrollRef = useRef<ScrollView>(null);
    const chipLayoutRef = useRef<Record<DataSourceTab, { x: number; width: number }>>({
        expenses: { x: 0, width: 0 },
        incomes: { x: 0, width: 0 },
        investments: { x: 0, width: 0 },
        ious: { x: 0, width: 0 },
        transfers: { x: 0, width: 0 },
        accounts: { x: 0, width: 0 },
        "credit-card-payments": { x: 0, width: 0 },
    });

    const initialTab = useMemo<DataSourceTab>(() => {
        if (
            source === "expenses"
            || source === "incomes"
            || source === "investments"
            || source === "ious"
            || source === "accounts"
            || source === "transfers"
            || source === "credit-card-payments"
        ) {
            return source;
        }

        return "expenses";
    }, [source]);

    const [activeTab, setActiveTab] = useState<DataSourceTab>(initialTab);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        const idx = tabs.findIndex(tab => tab.key === activeTab);
        if (idx < 0) {
            return;
        }

        listRef.current?.scrollToOffset({
            offset: idx * width,
            animated: true,
        });
    }, [activeTab, width]);

    useEffect(() => {
        const chipLayout = chipLayoutRef.current[activeTab];
        if (!chipLayout || chipLayout.width === 0) {
            return;
        }

        const horizontalPadding = 16;
        const targetX = Math.max(
            chipLayout.x - (width / 2) + (chipLayout.width / 2) - horizontalPadding,
            0
        );

        tabsScrollRef.current?.scrollTo({
            x: targetX,
            y: 0,
            animated: true,
        });
    }, [activeTab, width]);

    const handleMomentumEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const nextIndex = Math.round(offsetX / width);
        const nextTab = tabs[nextIndex]?.key;

        if (nextTab) {
            setActiveTab(nextTab);
        }
    }, [width]);

    const renderPage = useCallback(({ item }: { item: DataSourceTab }) => {
        if (item === "expenses") {
            return <View style={{ width, flex: 1 }}><ExpensesPage /></View>;
        }

        if (item === "incomes") {
            return <View style={{ width, flex: 1 }}><IncomesPage /></View>;
        }

        if (item === "investments") {
            return <View style={{ width, flex: 1 }}><InvestmentsPage /></View>;
        }
        
        if (item === "accounts") {
            return <View style={{ width, flex: 1 }}><BankAccountsPage /></View>;
        }

        if (item === "transfers") {
            return <View style={{ width, flex: 1 }}><TransfersPage /></View>;
        }

        if (item === "credit-card-payments") {
            return <View style={{ width, flex: 1 }}><CreditCardPaymentsPage /></View>;
        }

        return <View style={{ width, flex: 1 }}><IousPage /></View>;
    }, [width]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
                <ScrollView
                    ref={tabsScrollRef}
                    horizontal
                    style={{ flexGrow: 0 }}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                    {tabs.map(tab => (
                        <Pressable
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            onLayout={(event) => {
                                chipLayoutRef.current[tab.key] = {
                                    x: event.nativeEvent.layout.x,
                                    width: event.nativeEvent.layout.width,
                                };
                            }}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                minWidth: 118,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: activeTab === tab.key
                                    ? theme.colors.primary
                                    : theme.colors.outlineVariant,
                                backgroundColor: activeTab === tab.key
                                    ? theme.colors.primaryContainer
                                    : theme.colors.surface,
                            }}
                        >
                            <Icon
                                source={tab.icon}
                                size={18}
                                color={activeTab === tab.key
                                    ? theme.colors.onPrimaryContainer
                                    : theme.colors.onSurfaceVariant}
                            />
                            <Text
                                variant="labelLarge"
                                style={{
                                    color: activeTab === tab.key
                                        ? theme.colors.onPrimaryContainer
                                        : theme.colors.onSurfaceVariant,
                                }}
                            >
                                {tab.label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                ref={listRef}
                style={{ flex: 1 }}
                data={tabs.map(tab => tab.key)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={renderPage}
                onMomentumScrollEnd={handleMomentumEnd}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
            />
        </SafeAreaView>
    );
}
