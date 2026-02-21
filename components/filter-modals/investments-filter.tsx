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
import type { InvestmentFilters } from "@/types/common";

interface Props {
    visible: boolean;
    onDismiss: () => void;
    filters: InvestmentFilters;
    setFilters: React.Dispatch<React.SetStateAction<InvestmentFilters>>;
}

export default function InvestmentFiltersModal({
    visible,
    onDismiss,
    filters,
    setFilters,
}: Props) {
    const { investmentTypes } = useFinanceConfig();

    const updateFilter = (key: keyof InvestmentFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    };

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
                        label="Investment Type"
                        value={filters.typeId}
                        options={investmentTypes.map(t => ({
                            label: t.name,
                            value: t.id,
                        }))}
                        onSelect={(val) =>
                            updateFilter("typeId", val)
                        }
                    />

                    <TextInput
                        label="Min Amount"
                        value={filters.minAmount?.toString() ?? ""}
                        onChangeText={(val) =>
                            updateFilter("minAmount", val ? Number(val) : undefined)
                        }
                        keyboardType="numeric"
                    />

                    <TextInput
                        label="Max Amount"
                        value={filters.maxAmount?.toString() ?? ""}
                        onChangeText={(val) =>
                            updateFilter("maxAmount", val ? Number(val) : undefined)
                        }
                        keyboardType="numeric"
                    />

                    <Divider />

                    <Dropdown
                        label="Sort By"
                        value={filters.sortBy}
                        options={[
                            { label: "Amount", value: "amount" },
                            { label: "Date", value: "date" },
                        ]}
                        onSelect={(val) =>
                            updateFilter("sortBy", val)
                        }
                    />

                    <Dropdown
                        label="Sort Order"
                        value={filters.sortOrder}
                        options={[
                            { label: "Descending", value: "desc" },
                            { label: "Ascending", value: "asc" },
                        ]}
                        onSelect={(val) =>
                            updateFilter("sortOrder", val)
                        }
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