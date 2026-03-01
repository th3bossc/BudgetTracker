import PasswordInput from "@/components/forms/password-input";
import Header from "@/components/header";
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
            <Surface style={{ flex: 1, padding: 20, gap: 20, justifyContent: 'center' }}>
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

                <Button mode="contained" onPress={handleRegister}>
                    Create Account
                </Button>
            </Surface>
        </SafeAreaView>
    );
}