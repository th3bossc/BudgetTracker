import Header from "@/components/common/header";
import PasswordInput from "@/components/form-fields/password-input";
import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
    Button,
    HelperText,
    Surface,
    TextInput,
    useTheme
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function RegisterPage() {
    const router = useRouter();
    const theme = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.replace("/(tabs)/home");
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Surface style={{ flex: 1, padding: 24, gap: 18, justifyContent: 'center', backgroundColor: theme.colors.background }}>
                <View style={{ marginBottom: 8, gap: 7 }}>
                    <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '800', letterSpacing: 1.4 }}>GET STARTED</Text>
                    <Text variant="headlineMedium" style={{ fontWeight: '800', letterSpacing: -0.8 }}>Build a clearer money picture.</Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>Create an account to start tracking.</Text>
                </View>
                <Header
                    title="Register"
                    flushed
                />

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                />

                <PasswordInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                />

                {error ? (
                    <HelperText type="error">{error}</HelperText>
                ) : null}

                <Button mode="contained" onPress={handleRegister} contentStyle={{ paddingVertical: 7 }}>
                    Create Account
                </Button>
            </Surface>
        </SafeAreaView>
    );
}
