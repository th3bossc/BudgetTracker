import { getMonthKey } from "./date";

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