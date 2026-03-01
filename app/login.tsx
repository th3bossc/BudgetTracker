import Header from "@/components/common/header";
import PasswordInput from "@/components/form-fields/password-input";
import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
    Button,
    HelperText,
    Surface,
    TextInput,
    useTheme
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginPage() {
    const router = useRouter();
    const theme = useTheme();

    const [email, setEmail] = useState("test@test.com");
    const [password, setPassword] = useState("test1234");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace("/(tabs)/home");
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Surface style={{ flex: 1, padding: 20, gap: 20, justifyContent: 'center' }}>
                <Header 
                    title="Login"
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

                <Button mode="contained" onPress={handleLogin}>
                    Login
                </Button>

                <Button onPress={() => router.push("/register")}>
                    Create Account
                </Button>
            </Surface>
        </SafeAreaView>
    );
}