import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToIncomes } from "@/services/income-service";
import { subscribeToIous } from "@/services/iou-service";
import { subscribeToInvestments } from "@/services/investment-service";
import type { MonthlyAggregate } from "@/types/common";
import { Expense, Income, Iou, Investment } from "@/types/schema";
import { getMonthKey } from "@/utils/date";
import { groupByMonth } from "@/utils/group-by-month";
import { getIouOutstandingAmount, getIouRecoveredAmount } from "@/utils/iou";
import { useEffect, useState } from "react";

export interface DashboardSummary {
    income: number;
    expense: number;
    investment: number;
    expenseYetToGetBack: number;
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
        expenseYetToGetBack: 0,
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
    const [ious, setIous] = useState<Iou[]>([]);

    useEffect(() => {
        const incomesUnsub = subscribeToIncomes(setIncomes);
        const expensesUnsub = subscribeToExpenses(setExpenses);
        const investmentsUnsub = subscribeToInvestments(setInvestments);
        const iousUnsub = subscribeToIous(setIous);

        return () => {
            incomesUnsub();
            expensesUnsub();
            investmentsUnsub();
            iousUnsub();
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

                const currentIouRecovered = ious
                    .filter(i => i.expenseMonthKey == currentMonth)
                    .reduce((sum, i) => sum + getIouRecoveredAmount(i), 0);

                const currentIouOutstanding = ious
                    .filter(i => i.expenseMonthKey == currentMonth)
                    .reduce((sum, i) => sum + getIouOutstandingAmount(i), 0);

                setSummary({
                    income: currentIncome,
                    expense: Math.max(currentExpense - currentIouRecovered, 0),
                    investment: currentInvestments,
                    expenseYetToGetBack: currentIouOutstanding,
                    netSavings: currentIncome - currentExpense + currentIouRecovered,
                    cashflow: currentIncome - currentExpense - currentInvestments + currentIouRecovered
                })

                const incomeAgg = groupByMonth(incomes).slice(0, 3);
                const expenseAgg = groupByMonth(expenses).slice(0, 3);
                const investmentAgg = groupByMonth(investments).slice(0, 3);
                const iouAgg = groupByMonth(
                    ious.map(iou => ({
                        monthKey: iou.expenseMonthKey,
                        amount: getIouRecoveredAmount(iou),
                    }))
                ).slice(0, 3);

                const iouMonthKeyMap = new Map<string, number>();
                iouAgg.forEach(item => iouMonthKeyMap.set(item.month, item.total));

                const expenseWithRecoveredAgg = expenseAgg.map(({ month, total }) => ({
                    month: month,
                    total: Math.max(total - (iouMonthKeyMap.get(month) ?? 0), 0),
                    auxiliaryTotal: ious
                        .filter(iou => iou.expenseMonthKey === month)
                        .reduce((sum, iou) => sum + getIouOutstandingAmount(iou), 0),
                }));

                setMonthlyData({
                    incomes: incomeAgg,
                    expenses: expenseWithRecoveredAgg,
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
    }, [incomes, expenses, investments, ious]);

    return {
        loading: computationLoadingStatus,
        summary,
        monthlyData,
    }
}
