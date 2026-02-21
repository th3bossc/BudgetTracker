export interface MonthlyAggregate {
    month: string;
    total: number;
}

export interface ExpenseFilters {
    categoryId?: string;
    paymentMethodId?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
}