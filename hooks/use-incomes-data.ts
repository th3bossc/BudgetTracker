import { useEffect, useMemo, useState } from "react";
import type { IncomeFilters } from "@/types/common";
import { Income, IncomeSource } from "@/types/schema";
import { subscribeToIncomes } from "@/services/income-service";
import { subscribeToIncomeSources } from "@/services/income-source-service";
import { createLookupMap } from "@/utils/create-lookup-map";

export const useIncomesData = (filters: IncomeFilters) => {
    const [rawIncomes, setRawIncomes] = useState<Income[]>([])
    const [sources, setSources] = useState<IncomeSource[]>([]);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        const incomesUnsub = subscribeToIncomes(setRawIncomes);
        const sourcesUnsub = subscribeToIncomeSources(setSources);
        setInitialLoading(false);

        return () => {
            incomesUnsub();
            sourcesUnsub();
        }
    }, []);

    const sourcesMap = useMemo(() => createLookupMap(sources), [sources]);

    const filteredIncomes = useMemo(() => {
        let result = [...rawIncomes];

        if (filters.sourceId) {
            result = result.filter(
                i => i.source.id === filters.sourceId
            );
        }

        if (filters.amount !== undefined) {
            result = result.filter(
                e => e.amount >= filters.amount!.min && e.amount <= filters.amount!.max 
            );
        }

        if (filters.date !== undefined) {
            const isInRange = (date: Date) => {
                if (filters.date?.end && date > filters.date.end)
                    return false;
                if (filters.date?.start && date < filters.date.start)
                    return false;

                return true;
            }
            result = result.filter(
                e => isInRange(e.date)
            )
        }

        if (filters.sortBy === "amount") {
            result.sort((a, b) =>
                filters.sortOrder === "asc"
                    ? a.amount - b.amount
                    : b.amount - a.amount
            );
        }

        if (filters.sortBy === "date") {
            result.sort((a, b) =>
                filters.sortOrder === "asc"
                    ? a.date.getTime() - b.date.getTime()
                    : b.date.getTime() - a.date.getTime()
            );
        }

        return result;
    }, [rawIncomes, filters]);

    return {
        loading: initialLoading,
        incomes: filteredIncomes,
        sourcesMap,
    };
};