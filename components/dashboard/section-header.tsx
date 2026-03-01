import { useMemo } from "react";
import { View } from "react-native";
import { Text, Button } from "react-native-paper";

interface Props {
  title: string;
  onCreate?: () => void;
  onViewAll?: () => void;
}

export default function SectionHeader({
  title,
  onCreate,
  onViewAll,
}: Props) {
  const showButtons = useMemo(() => onCreate || onViewAll, [onCreate, onViewAll]);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        margin: 8,
      }}
    >
      <Text variant="headlineSmall">{title}</Text>

      {
        showButtons && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {
              onCreate && 
              <Button compact onPress={onCreate}>
                Create
              </Button>
            }
            {
              onViewAll && (
                <Button compact onPress={onViewAll}>
                  View All
                </Button>
              )
            }
          </View>
        )
      }
    </View>
  );
}