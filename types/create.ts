import type { Category, Expense, Income, IncomeSource, Investment, InvestmentType } from "./schema";

export type OmittedKeys = 'id' | 'createdAt';

export type CreateInput<T> = Omit<T, OmittedKeys>;

export type CategoryCreateInput = CreateInput<Category>;
export type IncomeSourceCreateInput = CreateInput<IncomeSource>;
export type InvestmentTypeCreateInput = CreateInput<InvestmentType>;

export type ExpenseCreateInput = CreateInput<Expense>;
export type IncomeCreateInput = CreateInput<Income>;
export type InvestmentCreateInput = CreateInput<Investment>;