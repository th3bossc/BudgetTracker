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

export interface IncomeFilters {
    sourceId?: string;
    minAmount?: number;
    maxAmount?: number;

    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
}

export interface InvestmentFilters {
  typeId?: string;
  minAmount?: number;
  maxAmount?: number;

  sortBy?: "amount" | "date";
  sortOrder?: "asc" | "desc";
}