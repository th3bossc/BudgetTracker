import Header from "@/components/common/header";
import Loading from "@/components/common/loading";
import MonthlySummaryCard from "@/components/dashboard/monthly-summary-card";
import CategoryBudgetSection from "@/components/finances/category-budget-section";
import CategoryPieChart from "@/components/finances/category-pie-chart";
import AccountsInsightsSection from "@/components/finances/accounts-insights-section";
import PaymentChannelBudgetSection from "@/components/finances/payment-channel-budget-section";
import PaymentChannelPieChart from "@/components/finances/payment-channel-pie-chart";
import { useBankAccountsData } from "@/hooks/use-bank-accounts-data";
import { useMonthlyBudgetData } from "@/hooks/use-monthly-budget-data";
import { useMonthlyPaymentChannelBudgetData } from "@/hooks/use-monthly-payment-channel-budget-data";
import { getMonthKey } from "@/utils/date";
import { generateMonthOptions } from "@/utils/month-utils";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { Divider, FAB, SegmentedButtons, useTheme } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

type FinancesView = "budgets" | "accounts";
type BudgetTab = "category" | "payment-channel";

export default function FinancesPage() {
    const theme = useTheme();
    const [monthKey, setMonthKey] = useState<string>(getMonthKey(new Date()));
    const [activeView, setActiveView] = useState<FinancesView>("budgets");
    const [activeTab, setActiveTab] = useState<BudgetTab>("category");
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

    const monthOptions = useMemo(() => generateMonthOptions(24), []);

    const onSelectMonth = useCallback((val?: string) => {
        if (!val)
            return;

        setMonthKey(val);
    }, []);

    if (loading || paymentChannelLoading || bankAccountsLoading) {
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

                <MonthlySummaryCard
                    summary={summary}
                />

                <Divider style={{ marginVertical: 16 }} />

                <SegmentedButtons
                    value={activeView}
                    onValueChange={(val) => setActiveView(val as FinancesView)}
                    buttons={[
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

                {activeView === "accounts" ? (
                    <AccountsInsightsSection
                        accounts={accounts}
                        monthKey={monthKey}
                        monthlyFlowByAccountId={monthlyFlowByAccountId}
                    />
                ) : (
                    <>
                        <SegmentedButtons
                            value={activeTab}
                            onValueChange={(val) => setActiveTab(val as BudgetTab)}
                            buttons={[
                                {
                                    value: "category",
                                    icon: "shape",
                                    label: "Category",
                                },
                                {
                                    value: "payment-channel",
                                    icon: "credit-card-outline",
                                    label: "Payment Channel",
                                },
                            ]}
                        />

                        <Divider style={{ marginVertical: 16 }} />

                        {activeTab === "category"
                            ? <>
                                <CategoryBudgetSection budgetUsed={budgetUsed} />
                                <Divider />
                                <CategoryPieChart budgetUsed={budgetUsed} />
                            </>
                            : <>
                                <PaymentChannelBudgetSection budgetUsed={paymentChannelBudgetUsed} />
                                <Divider />
                                <PaymentChannelPieChart budgetUsed={paymentChannelBudgetUsed} />
                            </>
                        }
                    </>
                )}

            </ScrollView>

            {activeView === "budgets" && (
                <FAB
                    icon="pencil"
                    style={{
                        position: "absolute",
                        right: 16,
                        bottom: 16,
                    }}
                    onPress={() => router.push(
                        activeTab === "category"
                            ? `/budget/${monthKey}` as any
                            : `/payment-channel-budget/${monthKey}` as any
                    )}
                />
            )}
        </SafeAreaView>
    )
}
