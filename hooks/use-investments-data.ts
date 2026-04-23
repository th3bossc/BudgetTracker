import { useEffect, useMemo, useState } from "react";
import type { InvestmentFilters } from "@/types/common";
import { Investment, InvestmentType } from "@/types/schema";
import { createLookupMap } from "@/utils/create-lookup-map";
import { subscribeToInvestments } from "@/services/investment-service";
import { subscribeToInvestmentTypes } from "@/services/investment-type-service";
import { groupItemsByMonth } from "@/utils/month-utils";

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
    }, [rawInvestments, filters]);

    const aggregateTotal = useMemo(() => {
        return filtered.reduce((sum, investment) => sum + investment.amount, 0);
    }, [filtered]);

    const monthSections = useMemo(() => {
        return groupItemsByMonth(
            filtered,
            investment => investment.monthKey,
            investment => investment.amount,
        );
    }, [filtered]);

    return {
        loading: initialLoding,
        investments: filtered,
        aggregateTotal,
        monthSections,
        typeMap,
    };
};
