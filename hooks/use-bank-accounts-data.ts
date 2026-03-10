import { useEffect, useMemo, useState } from "react";
import {
    AccountTransfer,
    BankAccount,
    BankAccountBalanceAdjustment,
    Expense,
    Income,
    Iou,
    PaymentMethod,
} from "@/types/schema";
import { subscribeToBankAccounts } from "@/services/bank-account-service";
import { subscribeToIncomes } from "@/services/income-service";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToIous } from "@/services/iou-service";
import { subscribeToAccountTransfers } from "@/services/account-transfer-service";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";
import { subscribeToBankAccountBalanceAdjustments } from "@/services/bank-account-balance-adjustment-service";
import { getIouRecoveredAmount } from "@/utils/iou";

export interface BankAccountComputed extends BankAccount {
    currentBalance: number;
    isBelowMinimum: boolean;
}

export interface AccountMonthlyFlow {
    incomeIn: number;
    expenseOut: number;
    transferIn: number;
    transferOut: number;
    adjustmentNet: number;
    netFlow: number;
}

export const useBankAccountsData = (monthKey?: string) => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [ious, setIous] = useState<Iou[]>([]);
    const [transfers, setTransfers] = useState<AccountTransfer[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [adjustments, setAdjustments] = useState<BankAccountBalanceAdjustment[]>([]);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        const accountsUnsub = subscribeToBankAccounts(setAccounts);
        const incomesUnsub = subscribeToIncomes(setIncomes);
        const expensesUnsub = subscribeToExpenses(setExpenses);
        const iousUnsub = subscribeToIous(setIous);
        const transfersUnsub = subscribeToAccountTransfers(setTransfers);
        const methodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        const adjustmentsUnsub = subscribeToBankAccountBalanceAdjustments(setAdjustments);
        setInitialLoading(false);

        return () => {
            accountsUnsub();
            incomesUnsub();
            expensesUnsub();
            iousUnsub();
            transfersUnsub();
            methodsUnsub();
            adjustmentsUnsub();
        };
    }, []);

    const paymentMethodToAccountIdMap = useMemo(() => {
        return paymentMethods.reduce<Record<string, string>>((acc, method) => {
            const accountId = method.bankAccount?.id;
            if (accountId) {
                acc[method.id] = accountId;
            }

            return acc;
        }, {});
    }, [paymentMethods]);

    const accountsWithBalance = useMemo<BankAccountComputed[]>(() => {
        return accounts
            .map((account) => {
                let currentBalance = account.openingBalance ?? 0;

                incomes.forEach((income) => {
                    if (income.bankAccount?.id === account.id) {
                        currentBalance += income.amount;
                    }
                });

                expenses.forEach((expense) => {
                    const expenseAccountId = paymentMethodToAccountIdMap[expense.paymentMethod.id];
                    if (expenseAccountId === account.id) {
                        currentBalance -= expense.amount;
                    }
                });

                ious.forEach((iou) => {
                    const iouAccountId = paymentMethodToAccountIdMap[iou.paymentMethod.id];
                    if (iouAccountId === account.id) {
                        const recovered = getIouRecoveredAmount(iou);
                        currentBalance += recovered;
                    }
                });

                transfers.forEach((transfer) => {
                    if (transfer.fromBankAccount.id === account.id) {
                        currentBalance -= transfer.amount;
                    }

                    if (transfer.toBankAccount.id === account.id) {
                        currentBalance += transfer.amount;
                    }
                });

                adjustments.forEach((adjustment) => {
                    if (adjustment.bankAccount.id === account.id) {
                        currentBalance += adjustment.amount;
                    }
                });

                return {
                    ...account,
                    currentBalance,
                    isBelowMinimum: typeof account.minimumBalance === "number"
                        ? currentBalance < account.minimumBalance
                        : false,
                };
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [accounts, incomes, expenses, ious, transfers, paymentMethodToAccountIdMap, adjustments]);

    const monthlyFlowByAccountId = useMemo<Record<string, AccountMonthlyFlow>>(() => {
        if (!monthKey) {
            return {};
        }

        const init: Record<string, AccountMonthlyFlow> = {};
        accounts.forEach((account) => {
            init[account.id] = {
                incomeIn: 0,
                expenseOut: 0,
                transferIn: 0,
                transferOut: 0,
                adjustmentNet: 0,
                netFlow: 0,
            };
        });

        incomes.forEach((income) => {
            if (income.monthKey !== monthKey || !income.bankAccount?.id) {
                return;
            }

            const flow = init[income.bankAccount.id];
            if (!flow) {
                return;
            }

            flow.incomeIn += income.amount;
            flow.netFlow += income.amount;
        });

        expenses.forEach((expense) => {
            if (expense.monthKey !== monthKey) {
                return;
            }

            const accountId = paymentMethodToAccountIdMap[expense.paymentMethod.id];
            const flow = accountId ? init[accountId] : undefined;
            if (!flow) {
                return;
            }

            flow.expenseOut += expense.amount;
            flow.netFlow -= expense.amount;
        });

        transfers.forEach((transfer) => {
            if (transfer.monthKey !== monthKey) {
                return;
            }

            const fromFlow = init[transfer.fromBankAccount.id];
            if (fromFlow) {
                fromFlow.transferOut += transfer.amount;
                fromFlow.netFlow -= transfer.amount;
            }

            const toFlow = init[transfer.toBankAccount.id];
            if (toFlow) {
                toFlow.transferIn += transfer.amount;
                toFlow.netFlow += transfer.amount;
            }
        });

        adjustments.forEach((adjustment) => {
            if (adjustment.monthKey !== monthKey) {
                return;
            }

            const flow = init[adjustment.bankAccount.id];
            if (!flow) {
                return;
            }

            flow.adjustmentNet += adjustment.amount;
            flow.netFlow += adjustment.amount;
        });

        return init;
    }, [monthKey, accounts, incomes, expenses, transfers, adjustments, paymentMethodToAccountIdMap]);

    return {
        loading: initialLoading,
        accounts: accountsWithBalance,
        monthlyFlowByAccountId,
    };
};
