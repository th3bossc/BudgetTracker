import { CategoryBudget, Expense, ExpenseCategory, Income, Iou, Investment } from "@/types/schema";
import { DashboardSummary } from "./use-dashboard-data";
import { useEffect, useMemo, useState } from "react";
import { useFinanceConfig } from "./use-finance-config";
import { subscribeToMonthlyBudgets } from "@/services/category-budget-service";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToInvestments } from "@/services/investment-service";
import { subscribeToIncomes } from "@/services/income-service";
import { subscribeToIous } from "@/services/iou-service";
import { getIouOutstandingAmount, getIouRecoveredAmount } from "@/utils/iou";

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
                const getIouMonthKey = (iou: Iou) => iou.createdMonthKey || iou.expenseMonthKey;
                const normalizeCategoryName = (name?: string) => name?.trim().toLowerCase() ?? "";

                const categoryNameCount = categories.reduce<Record<string, number>>((acc, category) => {
                    const normalizedName = normalizeCategoryName(category.name);
                    if (!normalizedName)
                        return acc;

                    acc[normalizedName] = (acc[normalizedName] ?? 0) + 1;
                    return acc;
                }, {});

                const categoryIds = new Set(categories.map(category => category.id));
                const categoryByNormalizedName = categories.reduce<Record<string, ExpenseCategory>>((acc, category) => {
                    const normalizedName = normalizeCategoryName(category.name);
                    if (!normalizedName || categoryNameCount[normalizedName] !== 1)
                        return acc;

                    acc[normalizedName] = category;
                    return acc;
                }, {});

                const resolveCategoryId = (categoryRef?: { id: string, name?: string }) => {
                    if (!categoryRef)
                        return null;

                    if (categoryIds.has(categoryRef.id))
                        return categoryRef.id;

                    const normalizedName = normalizeCategoryName(categoryRef.name);
                    if (!normalizedName)
                        return null;

                    return categoryByNormalizedName[normalizedName]?.id ?? null;
                };

                const currentIncome = incomes
                    .filter(i => i.monthKey == monthKey)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentExpense = expenses
                    .filter(i => i.monthKey == monthKey)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentInvestments = investments
                    .filter(i => i.monthKey == monthKey)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentIouRecovered = ious
                    .filter(i => getIouMonthKey(i) == monthKey)
                    .reduce((sum, i) => sum + getIouRecoveredAmount(i), 0);

                const currentIouOutstanding = ious
                    .filter(i => getIouMonthKey(i) == monthKey)
                    .reduce((sum, i) => sum + getIouOutstandingAmount(i), 0);

                setSummary({
                    income: currentIncome,
                    expense: Math.max(currentExpense - currentIouRecovered, 0),
                    investment: currentInvestments,
                    expenseYetToGetBack: currentIouOutstanding,
                    netSavings: currentIncome - currentExpense + currentIouRecovered,
                    cashflow: currentIncome - currentExpense - currentInvestments + currentIouRecovered,
                })

                const budgetsMap = budgets.reduce<Record<string, CategoryBudget>>((acc, item) => {
                    const resolvedCategoryId = resolveCategoryId(item.category);
                    if (!resolvedCategoryId)
                        return acc;

                    acc[resolvedCategoryId] = item;
                    return acc;
                }, {});

                const expensesById = expenses.reduce<Record<string, Expense>>((acc, item) => {
                    acc[item.id] = item;
                    return acc;
                }, {});

                const iouOutstandingByCategory = ious.reduce<Record<string, number>>((acc, iou) => {
                    if (getIouMonthKey(iou) !== monthKey)
                        return acc;

                    const expense = expensesById[iou.expense.id];
                    if (!expense)
                        return acc;

                    const resolvedCategoryId = resolveCategoryId(expense.category);
                    if (!resolvedCategoryId)
                        return acc;

                    const outstanding = getIouOutstandingAmount(iou);
                    acc[resolvedCategoryId] = (acc[resolvedCategoryId] ?? 0) + outstanding;
                    return acc;
                }, {});

                const iouRecoveredByCategory = ious.reduce<Record<string, number>>((acc, iou) => {
                    if (getIouMonthKey(iou) !== monthKey)
                        return acc;

                    const expense = expensesById[iou.expense.id];
                    if (!expense)
                        return acc;

                    const resolvedCategoryId = resolveCategoryId(expense.category);
                    if (!resolvedCategoryId)
                        return acc;

                    const recovered = getIouRecoveredAmount(iou);
                    acc[resolvedCategoryId] = (acc[resolvedCategoryId] ?? 0) + recovered;
                    return acc;
                }, {});

                const budgetUsedInfo: BudgetUsed[] = categories.map(c => {
                    const totalSpent = expenses
                        .filter(i => i.monthKey == monthKey && resolveCategoryId(i.category) == c.id)
                        .reduce((sum, i) => sum + i.amount, 0);

                    const amountYetToGetBack = iouOutstandingByCategory[c.id] ?? 0;
                    const totalRecovered = iouRecoveredByCategory[c.id] ?? 0;
                    const amountUsed = totalSpent - totalRecovered;
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
    }, [financeConfigLoadingStatus, monthKey, incomes, expenses, investments, ious, budgets, categories]);

    return {
        loading,
        budgetUsed,
        summary,
    }
}
