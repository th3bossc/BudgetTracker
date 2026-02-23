import { subscribeToExpenseCategories } from "@/services/expense-category-service";
import { subscribeToExpenses } from "@/services/expense-service";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";
import { ExpenseFilters } from "@/types/common";
import { Expense, ExpenseCategory, PaymentMethod } from "@/types/schema";
import { createLookupMap } from "@/utils/create-lookup-map";
import { useEffect, useMemo, useState } from "react";

export const useExpensesData = (filters: ExpenseFilters) => {
    const [rawExpenses, setRawExpenses] = useState<Expense[]>([])
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        const expensesUnsub = subscribeToExpenses(setRawExpenses);
        const categoriesUnsub = subscribeToExpenseCategories(setCategories);
        const paymentMethodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        setInitialLoading(false);

        return () => {
            expensesUnsub();
            categoriesUnsub();
            paymentMethodsUnsub();
        }
    }, []);

    const categoriesMap = useMemo(() => createLookupMap(categories), [categories]);
    const paymentMethodsMap = useMemo(() => createLookupMap(paymentMethods), [paymentMethods]);

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

        if (filters.minAmount !== undefined) {
            result = result.filter(
                e => e.amount >= filters.minAmount!
            );
        }

        if (filters.maxAmount !== undefined) {
            result = result.filter(
                e => e.amount <= filters.maxAmount!
            );
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
                    ? a.date.getTime() - b.date.getTime()
                    : b.date.getTime() - a.date.getTime()
            )
        }

        return result;
    }, [rawExpenses, filters]);

    return {
        loading: initialLoading,
        expenses: filteredExpenses,
        categoriesMap,
        paymentMethodsMap,
    };
};