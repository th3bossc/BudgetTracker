/* Base interfaces */

export interface BaseDoc {
    id: string;
    createdAt: Date;
}

export interface TimestampedInput {
    createdAt?: Date;
}


/* Categories */
export interface Category extends BaseDoc {
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


/* main tables */ 
export interface Expense extends BaseDoc {
    amount: number;
    cateogry: { id: string, name?: string };
    description?: string;
    date: Date;
    monthKey: string;
}

export interface Income extends BaseDoc {
    amount: number;
    source: { id: string, name?: string };
    date: Date;
    monthKey: string;
}

export interface Investment extends BaseDoc {
    name: string;
    type: { id: string, name?: string };
    amount: number;
    date: Date;
    monthKey: string;
}

