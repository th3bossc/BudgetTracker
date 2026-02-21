import type { ExpenseCategory, Expense, Income, IncomeSource, Investment, InvestmentType, PaymentMethod } from "./schema";

export type OmittedKeys = 'id' | 'createdAt';

export type CreateInput<T> = Omit<T, OmittedKeys>;
export type UpdateInput<T> = Partial<Omit<T, OmittedKeys>>;

/* CREATE types */
export type ExpenseCategoryCreateInput = CreateInput<ExpenseCategory>;
export type IncomeSourceCreateInput = CreateInput<IncomeSource>;
export type InvestmentTypeCreateInput = CreateInput<InvestmentType>;
export type PaymentMethodCreateInput = CreateInput<PaymentMethod>;

export type ExpenseCreateInput = CreateInput<Expense>;
export type IncomeCreateInput = CreateInput<Income>;
export type InvestmentCreateInput = CreateInput<Investment>;

/* UPDATE types */
export type ExpenseCategoryUpdateInput = UpdateInput<ExpenseCategory>;
export type IncomeSourceUpdateInput = UpdateInput<IncomeSource>;
export type InvestmentTypeUpdateInput = UpdateInput<InvestmentType>;
export type PaymentMethodUpdateInput = UpdateInput<PaymentMethod>;

export type ExpenseUpdateInput = UpdateInput<Expense>;
export type IncomeUpdateInput = UpdateInput<Income>;
export type InvestmentUpdateInput = UpdateInput<Investment>;