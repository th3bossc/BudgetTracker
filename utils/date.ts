export const getMonthKey = (date: Date): string => {
    const month = date.getMonth();
    const year = date.getFullYear();

    return `${year}-${month}`;
}