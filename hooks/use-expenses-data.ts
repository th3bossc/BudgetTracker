import { subscribeToExpenseCategories } from "@/services/expense-category-service";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToIous } from "@/services/iou-service";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";
import { ExpenseFilters } from "@/types/common";
import { Expense, ExpenseCategory, Iou, PaymentMethod } from "@/types/schema";
import { createLookupMap } from "@/utils/create-lookup-map";
import { getIouOutstandingAmount, getIouRecoveredAmount } from "@/utils/iou";
import { useEffect, useMemo, useState } from "react";

export const useExpensesData = (filters: ExpenseFilters) => {
    const [rawExpenses, setRawExpenses] = useState<Expense[]>([])
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [ious, setIous] = useState<Iou[]>([]);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        const expensesUnsub = subscribeToExpenses(setRawExpenses);
        const categoriesUnsub = subscribeToExpenseCategories(setCategories);
        const paymentMethodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        const iousUnsub = subscribeToIous(setIous);
        setInitialLoading(false);

        return () => {
            expensesUnsub();
            categoriesUnsub();
            paymentMethodsUnsub();
            iousUnsub();
        }
    }, []);

    const categoriesMap = useMemo(() => createLookupMap(categories), [categories]);
    const paymentMethodsMap = useMemo(() => createLookupMap(paymentMethods), [paymentMethods]);
    const expenseRecoveryMap = useMemo(() => {
        return ious.reduce<Record<string, number>>((acc, iou) => {
            const recovered = getIouRecoveredAmount(iou);
            acc[iou.expense.id] = recovered;
            return acc;
        }, {});
    }, [ious]);

    const expenseOutstandingMap = useMemo(() => {
        return ious.reduce<Record<string, number>>((acc, iou) => {
            const outstanding = getIouOutstandingAmount(iou);
            acc[iou.expense.id] = outstanding;
            return acc;
        }, {});
    }, [ious]);

    const filteredExpenses = useMemo(() => {
        let result = [...rawExpenses];

        if (filters.categoryId) {
            result = result.filter(
                e => e.category.id === filters.categoryId
            );
        }

        if (filters.paymentMethodId) {
            result = result.filter(
                e => e.paymentMethod.id === filters.paymentMethodId
            );
        }

        if (filters.amount !== undefined) {
            result = result.filter(
                e => e.amount >= filters.amount!.min && e.amount <= filters.amount!.max 
            );
        }

        if (filters.date !== undefined) {
            const isInRange = (date: Date) => {
                if (filters.date?.end && date > filters.date.end)
                    return false;
                if (filters.date?.start && date < filters.date.start)
                    return false;

                return true;
            }
            result = result.filter(
                e => isInRange(e.date)
            )
        }

        if (filters.sortBy === "amount") {
            result.sort((a, b) =>
                filters.sortOrder === "asc"
                    ? a.amount - b.amount
                    : b.amount - a.amount
            );
        }
        else if (filters.sortBy == 'date') {
            result.sort((a, b) => 
                filters.sortOrder == "desc"
                    ? b.date.getTime() - a.date.getTime()
                    : a.date.getTime() - b.date.getTime()
            )
        }

        return result;
    }, [rawExpenses, filters]);

    return {
        loading: initialLoading,
        expenses: filteredExpenses,
        categoriesMap,
        paymentMethodsMap,
        expenseRecoveryMap,
        expenseOutstandingMap,
    };
};
