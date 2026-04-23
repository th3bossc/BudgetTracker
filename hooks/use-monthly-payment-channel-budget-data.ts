import { Expense, Iou, PaymentChannelBudget, PaymentMethod } from "@/types/schema";
import { useEffect, useMemo, useState } from "react";
import { useFinanceConfig } from "./use-finance-config";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToIous } from "@/services/iou-service";
import { subscribeToMonthlyPaymentChannelBudgets } from "@/services/payment-channel-budget-service";
import { getIouOutstandingAmount, getIouRecoveredAmount } from "@/utils/iou";

export interface PaymentChannelBudgetUsed {
    paymentMethod: PaymentMethod;
    amountUsed: number;
    budget: number;
    amountPending: number;
}

interface MonthlyPaymentChannelBudgetData {
    budgetUsed: PaymentChannelBudgetUsed[];
    loading: boolean;
}

export const useMonthlyPaymentChannelBudgetData = (monthKey: string): MonthlyPaymentChannelBudgetData => {
    const [computationLoading, setComputationLoading] = useState<boolean>(false);
    const [budgetUsed, setBudgetUsed] = useState<PaymentChannelBudgetUsed[]>([]);

    const {
        loading: configLoading,
        paymentMethods,
    } = useFinanceConfig();

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [ious, setIous] = useState<Iou[]>([]);
    const [budgets, setBudgets] = useState<PaymentChannelBudget[]>([]);

    const loading = useMemo(() => computationLoading || configLoading, [computationLoading, configLoading]);

    useEffect(() => {
        const expensesUnsub = subscribeToExpenses(setExpenses);
        const iousUnsub = subscribeToIous(setIous);
        const budgetsUnsub = subscribeToMonthlyPaymentChannelBudgets(monthKey, setBudgets);

        return () => {
            expensesUnsub();
            iousUnsub();
            budgetsUnsub();
        };
    }, [monthKey]);

    useEffect(() => {
        if (configLoading)
            return;

        setComputationLoading(true);

        try {
            const getIouMonthKey = (iou: Iou) => iou.createdMonthKey || iou.expenseMonthKey;
            const budgetsByMethod = budgets.reduce<Record<string, number>>((acc, item) => {
                acc[item.paymentMethod.id] = item.amount;
                return acc;
            }, {});

            const expensesById = expenses.reduce<Record<string, Expense>>((acc, item) => {
                acc[item.id] = item;
                return acc;
            }, {});

            const iouRecoveredByMethod = ious.reduce<Record<string, number>>((acc, iou) => {
                if (getIouMonthKey(iou) !== monthKey)
                    return acc;

                const recovered = getIouRecoveredAmount(iou);
                const methodId = iou.paymentMethod.id;
                acc[methodId] = (acc[methodId] ?? 0) + recovered;
                return acc;
            }, {});

            const iouPendingByMethod = ious.reduce<Record<string, number>>((acc, iou) => {
                if (getIouMonthKey(iou) !== monthKey)
                    return acc;

                const expense = expensesById[iou.expense.id];
                if (!expense)
                    return acc;

                const pending = getIouOutstandingAmount(iou);
                const methodId = expense.paymentMethod.id;
                acc[methodId] = (acc[methodId] ?? 0) + pending;
                return acc;
            }, {});

            const computed: PaymentChannelBudgetUsed[] = paymentMethods.map(method => {
                const totalSpent = expenses
                    .filter(item => item.monthKey === monthKey && item.paymentMethod.id === method.id)
                    .reduce((sum, item) => sum + item.amount, 0);

                const recovered = iouRecoveredByMethod[method.id] ?? 0;
                const pending = iouPendingByMethod[method.id] ?? 0;
                const amountUsed = totalSpent - recovered;

                return {
                    paymentMethod: method,
                    amountUsed,
                    budget: budgetsByMethod[method.id] ?? 0,
                    amountPending: pending,
                };
            });

            setBudgetUsed(computed);
        } catch (error) {
            console.error("Error calculating payment channel budgets: ", error);
        } finally {
            setComputationLoading(false);
        }
    }, [configLoading, monthKey, budgets, expenses, ious, paymentMethods]);

    return {
        budgetUsed,
        loading,
    };
};
