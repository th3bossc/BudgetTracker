import { useCallback, useState } from "react";
import { View } from "react-native";
import { Button, Modal, Portal, Text, useTheme } from "react-native-paper";
import ReactNativeWheelColorPicker from 'react-native-wheel-color-picker';

interface Props {
    color: string;
    onSelect: (item: string) => void;
}

export default function ColorPicker({
    color,
    onSelect
}: Props) {
    const [visible, setVisible] = useState<boolean>(false);
    const theme = useTheme();

    const showModal = useCallback(() => setVisible(true), []);
    const hideModal = useCallback(() => setVisible(false), []);

    return (
        <>
            <Button
                mode="outlined"
                onPress={showModal}
            >
                Pick color (<Text style={{ color: color }}> {color} </Text>)
            </Button>

            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={hideModal}
                    contentContainerStyle={{
                        justifyContent: "flex-end",
                        flex: 1,
                    }}
                >
                    <View style={{
                        backgroundColor: theme.colors.surface,
                        padding: 20,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}>
                        <View style={{
                            alignItems: "center",
                            justifyContent: "center",
                            height: 320, // 🔥 controls picker space
                        }}>
                            <ReactNativeWheelColorPicker
                                color={color}
                                onColorChangeComplete={onSelect}
                                thumbSize={30}
                                sliderSize={30}
                                noSnap
                                row={false}
                            />
                        </View>

                        <Button
                            mode="contained"
                            onPress={hideModal}
                            style={{ marginTop: 16, marginHorizontal: 20 }}
                        >
                            Done
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </>
    )
}