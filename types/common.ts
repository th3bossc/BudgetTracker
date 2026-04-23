export interface MonthlyAggregate {
    month: string;
    total: number;
    auxiliaryTotal?: number;
}

export interface MonthSection<T> {
    monthKey: string;
    label: string;
    total: number;
    count: number;
    items: T[];
}

export interface ExpenseFilters {
    categoryId?: string;
    paymentMethodId?: string;
    amount?: { min: number, max: number };
    date?: { start?: Date, end?: Date };
    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
}

export interface IncomeFilters {
    sourceId?: string;
    amount?: { min: number, max: number };
    date?: { start?: Date, end?: Date };

    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
}

export interface InvestmentFilters {
    typeId?: string;
    amount?: { min: number, max: number };
    date?: { start?: Date, end?: Date };

    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
}

export interface IouFilters {
    paymentMethodId?: string;
    status?: "open" | "paid";
    amount?: { min: number, max: number };
    date?: { start?: Date, end?: Date };

    sortBy?: "amount" | "date";
    sortOrder?: "asc" | "desc";
}
