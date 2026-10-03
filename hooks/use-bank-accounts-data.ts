import { useEffect, useMemo, useState } from "react";
import {
    AccountTransfer,
    BankAccount,
    BankAccountBalanceAdjustment,
    CreditCardPayment,
    Expense,
    Income,
    Iou,
    Investment,
    PaymentMethod,
} from "@/types/schema";
import { subscribeToBankAccounts } from "@/services/bank-account-service";
import { subscribeToIncomes } from "@/services/income-service";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToInvestments } from "@/services/investment-service";
import { subscribeToIous } from "@/services/iou-service";
import { subscribeToAccountTransfers } from "@/services/account-transfer-service";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";
import { subscribeToBankAccountBalanceAdjustments } from "@/services/bank-account-balance-adjustment-service";
import { subscribeToCreditCardPayments } from "@/services/credit-card-payment-service";
import { getIouRecoveredAmount } from "@/utils/iou";

export interface BankAccountComputed extends BankAccount {
    currentBalance: number;
    isBelowMinimum: boolean;
}

export interface AccountMonthlyFlow {
    incomeIn: number;
    expenseOut: number;
    investmentOut: number;
    creditCardPaymentOut: number;
    transferIn: number;
    transferOut: number;
    adjustmentNet: number;
    netFlow: number;
}

export const useBankAccountsData = (monthKey?: string) => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [ious, setIous] = useState<Iou[]>([]);
    const [transfers, setTransfers] = useState<AccountTransfer[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [creditCardPayments, setCreditCardPayments] = useState<CreditCardPayment[]>([]);
    const [adjustments, setAdjustments] = useState<BankAccountBalanceAdjustment[]>([]);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        const accountsUnsub = subscribeToBankAccounts(setAccounts);
        const incomesUnsub = subscribeToIncomes(setIncomes);
        const expensesUnsub = subscribeToExpenses(setExpenses);
        const investmentsUnsub = subscribeToInvestments(setInvestments);
        const iousUnsub = subscribeToIous(setIous);
        const transfersUnsub = subscribeToAccountTransfers(setTransfers);
        const methodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        const creditCardPaymentsUnsub = subscribeToCreditCardPayments(setCreditCardPayments);
        const adjustmentsUnsub = subscribeToBankAccountBalanceAdjustments(setAdjustments);
        setInitialLoading(false);

        return () => {
            accountsUnsub();
            incomesUnsub();
            expensesUnsub();
            investmentsUnsub();
            iousUnsub();
            transfersUnsub();
            methodsUnsub();
            creditCardPaymentsUnsub();
            adjustmentsUnsub();
        };
    }, []);

    const paymentMethodMap = useMemo(() => {
        return paymentMethods.reduce<Record<string, PaymentMethod>>((acc, method) => {
            acc[method.id] = method;
            return acc;
        }, {});
    }, [paymentMethods]);

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
                    const method = paymentMethodMap[expense.paymentMethod.id];
                    if (expenseAccountId === account.id && !method?.isCreditCard) {
                        currentBalance -= expense.amount;
                    }
                });

                investments.forEach((investment) => {
                    const paymentMethodId = investment.paymentMethod?.id;
                    if (!paymentMethodId) {
                        return;
                    }

                    const investmentAccountId = paymentMethodToAccountIdMap[paymentMethodId];
                    const method = paymentMethodMap[paymentMethodId];
                    if (investmentAccountId === account.id && !method?.isCreditCard) {
                        currentBalance -= investment.amount;
                    }
                });

                ious.forEach((iou) => {
                    const iouAccountId = paymentMethodToAccountIdMap[iou.paymentMethod.id];
                    const method = paymentMethodMap[iou.paymentMethod.id];
                    if (iouAccountId === account.id && !method?.isCreditCard) {
                        const recovered = getIouRecoveredAmount(iou);
                        currentBalance += recovered;
                    }
                });

                creditCardPayments.forEach((payment) => {
                    if (payment.bankAccount.id === account.id) {
                        currentBalance -= payment.amount;
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
    }, [
        accounts,
        adjustments,
        creditCardPayments,
        expenses,
        incomes,
        investments,
        ious,
        paymentMethodMap,
        paymentMethodToAccountIdMap,
        transfers,
    ]);

    const monthlyFlowByAccountId = useMemo<Record<string, AccountMonthlyFlow>>(() => {
        if (!monthKey) {
            return {};
        }

        const init: Record<string, AccountMonthlyFlow> = {};
        accounts.forEach((account) => {
            init[account.id] = {
                incomeIn: 0,
                expenseOut: 0,
                investmentOut: 0,
                creditCardPaymentOut: 0,
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
            const method = paymentMethodMap[expense.paymentMethod.id];
            const flow = accountId ? init[accountId] : undefined;
            if (!flow || method?.isCreditCard) {
                return;
            }

            flow.expenseOut += expense.amount;
            flow.netFlow -= expense.amount;
        });

        investments.forEach((investment) => {
            if (investment.monthKey !== monthKey) {
                return;
            }

            const paymentMethodId = investment.paymentMethod?.id;
            if (!paymentMethodId) {
                return;
            }

            const accountId = paymentMethodToAccountIdMap[paymentMethodId];
            const method = paymentMethodMap[paymentMethodId];
            const flow = accountId ? init[accountId] : undefined;
            if (!flow || method?.isCreditCard) {
                return;
            }

            flow.investmentOut += investment.amount;
            flow.netFlow -= investment.amount;
        });

        creditCardPayments.forEach((payment) => {
            if (payment.monthKey !== monthKey) {
                return;
            }

            const flow = init[payment.bankAccount.id];
            if (!flow) {
                return;
            }

            flow.creditCardPaymentOut += payment.amount;
            flow.netFlow -= payment.amount;
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
    }, [
        monthKey,
        accounts,
        adjustments,
        creditCardPayments,
        expenses,
        incomes,
        investments,
        paymentMethodMap,
        paymentMethodToAccountIdMap,
        transfers,
    ]);

    const visibleAccounts = useMemo(() => {
        if (!monthKey) {
            return accountsWithBalance.filter(account => !account.isArchived);
        }

        const referencedAccountIds = new Set<string>();
        incomes
            .filter(income => income.monthKey === monthKey && income.bankAccount?.id)
            .forEach(income => referencedAccountIds.add(income.bankAccount!.id));
        creditCardPayments
            .filter(payment => payment.monthKey === monthKey)
            .forEach(payment => referencedAccountIds.add(payment.bankAccount.id));
        transfers
            .filter(transfer => transfer.monthKey === monthKey)
            .forEach(transfer => {
                referencedAccountIds.add(transfer.fromBankAccount.id);
                referencedAccountIds.add(transfer.toBankAccount.id);
            });
        adjustments
            .filter(adjustment => adjustment.monthKey === monthKey)
            .forEach(adjustment => referencedAccountIds.add(adjustment.bankAccount.id));
        expenses
            .filter(expense => expense.monthKey === monthKey)
            .forEach(expense => {
                const accountId = paymentMethodToAccountIdMap[expense.paymentMethod.id];
                if (accountId) referencedAccountIds.add(accountId);
            });
        investments
            .filter(investment => investment.monthKey === monthKey && investment.paymentMethod?.id)
            .forEach(investment => {
                const accountId = paymentMethodToAccountIdMap[investment.paymentMethod!.id];
                if (accountId) referencedAccountIds.add(accountId);
            });
        ious.forEach(iou => {
            const iouMonthKey = iou.createdMonthKey || iou.expenseMonthKey;
            if (iouMonthKey !== monthKey) return;

            const accountId = paymentMethodToAccountIdMap[iou.paymentMethod.id];
            if (accountId) referencedAccountIds.add(accountId);
        });

        return accountsWithBalance.filter(account => !account.isArchived || referencedAccountIds.has(account.id));
    }, [
        accountsWithBalance,
        adjustments,
        creditCardPayments,
        expenses,
        incomes,
        investments,
        ious,
        monthKey,
        paymentMethodToAccountIdMap,
        transfers,
    ]);

    return {
        loading: initialLoading,
        accounts: visibleAccounts,
        archivedAccounts: accountsWithBalance.filter(account => account.isArchived),
        monthlyFlowByAccountId,
    };
};
