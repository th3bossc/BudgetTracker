import { CategoryBudget, Expense, ExpenseCategory, Income, Iou, Investment } from "@/types/schema";
import { DashboardSummary } from "./use-dashboard-data";
import { useEffect, useMemo, useState } from "react";
import { useFinanceConfig } from "./use-finance-config";
import { subscribeToMonthlyBudgets } from "@/services/category-budget-service";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToInvestments } from "@/services/investment-service";
import { subscribeToIncomes } from "@/services/income-service";
import { subscribeToIous } from "@/services/iou-service";

export interface BudgetUsed {
    category: ExpenseCategory;
    amountUsed: number;
    budget: number;
    amountYetToGetBack: number;
}

interface MonthlyBudgetData {
    budgetUsed: BudgetUsed[],
    loading: boolean;
    summary: DashboardSummary;
}

export const useMonthlyBudgetData = (monthKey: string): MonthlyBudgetData => {
    const [computationLoadingStatus, setComputationLoadingStatus] = useState<boolean>(false);

    const [summary, setSummary] = useState<DashboardSummary>({
        income: 0,
        expense: 0,
        investment: 0,
        expenseYetToGetBack: 0,
        netSavings: 0,
        cashflow: 0,
    });


    const {
        loading: financeConfigLoadingStatus,
        categories,
    } = useFinanceConfig();

    const [budgetUsed, setBudgetUsed] = useState<BudgetUsed[]>([]);

    const loading = useMemo(() => computationLoadingStatus || financeConfigLoadingStatus, [computationLoadingStatus, financeConfigLoadingStatus]);

    const [incomes, setIncomes] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [ious, setIous] = useState<Iou[]>([]);
    const [budgets, setBudgets] = useState<CategoryBudget[]>([]);

    useEffect(() => {
        const incomesUnsub = subscribeToIncomes(setIncomes);
        const expensesUnsub = subscribeToExpenses(setExpenses);
        const investmentsUnsub = subscribeToInvestments(setInvestments);
        const iousUnsub = subscribeToIous(setIous);
        const budgetsUnsub = subscribeToMonthlyBudgets(monthKey, setBudgets);

        return () => {
            incomesUnsub();
            expensesUnsub();
            investmentsUnsub();
            iousUnsub();
            budgetsUnsub();
        }
    }, [monthKey]);

    useEffect(() => {
        if (financeConfigLoadingStatus)
            return;

        const fetchData = async () => {
            setComputationLoadingStatus(true);

            try {
                const currentIncome = incomes
                    .filter(i => i.monthKey == monthKey)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentExpense = expenses
                    .filter(i => i.monthKey == monthKey)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentInvestments = investments
                    .filter(i => i.monthKey == monthKey)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentIouOutstanding = ious
                    .filter(i => i.expenseMonthKey == monthKey)
                    .reduce((sum, i) => sum + Math.max(i.amountLeft, 0), 0);

                setSummary({
                    income: currentIncome,
                    expense: Math.max(currentExpense - currentIouOutstanding, 0),
                    investment: currentInvestments,
                    expenseYetToGetBack: currentIouOutstanding,
                    netSavings: currentIncome - currentExpense + currentIouOutstanding,
                    cashflow: currentIncome - currentExpense - currentInvestments + currentIouOutstanding,
                })

                const budgetsMap = budgets.reduce<Record<string, CategoryBudget>>((acc, item) => {
                    acc[item.category.id] = item;
                    return acc;
                }, {});

                const expensesById = expenses.reduce<Record<string, Expense>>((acc, item) => {
                    acc[item.id] = item;
                    return acc;
                }, {});

                const iouOutstandingByCategory = ious.reduce<Record<string, number>>((acc, iou) => {
                    if (iou.expenseMonthKey !== monthKey)
                        return acc;

                    const expense = expensesById[iou.expense.id];
                    if (!expense || expense.monthKey !== monthKey)
                        return acc;

                    const outstanding = Math.max(iou.amountLeft, 0);
                    acc[expense.category.id] = (acc[expense.category.id] ?? 0) + outstanding;
                    return acc;
                }, {});

                const iouInitialByCategory = ious.reduce<Record<string, number>>((acc, iou) => {
                    if (iou.expenseMonthKey !== monthKey)
                        return acc;

                    const expense = expensesById[iou.expense.id];
                    if (!expense || expense.monthKey !== monthKey)
                        return acc;

                    const iouInitialAmount = Math.max(iou.initialAmount, 0);
                    acc[expense.category.id] = (acc[expense.category.id] ?? 0) + iouInitialAmount;
                    return acc;
                }, {});

                const budgetUsedInfo: BudgetUsed[] = categories.map(c => {
                    const totalSpent = expenses
                        .filter(i => i.monthKey == monthKey && i.category.id == c.id)
                        .reduce((sum, i) => sum + i.amount, 0);

                    const amountYetToGetBack = iouOutstandingByCategory[c.id] ?? 0;
                    const totalIouEntitled = iouInitialByCategory[c.id] ?? 0;
                    const amountUsed = Math.max(totalSpent - totalIouEntitled, 0);
                    const budget = budgetsMap[c.id]?.amount ?? 0;
                    return {
                        category: c,
                        amountUsed,
                        budget,
                        amountYetToGetBack,
                    }
                })

                setBudgetUsed(budgetUsedInfo);
            }
            catch (error) {
                console.error('Error fetching monthly data: ', error);
            }
            finally {
                setComputationLoadingStatus(false);
            }
        }

        void fetchData();
    }, [financeConfigLoadingStatus, monthKey, incomes, expenses, investments, ious, budgets]);

    return {
        loading,
        budgetUsed,
        summary,
    }
}
