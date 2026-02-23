import { useEffect, useMemo, useState } from "react";
import type { InvestmentFilters } from "@/types/common";
import { Investment, InvestmentType } from "@/types/schema";
import { createLookupMap } from "@/utils/create-lookup-map";
import { subscribeToInvestments } from "@/services/investment-service";
import { subscribeToInvestmentTypes } from "@/services/investment-type-service";

export const useInvestmentsData = (filters: InvestmentFilters) => {
    const [initialLoding, setInitialLoading] = useState<boolean>(true);
    const [rawInvestments, setRawInvestments] = useState<Investment[]>([]);
    const [types, setTypes] = useState<InvestmentType[]>([]);

    useEffect(() => {
        const investmentsUnsub = subscribeToInvestments(setRawInvestments);
        const typesUnsub = subscribeToInvestmentTypes(setTypes);
        setInitialLoading(false);

        return () => {
            investmentsUnsub();
            typesUnsub();
        }
    }, []);

    const typeMap = useMemo(() => createLookupMap(types), [types]);

    const filtered = useMemo(() => {
        let result = [...rawInvestments];

        if (filters.typeId) {
            result = result.filter(
                i => i.type.id === filters.typeId
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
    }, [rawInvestments, filters]);

    return {
        loading: initialLoding,
        investments: filtered,
        typeMap,
    };
};