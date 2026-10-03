import { useEffect, useState } from "react";
import { subscribeToExpenseCategories } from "@/services/expense-category-service";
import { subscribeToIncomeSources } from "@/services/income-source-service";
import { subscribeToInvestmentTypes } from "@/services/investment-type-service";
import { BankAccount, ExpenseCategory, IncomeSource, InvestmentType, PaymentMethod } from "@/types/schema";
import { subscribeToPaymentMethods } from "@/services/payment-method-service";
import { subscribeToBankAccounts } from "@/services/bank-account-service";

export interface FinanceFilterData {
    loading: boolean;
    categories: ExpenseCategory[];
    incomeSources: IncomeSource[];
    investmentTypes: InvestmentType[];
    paymentMethods: PaymentMethod[];
    bankAccounts: BankAccount[];
    activeCategories: ExpenseCategory[];
    activeIncomeSources: IncomeSource[];
    activeInvestmentTypes: InvestmentType[];
    activePaymentMethods: PaymentMethod[];
    activeBankAccounts: BankAccount[];
}

export const useFinanceConfig = (): FinanceFilterData => {
    const [loading, setLoading] = useState(true);

    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
    const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);



    useEffect(() => {
        const categoriesUnsub = subscribeToExpenseCategories(setCategories);
        const paymentMethodsUnsub = subscribeToPaymentMethods(setPaymentMethods);
        const incomeSourcesUnsub = subscribeToIncomeSources(setIncomeSources);
        const investmentTypesUnsub = subscribeToInvestmentTypes(setInvestmentTypes);
        const bankAccountsUnsub = subscribeToBankAccounts(setBankAccounts);
        setLoading(false);

        return () => {
            categoriesUnsub();
            paymentMethodsUnsub();
            incomeSourcesUnsub();
            investmentTypesUnsub();
            bankAccountsUnsub();
        }
    }, []);

    const sortByNewest = <T extends { createdAt: Date }>(items: T[]) => (
        [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
    const activeOnly = <T extends { isArchived?: boolean }>(items: T[]) => (
        items.filter(item => !item.isArchived)
    );

    const sortedCategories = sortByNewest(categories);
    const sortedIncomeSources = sortByNewest(incomeSources);
    const sortedInvestmentTypes = sortByNewest(investmentTypes);
    const sortedPaymentMethods = sortByNewest(paymentMethods);
    const sortedBankAccounts = sortByNewest(bankAccounts);

    return {
        loading,
        categories: sortedCategories,
        incomeSources: sortedIncomeSources,
        investmentTypes: sortedInvestmentTypes,
        paymentMethods: sortedPaymentMethods,
        bankAccounts: sortedBankAccounts,
        activeCategories: activeOnly(sortedCategories),
        activeIncomeSources: activeOnly(sortedIncomeSources),
        activeInvestmentTypes: activeOnly(sortedInvestmentTypes),
        activePaymentMethods: activeOnly(sortedPaymentMethods),
        activeBankAccounts: activeOnly(sortedBankAccounts),
    };
};
