/* Base interfaces */

export interface BaseDoc {
    id: string;
    createdAt: Date;
}

export interface TimestampedInput {
    createdAt?: Date;
}


/* Categories */
export interface ExpenseCategory extends BaseDoc {
    name: string;
    color: string;
    icon?: string;
    isArchived?: boolean;
}

export interface IncomeSource extends BaseDoc {
    name: string;
    color: string;
    isArchived?: boolean;
}

export enum InvestmentRiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export interface InvestmentType extends BaseDoc {
    name: string;
    riskLevel?: InvestmentRiskLevel;
    isArchived?: boolean;
}

/* base types */
export interface ExpenseCategoryBase {
    name: string;
    color: string;
    icon?: string;
    isArchived?: boolean;
}

export interface IncomeSourceBase {
    name: string;
    color: string;
    isArchived?: boolean;
}

export interface InvestmentTypeBase {
    name: string;
    riskLevel?: InvestmentRiskLevel;
    isArchived?: boolean;
}
export interface ExpenseBase {
    amount: number;
    category: { id: string, name?: string },
    description?: string;
    monthKey: string;
}

export interface IncomeBase {
    amount: number;
    source: { id: string, name?: string },
    description?: string;
    monthKey: string;
}

export interface InvestmentBase {
    name: string;
    type: { id: string, name?: string };
    description?: string;
    amount: number;
    monthKey: string;
}

export interface CategoryBudgetBase {
    category: { id: string, name?: string };
    monthKey: string;
    amount: number;
}

/* main tables */ 
export interface ExpenseCategory extends BaseDoc, ExpenseCategoryBase {};

export interface IncomeSource extends BaseDoc, IncomeSourceBase {};

export interface InvestmentType extends BaseDoc, InvestmentTypeBase {};

export interface Expense extends BaseDoc, ExpenseBase {
    date: Date;
}

export interface Income extends BaseDoc, IncomeBase {
    date: Date;
}

export interface Investment extends BaseDoc, InvestmentBase {
    date: Date;
}

export interface CategoryBudget extends BaseDoc, CategoryBudgetBase {};

