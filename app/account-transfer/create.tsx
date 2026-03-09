import AccountTransferForm from "@/components/forms/account-transfer-form";
import { addAccountTransfer } from "@/services/account-transfer-service";
import type { AccountTransferCreateInput } from "@/types/create";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Appbar, Surface, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateAccountTransferPage() {
    const router = useRouter();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: AccountTransferCreateInput) => {
        try {
            setLoading(true);
            await addAccountTransfer(data);
            router.back();
        } catch (error) {
            console.error("Create transfer failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Create Transfer" />
            </Appbar.Header>

            <Surface
                style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: theme.colors.background,
                }}
            >
                <AccountTransferForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </Surface>
        </SafeAreaView>
    );
}
