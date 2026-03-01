import { Header } from "@react-navigation/elements";
import { ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IousPage() {
    const theme = useTheme();
    return (
        <SafeAreaView style={{
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
        }}>
            <ScrollView style={{ flex: 1 }}>
                <Header
                    title="IOUs"
                />
            </ScrollView>
        </SafeAreaView>
    )
}