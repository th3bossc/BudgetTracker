const decimalFormatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const toFiniteNumber = (value: number): number => {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return value;
};

export const formatNumber = (value: number): string => {
    return decimalFormatter.format(toFiniteNumber(value));
};

export const formatCurrency = (value: number): string => {
    return `₹ ${formatNumber(value)}`;
};
