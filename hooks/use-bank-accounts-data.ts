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

export interface BankAccountComputed extends BankAccount {
    currentBalance: number;
    isBelowMinimum: boolean;
}

export const useBankAccountsData = () => {
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
                        const recovered = Math.max(iou.initialAmount - iou.amountLeft, 0);
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

    return {
        loading: initialLoading,
        accounts: accountsWithBalance,
    };
};
