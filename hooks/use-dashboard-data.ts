import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToIncomes } from "@/services/income-service";
import { subscribeToInvestments } from "@/services/investment-service";
import type { MonthlyAggregate } from "@/types/common";
import { Expense, Income, Investment } from "@/types/schema";
import { getMonthKey } from "@/utils/date";
import { groupByMonth } from "@/utils/group-by-month";
import { useEffect, useState } from "react";

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
    });

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
        const fetchData = async () => {
            try {
                setComputationLoadingStatus(true);

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

                setMonthlyData({
                    incomes: incomeAgg,
                    expenses: expenseAgg,
                    investments: investmentAgg,
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
    }, [incomes, expenses, investments]);

    return {
        loading: computationLoadingStatus,
        summary,
        monthlyData,
    }
}