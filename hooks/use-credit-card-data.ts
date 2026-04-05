import { useEffect, useMemo, useState } from "react";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToInvestments } from "@/services/investment-service";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";
import { subscribeToCreditCardPayments } from "@/services/credit-card-payment-service";
import { subscribeToIous } from "@/services/iou-service";
import { CreditCardPayment, Expense, Iou, Investment, PaymentMethod } from "@/types/schema";
import { getIouRecoveredAmount } from "@/utils/iou";

export interface CreditCardComputed extends PaymentMethod {
    amountUsed: number;
    liabilityBalance: number;
    availableCredit: number | null;
    isOverLimit: boolean;
    monthlyCharges: number;
    monthlyPayments: number;
    monthlyNetChange: number;
}

export const useCreditCardData = (monthKey?: string) => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [payments, setPayments] = useState<CreditCardPayment[]>([]);
    const [ious, setIous] = useState<Iou[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const methodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        const expensesUnsub = subscribeToExpenses(setExpenses);
        const investmentsUnsub = subscribeToInvestments(setInvestments);
        const paymentsUnsub = subscribeToCreditCardPayments(setPayments);
        const iousUnsub = subscribeToIous(setIous);
        setLoading(false);

        return () => {
            methodsUnsub();
            expensesUnsub();
            investmentsUnsub();
            paymentsUnsub();
            iousUnsub();
        };
    }, []);

    const creditCards = useMemo<CreditCardComputed[]>(() => {
        return paymentMethods
            .filter(method => method.isCreditCard)
            .map((method) => {
                const totalExpenseCharges = expenses
                    .filter(item => item.paymentMethod.id === method.id)
                    .reduce((sum, item) => sum + item.amount, 0);
                const totalInvestmentCharges = investments
                    .filter(item => item.paymentMethod?.id === method.id)
                    .reduce((sum, item) => sum + item.amount, 0);
                const totalCharges = totalExpenseCharges + totalInvestmentCharges;
                const totalPayments = payments
                    .filter(item => item.paymentMethod.id === method.id)
                    .reduce((sum, item) => sum + item.amount, 0);
                const totalRecoveries = ious
                    .filter(item => item.paymentMethod.id === method.id)
                    .reduce((sum, item) => sum + getIouRecoveredAmount(item), 0);
                const liabilityBalance = totalCharges - totalPayments - totalRecoveries;
                const amountUsed = Math.max(liabilityBalance, 0);
                const availableCredit = typeof method.creditLimit === "number"
                    ? method.creditLimit - amountUsed
                    : null;
                const monthlyExpenseCharges = monthKey
                    ? expenses
                        .filter(item => item.monthKey === monthKey && item.paymentMethod.id === method.id)
                        .reduce((sum, item) => sum + item.amount, 0)
                    : 0;
                const monthlyInvestmentCharges = monthKey
                    ? investments
                        .filter(item => item.monthKey === monthKey && item.paymentMethod?.id === method.id)
                        .reduce((sum, item) => sum + item.amount, 0)
                    : 0;
                const monthlyCharges = monthlyExpenseCharges + monthlyInvestmentCharges;
                const monthlyPayments = monthKey
                    ? payments
                        .filter(item => item.monthKey === monthKey && item.paymentMethod.id === method.id)
                        .reduce((sum, item) => sum + item.amount, 0)
                    : 0;
                return {
                    ...method,
                    amountUsed,
                    liabilityBalance,
                    availableCredit,
                    isOverLimit: typeof method.creditLimit === "number"
                        ? amountUsed > method.creditLimit
                        : false,
                    monthlyCharges,
                    monthlyPayments,
                    monthlyNetChange: monthlyCharges - monthlyPayments,
                };
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [expenses, investments, ious, monthKey, paymentMethods, payments]);

    const paymentsByBankAccountId = useMemo<Record<string, number>>(() => {
        return payments.reduce<Record<string, number>>((acc, payment) => {
            acc[payment.bankAccount.id] = (acc[payment.bankAccount.id] ?? 0) + payment.amount;
            return acc;
        }, {});
    }, [payments]);

    const monthlyPaymentsByBankAccountId = useMemo<Record<string, number>>(() => {
        if (!monthKey) {
            return {};
        }

        return payments.reduce<Record<string, number>>((acc, payment) => {
            if (payment.monthKey !== monthKey) {
                return acc;
            }

            acc[payment.bankAccount.id] = (acc[payment.bankAccount.id] ?? 0) + payment.amount;
            return acc;
        }, {});
    }, [monthKey, payments]);

    return {
        loading,
        creditCards,
        payments,
        paymentsByBankAccountId,
        monthlyPaymentsByBankAccountId,
    };
};
