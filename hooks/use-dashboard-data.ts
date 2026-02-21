import { getExpenses } from "@/services/expense-service";
import { getIncomes } from "@/services/income-service";
import { getInvestments } from "@/services/investment-service";
import type { MonthlyAggregate } from "@/types/common";
import { ExpenseCategory } from "@/types/schema";
import { getMonthKey } from "@/utils/date";
import { groupByMonth } from "@/utils/group-by-month";
import { useEffect, useMemo, useState } from "react";
import { useFinanceConfig } from "./use-finance-config";
import { createLookupMap } from "@/utils/create-lookup-map";

export interface DashboardSummary {
    income: number;
    expense: number;
    investment: number;
    netSavings: number;
    cashflow: number;
}

export interface DashboardMonthlyData {
    incomes: MonthlyAggregate[],
    expenses: MonthlyAggregate[],
    investments: MonthlyAggregate[],
    budgetUsed: BudgetUsed[],
}

export interface BudgetUsed {
    category: ExpenseCategory;
    amountUsed: number;
    budget: number;
}

export type DashboardData = {
    loading: boolean;
    summary: DashboardSummary;
    monthlyData: DashboardMonthlyData;
}

export const useDashboardData = (): DashboardData => {
    const [computationLoadingStatus, setComputationLoadingStatus] = useState<boolean>(true);

    const [summary, setSummary] = useState<DashboardSummary>({
        income: 0,
        expense: 0,
        investment: 0,
        netSavings: 0,
        cashflow: 0,
    });

    const [monthlyData, setMonthlyData] = useState<DashboardMonthlyData>({
        incomes: [],
        expenses: [],
        investments: [],
        budgetUsed: [],
    });

    const {
        loading: financeConfigLoadingStatus,
        categories,
        investmentTypes,
        incomeSources,
        categoryBudgets,
    } = useFinanceConfig();

    const lookupMaps = useMemo(() => ({
        categories: createLookupMap(categories),
        investmentTypes: createLookupMap(investmentTypes),
        incomeSources: createLookupMap(incomeSources),
        categoryBudgets: createLookupMap(categoryBudgets),
    }), [
        categories,
        investmentTypes,
        incomeSources,
        categoryBudgets,
    ]);

    const loading = useMemo(() => computationLoadingStatus || financeConfigLoadingStatus, [computationLoadingStatus, financeConfigLoadingStatus]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setComputationLoadingStatus(true);

                const [incomes, expenses, investments] = await Promise.all([
                    getIncomes(),
                    getExpenses(),
                    getInvestments(),
                ]);

                const currentMonth = getMonthKey(new Date());

                const currentIncome = incomes
                    .filter(i => i.monthKey == currentMonth)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentExpense = expenses
                    .filter(i => i.monthKey == currentMonth)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentInvestments = investments
                    .filter(i => i.monthKey == currentMonth)
                    .reduce((sum, i) => sum + i.amount, 0);


                setSummary({
                    income: currentIncome,
                    expense: currentExpense,
                    investment: currentInvestments,
                    netSavings: currentIncome - currentExpense,
                    cashflow: currentIncome - currentExpense - currentInvestments
                })

                const incomeAgg = groupByMonth(incomes).slice(0, 3);
                const expenseAgg = groupByMonth(expenses).slice(0, 3);
                const investmentAgg = groupByMonth(investments).slice(0, 3);

                const budgetUsedInfo: BudgetUsed[] = categoryBudgets.map(categoryBudget => {
                    const amountUsed = expenses
                        .filter(i => i.monthKey == currentMonth && i.category.id == categoryBudget.category.id)
                        .reduce((sum, i) => sum + i.amount, 0);
                    const category = lookupMaps.categories[categoryBudget.category.id] ?? 'Unknown'
                    const budget = categoryBudget.amount ?? 0;
                    return {
                        category,
                        amountUsed,
                        budget,
                    }
                })

                setMonthlyData({
                    incomes: incomeAgg,
                    expenses: expenseAgg,
                    investments: investmentAgg,
                    budgetUsed: budgetUsedInfo,
                });
            }
            catch (error) {
                console.error('Dashboard fetch error: ', error);
            }
            finally {
                setComputationLoadingStatus(false);
            }
        }

        void fetchData();
    }, []);

    return {
        loading,
        summary,
        monthlyData,
    }
}