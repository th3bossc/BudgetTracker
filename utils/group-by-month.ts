import type { MonthlyAggregate } from "@/types/common";

export const groupByMonth = <
    T extends { monthKey: string; amount: number }
>(
    items: T[]
): MonthlyAggregate[] => {
    const map: Record<string, number> = {};

    items.forEach(item => {
        map[item.monthKey] =
            (map[item.monthKey] || 0) + item.amount;
    });

    return Object.entries(map)
        .map(([month, total]) => ({
            month,
            total,
        }))
        .sort((a, b) => b.month.localeCompare(a.month));
};