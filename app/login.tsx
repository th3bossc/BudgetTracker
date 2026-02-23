import Header from "@/components/header";
import { useGoogleAuth } from "@/services/auth-service";
import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
    Button,
    HelperText,
    Icon,
    Surface,
    TextInput,
    useTheme,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginPage() {
    const router = useRouter();
    const theme = useTheme();
    const { promptAsync } = useGoogleAuth();


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
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

                
                <Button onPress={() => promptAsync()} style={{ gap: 8 }}>
                    <Icon source="google" size={14} />
                    <Text> Continue with Google </Text>
                </Button>
            </Surface>
        </SafeAreaView>
    );
}