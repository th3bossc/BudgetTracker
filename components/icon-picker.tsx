import { useCallback, useMemo, useState } from "react";
import { View, FlatList, useWindowDimensions } from "react-native";
import {
    Modal,
    Portal,
    TextInput,
    IconButton,
    useTheme,
    Button,
    Icon,
} from "react-native-paper";

const ICON_LIST = [
    "wallet",
    "cash",
    "bank",
    "credit-card",
    "shopping",
    "cart",
    "food",
    "fuel",
    "car",
    "home",
    "movie",
    "gift",
    "chart-line",
    "trending-up",
    "medical-bag",
    "airplane",
];

interface Props {
    icon: string,
    onSelect: (item: string) => void,
}

const ITEM_SIZE = 70;
export default function IconPicker({
    icon,
    onSelect,
}: Props) {
    const [visible, setVisible] = useState<boolean>(false);
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const [search, setSearch] = useState("");

    const filteredIcons = useMemo(() => (
        (search.length > 0)
            ? ICON_LIST.filter(i => i.includes(search.toLowerCase()))
            : ICON_LIST
    ), [search]);

    const numColumns = useMemo(() => Math.max(1, Math.floor(width / ITEM_SIZE)), [width]);

    const showModal = useCallback(() => setVisible(true), []);
    const hideModal = useCallback(() => setVisible(false), []);

    return (
        <>
            <Button
                mode="outlined"
                onPress={showModal}
            >
                Pick Icon <Icon source={icon} size={14} color={theme.colors.primary} />
            </Button>
            <Portal>
                <Modal visible={visible} onDismiss={hideModal}>
                    <View
                        style={{
                            backgroundColor: theme.colors.surface,
                            padding: 16,
                            margin: 16,
                            borderRadius: 12,
                            maxHeight: "80%",
                        }}
                    >
                        <TextInput
                            placeholder="Search icon"
                            value={search}
                            onChangeText={setSearch}
                            mode="outlined"
                            style={{ marginBottom: 12 }}
                        />

                        <FlatList
                            data={filteredIcons}
                            numColumns={numColumns}
                            key={numColumns}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <View style={{ width: ITEM_SIZE, alignItems: "center" }}>
                                    <IconButton
                                        icon={item}
                                        size={28}
                                        onPress={() => {
                                            onSelect(item);
                                            hideModal();
                                        }}
                                    />
                                </View>
                            )}
                        />
                    </View>
                </Modal>
            </Portal>
        </>

    );
}