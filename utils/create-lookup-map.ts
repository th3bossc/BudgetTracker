export const createLookupMap = <T extends { id: string }>(
    items: T[]
) => {
    return items.reduce<Record<string, T>>((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});
}