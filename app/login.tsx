import { useGoogleAuth } from "@/services/auth-service";
import Header from "@/components/common/header";
import PasswordInput from "@/components/form-fields/password-input";
import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { View } from "react-native";
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
import Loading from "@/components/common/loading";

export default function LoginPage() {
    const router = useRouter();
    const theme = useTheme();
    const { promptAsync, loading } = useGoogleAuth();


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

    if (loading)
        return <Loading />

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
            <Surface style={{ flex: 1, padding: 24, gap: 18, justifyContent: 'center', backgroundColor: theme.colors.background }}>
                <View style={{ marginBottom: 12, gap: 7 }}>
                    <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '800', letterSpacing: 1.4 }}>MONEY, IN FOCUS</Text>
                    <Text variant="headlineMedium" style={{ fontWeight: '800', letterSpacing: -0.8 }}>Make every month count.</Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>Sign in to see where your money is going.</Text>
                </View>
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

                <Button mode="contained" onPress={handleLogin} contentStyle={{ paddingVertical: 7 }}>
                    Login
                </Button>

                <Button onPress={() => router.push("/register")}>
                    Create Account
                </Button>

                
                <Button mode="outlined" onPress={() => promptAsync()} style={{ borderColor: theme.colors.outlineVariant }} contentStyle={{ paddingVertical: 4 }}>
                    <Icon source="google" size={14} />
                    <Text> Continue with Google </Text>
                </Button>
            </Surface>
        </SafeAreaView>
    );
}
