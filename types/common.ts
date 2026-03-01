export interface MonthlyAggregate {
    month: string;
    total: number;
}

export interface ExpenseFilters {
    categoryId?: string;
    paymentMethodId?: string;
    amount?: { min: number, max: number };
    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
}

export interface IncomeFilters {
    sourceId?: string;
    amount?: { min: number, max: number };

    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
}

export interface InvestmentFilters {
    typeId?: string;
    amount?: { min: number, max: number };

    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
}