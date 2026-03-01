import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { Text, useTheme, Button, Portal, Modal, IconButton } from "react-native-paper";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

type Props = {
    data?: { min: number, max: number };
    range?: { min: number, max: number };
    step?: number;
    onChange: (data?: { min: number, max: number }) => void;
};

export default function AmountRangeFilter({
    data,
    range = { min: 0, max: 100000 },
    step = 500,
    onChange,
}: Props) {
    const theme = useTheme();
    const [visible, setVisible] = useState<boolean>(false);
    const values = useMemo(() => {
        if (!data)
            return [range.min, range.max];
        return [data.min, data.max];
    }, [range, data]);

    const showModal = useCallback(() => {
        setVisible(true)
        if (!data) {
            onChange(range);
        }
    }, [onChange, range, data]);
    const hideModal = useCallback(() => setVisible(false), []);

    const filterAmount = useMemo(() => {
        if (!data)
            return 'No filters applied'
        return `₹${data.min} - ₹${data.max}`
    }, [data]);

    const resetFilters = useCallback(() => {
        onChange(undefined);
        hideModal()
    }, [onChange, hideModal]);

    return (
        <>
            <Button
                mode="outlined"
                onPress={showModal}
                style={{ borderRadius: 4 }}
            >
                Filter by amount ({filterAmount})
            </Button>


            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={hideModal}
                    contentContainerStyle={{
                        flex: 1,
                        justifyContent: 'flex-end',
                    }}
                >
                    <View style={{
                        padding: 20,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        backgroundColor: theme.colors.surface,
                        alignItems: 'center',
                        position: 'relative'
                    }}>
                        <Text variant="titleMedium">Amount</Text>

                        <IconButton onPress={hideModal} icon='close' style={{ position: "absolute", top: 8, right: 8 }} />

                        {
                            data &&
                            <>
                                <Text style={{ marginVertical: 8 }}>
                                    ₹{data.min} – ₹{data.max}
                                </Text>

                                <MultiSlider
                                    values={values}
                                    min={range.min}
                                    max={range.max}
                                    step={step}
                                    onValuesChange={(val) => {
                                        onChange({ min: val[0], max: val[1] });
                                    }}
                                    selectedStyle={{
                                        backgroundColor: theme.colors.primary,
                                    }}
                                    markerStyle={{
                                        backgroundColor: theme.colors.primary,
                                        height: 20,
                                        width: 20,
                                    }}
                                    trackStyle={{ height: 4 }}
                                />
                            </>

                        }

                        {/* Presets */}
                        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8, alignItems: 'center', justifyContent: 'center' }}>
                            <Button compact onPress={() => onChange({ min: 0, max: 1000 })}>
                                ≤ ₹1k
                            </Button>
                            <Button compact onPress={() => onChange({ min: 1000, max: 5000 })}>
                                ₹1k–₹5k
                            </Button>
                            <Button compact onPress={() => onChange({ min: 5000, max: 20000 })}>
                                ₹5k–₹20k
                            </Button>
                            <Button compact onPress={() => onChange({ min: 20000, max: 50000 })}>
                                ₹20k–₹50k
                            </Button>
                            <Button compact onPress={() => onChange({ min: 50000, max: 100000 })}>
                                ≥ ₹50k
                            </Button>
                            <Button compact textColor={theme.colors.error} onPress={resetFilters}>
                                All
                            </Button>
                        </View>
                    </View>
                </Modal>
            </Portal>
        </>
    );
}