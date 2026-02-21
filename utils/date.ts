export const getMonthKey = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}`;
}