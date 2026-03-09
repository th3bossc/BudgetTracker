import BankAccountForm from "@/components/forms/bank-account-form";
import { getBankAccounts, updateBankAccount } from "@/services/bank-account-service";
import type { BankAccountUpdateInput } from "@/types/create";
import type { BankAccount } from "@/types/schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Appbar, Surface, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditBankAccountPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();

    const [account, setAccount] = useState<BankAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchAccount = async () => {
            const accounts = await getBankAccounts();
            const found = accounts.find(item => item.id === id);
            setAccount(found ?? null);
            setInitialLoading(false);
        };

        if (id) {
            fetchAccount();
        }
    }, [id]);

    const handleSubmit = async (data: BankAccountUpdateInput) => {
        try {
            setLoading(true);
            await updateBankAccount(id as string, data);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Edit Bank Account" />
            </Appbar.Header>

            <Surface
                style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: theme.colors.background,
                }}
            >
                {initialLoading ? (
                    <ActivityIndicator />
                ) : account ? (
                    <BankAccountForm
                        initialData={account}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                ) : null}
            </Surface>
        </SafeAreaView>
    );
}
