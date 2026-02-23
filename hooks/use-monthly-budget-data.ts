import { CategoryBudget, Expense, ExpenseCategory, Income, Investment } from "@/types/schema";
import { DashboardSummary } from "./use-dashboard-data";
import { useEffect, useMemo, useState } from "react";
import { useFinanceConfig } from "./use-finance-config";
import { getBudgetsByMonth } from "@/services/category-budget-service";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToInvestments } from "@/services/investment-service";
import { subscribeToIncomes } from "@/services/income-service";

export interface BudgetUsed {
    category: ExpenseCategory;
    amountUsed: number;
    budget: number;
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
    
        useEffect(() => {
            const incomesUnsub = subscribeToIncomes(setIncomes);
            const expensesUnsub = subscribeToExpenses(setExpenses);
            const investmentsUnsub = subscribeToInvestments(setInvestments);
    
            return () => {
                incomesUnsub();
                expensesUnsub();
                investmentsUnsub();
            }
        }, []);

    useEffect(() => {
        if (financeConfigLoadingStatus)
            return;

        const fetchData = async () => {
            setComputationLoadingStatus(true);

            try {
                const budgets = await getBudgetsByMonth(monthKey);

                const currentIncome = incomes
                    .filter(i => i.monthKey == monthKey)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentExpense = expenses
                    .filter(i => i.monthKey == monthKey)
                    .reduce((sum, i) => sum + i.amount, 0);

                const currentInvestments = investments
                    .filter(i => i.monthKey == monthKey)
                    .reduce((sum, i) => sum + i.amount, 0);

                setSummary({
                    income: currentIncome,
                    expense: currentExpense,
                    investment: currentInvestments,
                    netSavings: currentIncome - currentExpense,
                    cashflow: currentIncome - currentExpense - currentInvestments,
                })

                const budgetsMap = budgets.reduce<Record<string, CategoryBudget>>((acc, item) => {
                    acc[item.category.id] = item;
                    return acc;
                }, {});

                const budgetUsedInfo: BudgetUsed[] = categories.map(c => {
                    const amountUsed = expenses
                        .filter(i => i.monthKey == monthKey && i.category.id == c.id)
                        .reduce((sum, i) => sum + i.amount, 0);
                        
                    const budget = budgetsMap[c.id]?.amount ?? 0;
                    return {
                        category: c,
                        amountUsed,
                        budget,
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
    }, [financeConfigLoadingStatus, monthKey, incomes, expenses, investments]);

    return {
        loading,
        budgetUsed,
        summary,
    }
}