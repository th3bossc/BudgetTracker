import AccountTransferForm from "@/components/forms/account-transfer-form";
import { getAccountTransfers, updateAccountTransfer } from "@/services/account-transfer-service";
import type { AccountTransferUpdateInput } from "@/types/create";
import type { AccountTransfer } from "@/types/schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Appbar, Surface, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditAccountTransferPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();

    const [transfer, setTransfer] = useState<AccountTransfer | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchTransfer = async () => {
            const transfers = await getAccountTransfers();
            const found = transfers.find(item => item.id === id);
            setTransfer(found ?? null);
            setInitialLoading(false);
        };

        if (id) {
            fetchTransfer();
        }
    }, [id]);

    const handleSubmit = async (data: AccountTransferUpdateInput) => {
        try {
            setLoading(true);
            await updateAccountTransfer(id as string, data);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Edit Transfer" />
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
                ) : transfer ? (
                    <AccountTransferForm
                        initialData={transfer}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                ) : null}
            </Surface>
        </SafeAreaView>
    );
}
