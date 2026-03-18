import type { AccountMonthlyFlow, BankAccountComputed } from "@/hooks/use-bank-accounts-data";
import type { CreditCardComputed } from "@/hooks/use-credit-card-data";
import { formatCurrency } from "@/utils/number";
import { useMemo } from "react";
import { View } from "react-native";
import { Button, Card, Chip, Divider, Text, useTheme } from "react-native-paper";
import SectionHeader from "../dashboard/section-header";
import { router } from "expo-router";

interface Props {
    accounts: BankAccountComputed[];
    creditCards: CreditCardComputed[];
    monthlyFlowByAccountId: Record<string, AccountMonthlyFlow>;
    monthKey: string;
}

export default function AccountsInsightsSection({
    accounts,
    creditCards,
    monthlyFlowByAccountId,
    monthKey,
}: Props) {
    const theme = useTheme();

    const totalLiquidBalance = useMemo(
        () => accounts.reduce((sum, account) => sum + account.currentBalance, 0),
        [accounts]
    );

    const riskAccounts = useMemo(
        () => accounts.filter(account => account.isBelowMinimum),
        [accounts]
    );

    const monthNetFlow = useMemo(
        () => Object.values(monthlyFlowByAccountId).reduce((sum, flow) => sum + flow.netFlow, 0),
        [monthlyFlowByAccountId]
    );

    return (
        <View style={{ gap: 16 }}>
            <SectionHeader title="Cash & Accounts" />

            <Card>
                <Card.Content style={{ gap: 8 }}>
                    <Text variant="titleMedium">Net Cash Position</Text>
                    <Text variant="headlineSmall">{formatCurrency(totalLiquidBalance)}</Text>
                    <Text variant="bodyMedium" style={{ color: monthNetFlow >= 0 ? theme.colors.primary : theme.colors.error }}>
                        {monthKey} Net Flow: {formatCurrency(monthNetFlow)}
                    </Text>
                </Card.Content>
            </Card>

            <Card>
                <Card.Content style={{ gap: 8 }}>
                    <Text variant="titleMedium">Risk Alerts</Text>
                    {riskAccounts.length === 0 ? (
                        <Text variant="bodyMedium">All accounts are above minimum balance.</Text>
                    ) : (
                        <>
                            <Text variant="bodyMedium">
                                {riskAccounts.length} account(s) below minimum balance
                            </Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                                {riskAccounts.slice(0, 3).map((account) => {
                                    const deficit = (account.minimumBalance ?? 0) - account.currentBalance;
                                    return (
                                        <Chip key={account.id} style={{ backgroundColor: theme.colors.errorContainer }}>
                                            {account.name}: {formatCurrency(deficit)}
                                        </Chip>
                                    );
                                })}
                            </View>
                        </>
                    )}
                </Card.Content>
            </Card>

            <Card>
                <Card.Content style={{ gap: 12 }}>
                    <Text variant="titleMedium">Per-Account Snapshot</Text>
                    {accounts.length === 0 ? (
                        <Text variant="bodyMedium">No bank accounts yet.</Text>
                    ) : (
                        accounts.map((account) => (
                            <View key={account.id} style={{ gap: 4 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text variant="bodyLarge">{account.name}</Text>
                                    <Chip
                                        compact
                                        style={{
                                            backgroundColor: account.isBelowMinimum
                                                ? theme.colors.errorContainer
                                                : theme.colors.primaryContainer,
                                        }}
                                    >
                                        {account.isBelowMinimum ? "Below Min" : "Healthy"}
                                    </Chip>
                                </View>
                                <Text variant="bodyMedium">Balance: {formatCurrency(account.currentBalance)}</Text>
                                <Text variant="bodySmall">
                                    Minimum: {account.minimumBalance !== undefined
                                        ? formatCurrency(account.minimumBalance)
                                        : "Not set"}
                                </Text>
                                <Divider style={{ marginTop: 8 }} />
                            </View>
                        ))
                    )}
                </Card.Content>
            </Card>

            <Card>
                <Card.Content style={{ gap: 12 }}>
                    <Text variant="titleMedium">This Month Flow by Account</Text>
                    {accounts.length === 0 ? (
                        <Text variant="bodyMedium">No bank accounts yet.</Text>
                    ) : (
                        accounts.map((account) => {
                            const flow = monthlyFlowByAccountId[account.id] ?? {
                                incomeIn: 0,
                                expenseOut: 0,
                                creditCardPaymentOut: 0,
                                transferIn: 0,
                                transferOut: 0,
                                adjustmentNet: 0,
                                netFlow: 0,
                            };
                            return (
                                <View key={account.id} style={{ gap: 2 }}>
                                    <Text variant="bodyLarge">{account.name}</Text>
                                    <Text variant="bodySmall">Income In: {formatCurrency(flow.incomeIn)}</Text>
                                    <Text variant="bodySmall">Expense Out: {formatCurrency(flow.expenseOut)}</Text>
                                    <Text variant="bodySmall">
                                        Credit Card Payments: {formatCurrency(flow.creditCardPaymentOut)}
                                    </Text>
                                    <Text variant="bodySmall">
                                        Transfers Net: {formatCurrency(flow.transferIn - flow.transferOut)}
                                    </Text>
                                    <Text variant="bodySmall">Adjustments Net: {formatCurrency(flow.adjustmentNet)}</Text>
                                    <Text
                                        variant="bodyMedium"
                                        style={{ color: flow.netFlow >= 0 ? theme.colors.primary : theme.colors.error }}
                                    >
                                        Final Net: {formatCurrency(flow.netFlow)}
                                    </Text>
                                    <Divider style={{ marginTop: 8 }} />
                                </View>
                            );
                        })
                    )}
                </Card.Content>
            </Card>

            <Card>
                <Card.Content style={{ gap: 12 }}>
                    <Text variant="titleMedium">Credit Cards</Text>
                    {creditCards.length === 0 ? (
                        <Text variant="bodyMedium">No credit cards yet.</Text>
                    ) : (
                        creditCards.map((card) => (
                            <View key={card.id} style={{ gap: 4 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text variant="bodyLarge">{card.name}</Text>
                                    <Chip
                                        compact
                                        style={{
                                            backgroundColor: card.isOverLimit
                                                ? theme.colors.errorContainer
                                                : theme.colors.primaryContainer,
                                        }}
                                    >
                                        {card.liabilityBalance < 0
                                            ? "Credit"
                                            : card.isOverLimit
                                                ? "Over Limit"
                                                : "Active"}
                                    </Chip>
                                </View>
                                <Text variant="bodyMedium">
                                    Used: {formatCurrency(card.amountUsed)}
                                    {typeof card.creditLimit === "number"
                                        ? ` / ${formatCurrency(card.creditLimit)}`
                                        : ""}
                                </Text>
                                <Text variant="bodySmall">
                                    This Month Charges: {formatCurrency(card.monthlyCharges)}
                                </Text>
                                <Text variant="bodySmall">
                                    This Month Payments: {formatCurrency(card.monthlyPayments)}
                                </Text>
                                <Text variant="bodySmall">
                                    Available Balance: {formatCurrency(card.availableCredit ?? 0)}
                                </Text>
                                <Text variant="bodySmall">
                                    Liability Balance: {formatCurrency(card.liabilityBalance)}
                                </Text>
                                <Button
                                    compact
                                    style={{ alignSelf: "flex-start", marginTop: 4 }}
                                    onPress={() => router.push({
                                        pathname: "/credit-card-payment/create",
                                        params: { paymentMethodId: card.id },
                                    })}
                                >
                                    Record Payment
                                </Button>
                                <Divider style={{ marginTop: 8 }} />
                            </View>
                        ))
                    )}
                </Card.Content>
            </Card>
        </View>
    );
}
