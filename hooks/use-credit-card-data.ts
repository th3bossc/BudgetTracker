import { useEffect, useMemo, useState } from "react";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";
import { subscribeToCreditCardPayments } from "@/services/credit-card-payment-service";
import { CreditCardPayment, Expense, PaymentMethod } from "@/types/schema";

export interface CreditCardComputed extends PaymentMethod {
    amountUsed: number;
    netBalance: number;
    availableCredit: number | null;
    isOverLimit: boolean;
    monthlyCharges: number;
    monthlyPayments: number;
    monthlyNetChange: number;
}

export const useCreditCardData = (monthKey?: string) => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [payments, setPayments] = useState<CreditCardPayment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const methodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        const expensesUnsub = subscribeToExpenses(setExpenses);
        const paymentsUnsub = subscribeToCreditCardPayments(setPayments);
        setLoading(false);

        return () => {
            methodsUnsub();
            expensesUnsub();
            paymentsUnsub();
        };
    }, []);

    const creditCards = useMemo<CreditCardComputed[]>(() => {
        return paymentMethods
            .filter(method => method.isCreditCard)
            .map((method) => {
                const totalCharges = expenses
                    .filter(item => item.paymentMethod.id === method.id)
                    .reduce((sum, item) => sum + item.amount, 0);
                const totalPayments = payments
                    .filter(item => item.paymentMethod.id === method.id)
                    .reduce((sum, item) => sum + item.amount, 0);
                const netBalance = totalCharges - totalPayments;
                const amountUsed = Math.max(netBalance, 0);
                const availableCredit = typeof method.creditLimit === "number"
                    ? method.creditLimit - amountUsed
                    : null;
                const monthlyCharges = monthKey
                    ? expenses
                        .filter(item => item.monthKey === monthKey && item.paymentMethod.id === method.id)
                        .reduce((sum, item) => sum + item.amount, 0)
                    : 0;
                const monthlyPayments = monthKey
                    ? payments
                        .filter(item => item.monthKey === monthKey && item.paymentMethod.id === method.id)
                        .reduce((sum, item) => sum + item.amount, 0)
                    : 0;

                return {
                    ...method,
                    amountUsed,
                    netBalance,
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
    }, [expenses, monthKey, paymentMethods, payments]);

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
