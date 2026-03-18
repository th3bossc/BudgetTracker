import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import MonthlySummaryCard from "@/components/dashboard/monthly-summary-card";
import CategoryBudgetSection from "@/components/finances/category-budget-section";
import CategoryPieChart from "@/components/finances/category-pie-chart";
import AccountsInsightsSection from "@/components/finances/accounts-insights-section";
import PaymentChannelBudgetSection from "@/components/finances/payment-channel-budget-section";
import PaymentChannelPieChart from "@/components/finances/payment-channel-pie-chart";
import { useBankAccountsData } from "@/hooks/use-bank-accounts-data";
import { useCreditCardData } from "@/hooks/use-credit-card-data";
import { useMonthlyBudgetData } from "@/hooks/use-monthly-budget-data";
import { useMonthlyPaymentChannelBudgetData } from "@/hooks/use-monthly-payment-channel-budget-data";
import { getMonthKey } from "@/utils/date";
import { generateMonthOptions } from "@/utils/month-utils";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Divider, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

type FinancesView = "overview" | "accounts" | "budgets";

export default function FinancesPage() {
    const theme = useTheme();
    const [monthKey, setMonthKey] = useState<string>(getMonthKey(new Date()));
    const [activeView, setActiveView] = useState<FinancesView>("overview");
    const { loading, budgetUsed, summary } = useMonthlyBudgetData(monthKey);
    const {
        loading: paymentChannelLoading,
        budgetUsed: paymentChannelBudgetUsed,
    } = useMonthlyPaymentChannelBudgetData(monthKey);
    const {
        loading: bankAccountsLoading,
        accounts,
        monthlyFlowByAccountId,
    } = useBankAccountsData(monthKey);
    const {
        loading: creditCardsLoading,
        creditCards,
    } = useCreditCardData(monthKey);

    const monthOptions = useMemo(() => generateMonthOptions(24), []);

    const onSelectMonth = useCallback((val?: string) => {
        if (!val)
            return;

        setMonthKey(val);
    }, []);

    if (loading || paymentChannelLoading || bankAccountsLoading || creditCardsLoading) {
        return <Loading />
    }

    return (
        <SafeAreaView style={{
            padding: 16,
            backgroundColor: theme.colors.background,
            flexGrow: 1,
        }}>
            <ScrollView style={{ flex: 1 }}>
                <Header
                    title="Finances"
                />

                <Dropdown
                    label="Month"
                    mode="outlined"
                    value={monthKey}
                    options={monthOptions}
                    onSelect={onSelectMonth}
                />

                <Divider style={{ marginVertical: 16 }} />

                <SegmentedButtons
                    value={activeView}
                    onValueChange={(val) => setActiveView(val as FinancesView)}
                    buttons={[
                        {
                            value: "overview",
                            icon: "view-dashboard-outline",
                            label: "Overview",
                        },
                        {
                            value: "budgets",
                            icon: "chart-donut",
                            label: "Budgets",
                        },
                        {
                            value: "accounts",
                            icon: "bank-outline",
                            label: "Accounts",
                        },
                    ]}
                />

                <Divider style={{ marginVertical: 16 }} />

                {activeView === "overview" ? (
                    <View style={{ gap: 20 }}>
                        <MonthlySummaryCard
                            summary={summary}
                        />

                        <CategoryPieChart budgetUsed={budgetUsed} />

                        <Divider />

                        <PaymentChannelPieChart budgetUsed={paymentChannelBudgetUsed} />
                    </View>
                ) : activeView === "accounts" ? (
                    <AccountsInsightsSection
                        accounts={accounts}
                        creditCards={creditCards}
                        monthKey={monthKey}
                        monthlyFlowByAccountId={monthlyFlowByAccountId}
                    />
                ) : (
                    <View style={{ gap: 20 }}>
                        <View style={{ gap: 10 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text variant="titleMedium">Category Budgets</Text>
                                <Button compact onPress={() => router.push(`/budget/${monthKey}` as any)}>
                                    Edit
                                </Button>
                            </View>
                            <CategoryBudgetSection budgetUsed={budgetUsed} />
                            <CategoryPieChart budgetUsed={budgetUsed} />
                        </View>

                        <Divider />

                        <View style={{ gap: 10 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text variant="titleMedium">Payment Channels</Text>
                                <Button compact onPress={() => router.push(`/payment-channel-budget/${monthKey}` as any)}>
                                    Edit
                                </Button>
                            </View>
                            <PaymentChannelBudgetSection budgetUsed={paymentChannelBudgetUsed} />
                            <PaymentChannelPieChart budgetUsed={paymentChannelBudgetUsed} />
                        </View>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    )
}
