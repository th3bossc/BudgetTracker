import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToIous } from "@/services/iou-service";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";
import type { IouFilters } from "@/types/common";
import type { Expense, Iou, PaymentMethod } from "@/types/schema";
import { createLookupMap } from "@/utils/create-lookup-map";
import { useEffect, useMemo, useState } from "react";

export const useIousData = (filters: IouFilters) => {
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [rawIous, setRawIous] = useState<Iou[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        const iousUnsub = subscribeToIous(setRawIous);
        const expensesUnsub = subscribeToExpenses(setExpenses);
        const paymentMethodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        setInitialLoading(false);

        return () => {
            iousUnsub();
            expensesUnsub();
            paymentMethodsUnsub();
        };
    }, []);

    const expensesMap = useMemo(() => createLookupMap(expenses), [expenses]);
    const paymentMethodsMap = useMemo(() => createLookupMap(paymentMethods), [paymentMethods]);

    const filteredIous = useMemo(() => {
        let result = [...rawIous];

        if (filters.paymentMethodId) {
            result = result.filter(i => i.paymentMethod.id === filters.paymentMethodId);
        }

        if (filters.status === "open") {
            result = result.filter(i => !i.isPaid);
        }

        if (filters.status === "paid") {
            result = result.filter(i => i.isPaid);
        }

        if (filters.amount) {
            result = result.filter(
                i => i.amountLeft >= filters.amount!.min && i.amountLeft <= filters.amount!.max
            );
        }

        if (filters.date) {
            const isInRange = (date: Date) => {
                if (filters.date?.end && date > filters.date.end)
                    return false;
                if (filters.date?.start && date < filters.date.start)
                    return false;

                return true;
            };

            result = result.filter(i => isInRange(i.createdAt));
        }

        if (filters.sortBy === "amount") {
            result.sort((a, b) =>
                filters.sortOrder === "asc"
                    ? a.amountLeft - b.amountLeft
                    : b.amountLeft - a.amountLeft
            );
        }

        if (filters.sortBy === "date") {
            result.sort((a, b) =>
                filters.sortOrder === "asc"
                    ? a.createdAt.getTime() - b.createdAt.getTime()
                    : b.createdAt.getTime() - a.createdAt.getTime()
            );
        }

        return result;
    }, [rawIous, filters]);

    return {
        loading: initialLoading,
        ious: filteredIous,
        expensesMap,
        paymentMethodsMap,
    };
};
