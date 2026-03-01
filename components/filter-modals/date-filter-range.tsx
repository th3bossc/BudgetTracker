import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { Text, Button, Portal, Modal, useTheme, IconButton } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

type Props = {
    data?: { start?: Date, end?: Date }
    onChange: (data?: { start?: Date, end?: Date }) => void;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB").format(date);
}

export default function DateRangeFilter({ data, onChange }: Props) {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);

    const hideModal = useCallback(() => setVisible(false), []);
    const showModal = useCallback(() => setVisible(true), []);

    const applyPreset = (type: "today" | "month" | "30days") => {
        const now = new Date();
        let start: Date;
        let end: Date = now;

        if (type === "today") {
            start = new Date(now.setHours(0, 0, 0, 0));
        } else if (type === "month") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
            start = new Date();
            start.setDate(start.getDate() - 30);
        }

        onChange({ start, end });
    };

    const filteredDate = useMemo(() => {
        if (data && data.start && data.end)
            return `${formatDate(data.start)} - ${formatDate(data.end)}`
        
        if (data?.start)
            return `After ${formatDate(data.start)}`
        else if (data?.end)
            return `Before ${formatDate(data.end)}`
        return 'Filter by Date'
    }, [data]);

    return (
        <>
            <Button
                mode="outlined"
                onPress={showModal}
            >
                {filteredDate}
            </Button>

            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={hideModal}
                    contentContainerStyle={{
                        flex: 1,
                        justifyContent: 'flex-end'
                    }}
                >
                    <View style={{
                        padding: 20,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        backgroundColor: theme.colors.surface,
                        alignItems: 'center',
                        position: 'relative',
                    }}>
                        <Text variant="titleMedium">Date</Text>

                        <IconButton onPress={hideModal} icon='close' style={{ position: "absolute", top: 8, right: 8 }} />

                        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                            <Button compact onPress={() => applyPreset("today")}>
                                Today
                            </Button>
                            <Button compact onPress={() => applyPreset("month")}>
                                This Month
                            </Button>
                            <Button compact onPress={() => applyPreset("30days")}>
                                Last 30 Days
                            </Button>
                            <Button compact onPress={() => setOpen(true)}>
                                Custom
                            </Button>
                        </View>

                        {data?.start && data?.end && (
                            <Text style={{ marginTop: 8 }}>
                                {filteredDate}
                            </Text>
                        )}

                        <DatePickerModal
                            locale="en"
                            mode="range"
                            visible={open}
                            onDismiss={() => setOpen(false)}
                            startDate={data?.start}
                            endDate={data?.end}
                            onConfirm={({ startDate, endDate }) => {
                                setOpen(false);
                                onChange({ start: startDate, end: endDate });
                            }}
                        />
                    </View>

                </Modal>
            </Portal>
        </>
    );
}