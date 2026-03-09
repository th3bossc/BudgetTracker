import { useEffect, useMemo, useState } from "react";
import { AccountTransfer, BankAccount } from "@/types/schema";
import { subscribeToAccountTransfers } from "@/services/account-transfer-service";
import { subscribeToBankAccounts } from "@/services/bank-account-service";
import { createLookupMap } from "@/utils/create-lookup-map";

export const useAccountTransfersData = () => {
    const [rawTransfers, setRawTransfers] = useState<AccountTransfer[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    useEffect(() => {
        const transfersUnsub = subscribeToAccountTransfers(setRawTransfers);
        const accountsUnsub = subscribeToBankAccounts(setBankAccounts);
        setInitialLoading(false);

        return () => {
            transfersUnsub();
            accountsUnsub();
        };
    }, []);

    const bankAccountsMap = useMemo(() => createLookupMap(bankAccounts), [bankAccounts]);

    const transfers = useMemo(() => {
        return [...rawTransfers].sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [rawTransfers]);

    return {
        loading: initialLoading,
        transfers,
        bankAccountsMap,
    };
};
