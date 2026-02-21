import { useEffect, useMemo, useState } from "react";
import type { IncomeFilters } from "@/types/common";
import { Income, IncomeSource } from "@/types/schema";
import { getIncomes } from "@/services/income-service";
import { getIncomeSources } from "@/services/income-source-service";
import { createLookupMap } from "@/utils/create-lookup-map";

export const useIncomesData = (filters: IncomeFilters) => {
    const [rawIncomes, setRawIncomes] = useState<Income[]>([])
    const [sources, setSources] = useState<IncomeSource[]>([]);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const incomes = await getIncomes();
                const sources = await getIncomeSources();
                setRawIncomes(incomes);
                setSources(sources);
            }
            catch (error) {
                console.error('Error fetching expenses data: ', error);
            }
            finally {
                setInitialLoading(false);
            }
        }

        void fetchData();
    }, []);

    const sourcesMap = useMemo(() => createLookupMap(sources), [sources]);

    const filteredIncomes = useMemo(() => {
        let result = [...rawIncomes];

        if (filters.sourceId) {
            result = result.filter(
                i => i.source.id === filters.sourceId
            );
        }

        if (filters.minAmount !== undefined) {
            result = result.filter(
                i => i.amount >= filters.minAmount!
            );
        }

        if (filters.maxAmount !== undefined) {
            result = result.filter(
                i => i.amount <= filters.maxAmount!
            );
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