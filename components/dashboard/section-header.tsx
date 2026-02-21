import { View } from "react-native";
import { Text, Button } from "react-native-paper";

interface Props {
  title: string;
  onCreate: () => void;
  onViewAll: () => void;
}

export default function SectionHeader({
  title,
  onCreate,
  onViewAll,
}: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      <Text variant="titleMedium">{title}</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button compact onPress={onCreate}>
          Create
        </Button>
        <Button compact onPress={onViewAll}>
          View All
        </Button>
      </View>
    </View>
  );
}