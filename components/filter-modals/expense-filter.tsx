import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import {
    Modal,
    Portal,
    TextInput,
    Button,
    Divider,
} from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { useFinanceConfig } from "@/hooks/use-finance-config";

interface Props {
    visible: boolean;
    onDismiss: () => void;
}

export default function ExpenseFiltersModal({
    visible,
    onDismiss,
}: Props) {
    const { categories, paymentMethods } = useFinanceConfig();

    const [minAmount, setMinAmount] = useState<string>('0');
    const [maxAmount, setMaxAmount] = useState<string>('10000');
    const [categoryId, setCategoryId] = useState<string>("");
    const [paymentMethodId, setPaymentMethodId] = useState<string>("");

    const selectCategoryHandler = useCallback((val?: string) => {
        if (!val)
            return;
        setCategoryId(val);
    }, []);

    const selectPaymentMethodHandler = useCallback((val?: string) => {
        if (!val)
            return;
        setPaymentMethodId(val);
    }, []);

    const categoriesOptions = useMemo(() => categories.map(c => ({
        label: c.name,
        value: c.id,
    })), [categories]);

    const paymentMethodOptions = useMemo(() => paymentMethods.map(p => ({
        label: p.name,
        value: p.id,
    })), [paymentMethods])



    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}>
                <View
                    style={{
                        backgroundColor: "white",
                        padding: 20,
                        margin: 20,
                        borderRadius: 12,
                        gap: 20,
                    }}
                >
                    <Dropdown
                        label="Category"
                        value={categoryId}
                        options={categoriesOptions}
                        onSelect={selectCategoryHandler}
                    />

                    <Dropdown
                        label="Payment Method"
                        value={paymentMethodId}
                        options={paymentMethodOptions}
                        onSelect={selectPaymentMethodHandler}
                    />

                    <TextInput
                        label="Min Amount"
                        value={minAmount}
                        onChangeText={setMinAmount}
                        keyboardType="numeric"
                    />

                    <TextInput
                        label="Max Amount"
                        value={maxAmount}
                        onChangeText={setMaxAmount}
                        keyboardType="numeric"
                    />

                    <Divider />

                    <Button mode="contained" onPress={onDismiss}>
                        Apply Filters
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}