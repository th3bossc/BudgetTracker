import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions, View } from "react-native";
import { SegmentedButtons, useTheme } from "react-native-paper";

import ExpensesPage from "./expenses";
import IncomesPage from "./incomes";
import InvestmentsPage from "./investments";
import IousPage from "./ious";
import { SafeAreaView } from "react-native-safe-area-context";

type DataSourceTab = "expenses" | "incomes" | "investments" | "ious";

const tabs: { key: DataSourceTab; label: string, icon: string }[] = [
    { key: "expenses", label: "Expenses", icon: "cash-minus" },
    { key: "incomes", label: "Incomes", icon: "cash-plus" },
    { key: "investments", label: "Investments", icon: "chart-line" },
    { key: "ious", label: "IOUs", icon: "cash-refund" },
];

export default function DataSourcesPage() {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const { source } = useLocalSearchParams<{ source?: string }>();
    const listRef = useRef<FlatList<DataSourceTab>>(null);

    const initialTab = useMemo<DataSourceTab>(() => {
        if (source === "expenses" || source === "incomes" || source === "investments" || source === "ious") {
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

        return <View style={{ width, flex: 1 }}><IousPage /></View>;
    }, [width]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <SegmentedButtons
                style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 8 }}
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as DataSourceTab)}
                buttons={tabs.map(tab => ({
                    icon: tab.icon,
                    value: tab.key,
                }))}
            />

            <FlatList
                ref={listRef}
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
