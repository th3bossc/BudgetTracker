import { getMonthKey } from "./date";
import type { MonthSection } from "@/types/common";

export interface MonthOption {
    label: string;
    value: string;
}

export const generateMonthOptions = (
    count: number = 12
): MonthOption[] => {
    const now = new Date();
    const months: MonthOption[] = [];

    for (let i = 0; i < count; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = getMonthKey(date);
        const label = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });

        months.push({
            label,
            value: monthKey,
        });
    }

    return months;
};

export const formatMonthLabel = (monthKey: string): string => {
    const [year, month] = monthKey.split("-");
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (!parsedYear || !parsedMonth) {
        return monthKey;
    }

    return new Date(parsedYear, parsedMonth - 1, 1).toLocaleString("default", {
        month: "long",
        year: "numeric",
    });
};

export const groupItemsByMonth = <T>(
    items: T[],
    getItemMonthKey: (item: T) => string,
    getItemAmount: (item: T) => number,
): MonthSection<T>[] => {
    const sectionsMap = items.reduce<Record<string, MonthSection<T>>>((acc, item) => {
        const monthKey = getItemMonthKey(item);
        if (!monthKey) {
            return acc;
        }

        if (!acc[monthKey]) {
            acc[monthKey] = {
                monthKey,
                label: formatMonthLabel(monthKey),
                total: 0,
                count: 0,
                items: [],
            };
        }

        acc[monthKey].items.push(item);
        acc[monthKey].count += 1;
        acc[monthKey].total += getItemAmount(item);
        return acc;
    }, {});

    return Object.values(sectionsMap)
        .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
};
